
import React, { useState, useEffect } from "react";
import { Category, Topic, UserProgress, User } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Clock, Users, BookOpen, Play, CheckCircle, Gem } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Learning() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const categoriesData = await Category.list("order");
      setCategories(categoriesData);
      
      const topicsData = await Topic.list("order");
      setTopics(topicsData);
      
      const progressData = await UserProgress.filter({ user_id: currentUser.id });
      setUserProgress(progressData);
      
      const urlParams = new URLSearchParams(window.location.search);
      const categoryId = urlParams.get('category');
      if (categoryId) {
        const category = categoriesData.find(c => c.id === categoryId);
        if (category) {
          setSelectedCategory(category);
        }
      }
    } catch (error) {
      console.log("数据加载失败");
    }
  };

  const getTopicProgress = (topicId) => {
    return userProgress.find(p => p.topic_id === topicId) || {};
  };

  const filteredTopics = selectedCategory 
    ? topics.filter(topic => topic.category_name === selectedCategory.name)
    : topics;
    
  const getMasteryColor = (level) => {
    const colors = { '未开始': 'bg-gray-100 text-gray-600', '初学': 'bg-blue-100 text-blue-700', '练习中': 'bg-yellow-100 text-yellow-700', '熟练': 'bg-green-100 text-green-700', '精通': 'bg-purple-100 text-purple-700' };
    return colors[level] || colors['未开始'];
  };

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-12 pb-6 px-6">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedCategory(null); navigate(createPageUrl('Learning'))}} className="text-white hover:bg-white/20"> <ChevronLeft className="w-5 h-5" /> </Button>
              <div>
                <h1 className="text-white text-xl font-bold">{selectedCategory.name}</h1>
                <p className="text-blue-100 text-sm">{selectedCategory.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 -mt-2 max-w-sm mx-auto">
          <div className="space-y-4">
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => {
                const progress = getTopicProgress(topic.id);
                const isAdvanced = topic.difficulty === '高级';
                const needsVip = isAdvanced && (!user?.vip_level || user.vip_level === '普通');

                if (needsVip) {
                  return (
                    <Card key={topic.id} className="bg-white shadow-sm opacity-70 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs rounded-bl-lg">
                        VIP专享
                      </div>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-500 mb-1 flex items-center gap-2">
                              {topic.name}
                              <Gem className="w-4 h-4 text-yellow-500" />
                            </h3>
                            <p className="text-sm text-slate-500 mb-2">{topic.description}</p>
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              高级课程
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          onClick={() => navigate(createPageUrl('Membership'))} 
                          className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
                        >
                          <Gem className="w-4 h-4 mr-2" />
                          升级解锁
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={topic.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <h3 className="font-bold text-slate-800 mb-1">{topic.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{topic.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{topic.estimated_time || 30}分钟</div>
                        <Badge variant="outline" className={`text-xs ${getMasteryColor(progress.mastery_level || '未开始')}`}>{progress.mastery_level || '未开始'}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Link to={createPageUrl(`TopicDetail?id=${topic.id}`)} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm"><BookOpen className="w-4 h-4 mr-2" />学习</Button>
                        </Link>
                        {progress.knowledge_learned && (
                          <Link to={createPageUrl(`Training?topic=${topic.id}`)}>
                            <Button variant="outline" size="sm" className="text-orange-600 border-orange-300"><Play className="w-4 h-4 mr-1" />训练</Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="bg-white shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500">该分类下暂无课程</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-12 pb-6 px-6">
        <div className="max-w-sm mx-auto">
          <h1 className="text-white text-2xl font-bold mb-2">学习中心</h1>
          <p className="text-blue-100">选择感兴趣的技能开始学习</p>
        </div>
      </div>
      <div className="px-6 -mt-2 max-w-sm mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => {
            const categoryTopics = topics.filter(t => t.category_name === category.name);
            const completedTopics = categoryTopics.filter(t => getTopicProgress(t.id).mastery_level === '精通').length;
            return (
              <Card key={category.id} className="bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => setSelectedCategory(category)}>
                <CardContent className="p-5 text-center">
                  <div className={`w-14 h-14 ${category.color || 'bg-blue-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}> <span className="text-2xl">{category.icon || '📚'}</span> </div>
                  <h3 className="font-bold text-slate-800 mb-2">{category.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Users className="w-3 h-3" /><span>{categoryTopics.length} 个主题</span>
                    {completedTopics > 0 && (<><span>•</span><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-green-600">{completedTopics} 已精通</span></>)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
