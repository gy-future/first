
import React, { useState, useEffect } from "react";
import { Category, Topic, UserProgress, User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Clock, Target, Trophy, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TrainingHub() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);

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
    } catch (error) {
      console.log("数据加载失败");
    }
  };

  const getTopicProgress = (topicId) => {
    return userProgress.find(p => p.topic_id === topicId) || {};
  };

  const getTrainingStatus = (progress) => {
    if (!progress.knowledge_learned) {
      return { status: "未开始", color: "bg-gray-100 text-gray-600", canTrain: false };
    }
    if (progress.training_count === 0) {
      return { status: "可开始训练", color: "bg-green-100 text-green-700", canTrain: true };
    }
    return { status: `已训练${progress.training_count}次`, color: "bg-blue-100 text-blue-700", canTrain: true };
  };

  const filteredTopics = selectedCategory 
    ? topics.filter(topic => topic.category_name === selectedCategory.name)
    : topics;

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 pt-12 pb-6 px-6">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)} className="text-white hover:bg-white/20">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-white text-xl font-bold">{selectedCategory.name} 训练</h1>
                <p className="text-orange-100 text-sm">挑战自己，提升技能</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 -mt-2 max-w-sm mx-auto">
          <div className="space-y-4">
            {filteredTopics.map((topic) => {
              const progress = getTopicProgress(topic.id);
              const trainingStatus = getTrainingStatus(progress);
              
              return (
                <Card key={topic.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">{topic.name}</h3>
                        <p className="text-sm text-slate-600 mb-2">{topic.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            预计{Math.ceil((topic.estimated_time || 30) / 5)}分钟
                          </div>
                          <Badge className={trainingStatus.color}>
                            {trainingStatus.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {progress.best_score > 0 && (
                          <div className="text-sm font-bold text-orange-600">
                            最高: {progress.best_score}分
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!trainingStatus.canTrain ? (
                        <Link to={createPageUrl(`TopicDetail?id=${topic.id}`)} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            先去学习
                          </Button>
                        </Link>
                      ) : (
                        <Link to={createPageUrl(`Training?topic=${topic.id}`)} className="flex-1">
                          <Button className="w-full bg-orange-600 hover:bg-orange-700" size="sm">
                            <Target className="w-4 h-4 mr-2" />
                            开始训练
                          </Button>
                        </Link>
                      )}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 pt-12 pb-6 px-6">
        <div className="max-w-sm mx-auto">
          <h1 className="text-white text-2xl font-bold mb-2">训练中心</h1>
          <p className="text-orange-100">通过实战训练提升职场技能</p>
        </div>
      </div>
      
      <div className="px-6 -mt-2 max-w-sm mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => {
            const categoryTopics = topics.filter(t => t.category_name === category.name);
            const availableTraining = categoryTopics.filter(t => {
              const progress = getTopicProgress(t.id);
              return progress.knowledge_learned;
            }).length;
            
            return (
              <Card key={category.id} className="bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => setSelectedCategory(category)}>
                <CardContent className="p-5 text-center">
                  <div className={`w-14 h-14 ${category.color || 'bg-orange-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{category.icon || '🎯'}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{category.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Target className="w-3 h-3" />
                    <span>{categoryTopics.length} 个主题</span>
                    {availableTraining > 0 && (
                      <>
                        <span>•</span>
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-600">{availableTraining} 可训练</span>
                      </>
                    )}
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
