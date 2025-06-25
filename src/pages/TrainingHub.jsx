
import React, { useState, useEffect, useMemo } from "react";
import { Category, Topic, UserProgress, User, TrainingSession, Question } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Clock, Target, Trophy, TrendingUp, Zap, Play, Award, Star, Flame, CheckCircle, Mic, BrainCircuit, Map as MapIcon, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// 新组件：训练模块卡片
const TrainingModuleCard = ({ module, topics, userProgress, onTopicTrainClick, isExpanded, onToggle, getTopicProgress, aiTrainingTopics }) => {
  const moduleTopics = topics.filter(t => t.category_name === module.category && t.module_name === module.name);
  
  const finalTopics = moduleTopics.length > 0 ? moduleTopics : 
    (module.topics || []).map((topicName) => ({
      id: `default_topic_${module.category}_${module.name}_${topicName.replace(/\s/g, '_')}`,
      name: topicName,
      category_name: module.category,
      module_name: module.name,
      estimated_time: 30,
      emoji: '🎯'
    }));

  const moduleStats = useMemo(() => {
    const availableForTraining = finalTopics.filter(t => getTopicProgress(t.id, t.name).knowledge_learned).length;
    const totalTrainings = finalTopics.reduce((sum, t) => sum + (getTopicProgress(t.id, t.name).training_count || 0), 0);
    return { availableForTraining, totalTrainings };
  }, [finalTopics, userProgress, getTopicProgress]);

  const trainingProgress = finalTopics.length > 0 ? (finalTopics.filter(t => (getTopicProgress(t.id, t.name).training_count || 0) > 0).length / finalTopics.length) * 100 : 0;
  
  // 找到下一个推荐训练的主题
  const nextTopicToTrain = useMemo(() => {
    const trainableTopics = finalTopics.filter(t => getTopicProgress(t.id, t.name).knowledge_learned);
    return trainableTopics.find(t => (getTopicProgress(t.id, t.name).training_count || 0) === 0) || trainableTopics[0];
  }, [finalTopics, userProgress, getTopicProgress]);

  return (
    <Card className={`transition-all duration-200 ${
      trainingProgress > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white'
    }`}>
      <CardContent className="p-4">
        {/* 模块头部信息 */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            trainingProgress > 0 ? 'bg-orange-500' : 'bg-slate-400'
          }`}>
            <span className="text-xl">{module.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800">{module.name}</h3>
              <Badge className={`text-xs ${
                trainingProgress > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {moduleStats.totalTrainings}次训练
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{module.description}</p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-3">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                trainingProgress > 0 ? 'bg-orange-500' : 'bg-slate-300'
              }`}
              style={{ width: `${Math.max(trainingProgress, 2)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{moduleStats.availableForTraining}/{finalTopics.length} 可训练</span>
            <span>{Math.round(trainingProgress)}% 已开练</span>
          </div>
        </div>
        
        {/* 下一个训练主题 */}
        {nextTopicToTrain ? (
          <div className="mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">下一个：{nextTopicToTrain.name}</span>
              </div>
              <Button 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700 text-white h-6 px-2 text-xs"
                onClick={() => onTopicTrainClick(nextTopicToTrain)}
              >
                训练
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">先去学习解锁训练</span>
              </div>
              <Link to={createPageUrl('Learning')}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 text-xs">去学习</Button>
              </Link>
            </div>
          </div>
        )}

        {/* 展开/收起按钮 */}
        <Button variant="ghost" size="sm" onClick={onToggle} className="w-full justify-center text-slate-600 hover:bg-slate-100">
          {isExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
          {isExpanded ? '收起训练列表' : `查看全部训练 (${finalTopics.length})`}
        </Button>

        {/* 展开的主题列表 */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            {finalTopics.map((topic) => {
              const progress = getTopicProgress(topic.id, topic.name);
              const canTrain = progress.knowledge_learned;
              const isAi = aiTrainingTopics.has(topic.name);
              
              return (
                <div 
                  key={topic.id || topic.name}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    !canTrain ? 'bg-slate-50 opacity-60' : 'bg-white hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isAi ? 'bg-blue-500' : 'bg-orange-500'
                    }`}>
                      {canTrain ? <Play className="w-3 h-3 text-white" /> : <BookOpen className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{topic.name}</p>
                      {progress.training_count > 0 && (
                        <p className="text-xs text-slate-500">训练{progress.training_count}次 · 最高{progress.best_score || 0}分</p>
                      )}
                    </div>
                  </div>
                  
                  {canTrain ? (
                    <Button size="sm" className="h-6 px-2 text-xs" onClick={() => onTopicTrainClick(topic)}>
                      {isAi ? <BrainCircuit className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      训练
                    </Button>
                  ) : (
                    <Link to={createPageUrl(`TopicDetail?id=${topic.name}`)}>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">去学习</Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 新组件：训练分类区域
const TrainingCategorySection = ({ category, modules, topics, userProgress, onTopicTrainClick, expandedModules, onModuleToggle, getTopicProgress, aiTrainingTopics }) => {
  const categoryModules = modules.filter(m => m.category === category.name);
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl shadow-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
          <span className="text-xl">{category.icon}</span>
        </div>
        <div>
          <h2 className="font-bold text-base text-slate-800">{category.name}</h2>
          <p className="text-xs text-slate-500">{category.description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {categoryModules.map(module => (
          <TrainingModuleCard 
            key={`${module.category}_${module.name}`} 
            module={module} 
            topics={topics}
            userProgress={userProgress}
            onTopicTrainClick={onTopicTrainClick}
            isExpanded={expandedModules.has(`${module.category}_${module.name}`)}
            onToggle={() => onModuleToggle(`${module.category}_${module.name}`)}
            getTopicProgress={getTopicProgress}
            aiTrainingTopics={aiTrainingTopics}
          />
        ))}
      </div>
    </div>
  );
};

export default function TrainingHub() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [user, setUser] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [aiTrainingTopics, setAiTrainingTopics] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (selectedModule) {
      loadData();
    }
  }, [selectedModule]);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const [categoriesData, topicsData, progressData, sessionsData, questionsData] = await Promise.all([
        Category.list("order"),
        Topic.list("order"),
        UserProgress.filter({ user_id: currentUser.id }),
        TrainingSession.filter({ user_id: currentUser.id }, '-completion_date', 5),
        Question.list()
      ]);
      
      setCategories(categoriesData);
      setTopics(topicsData);
      setUserProgress(progressData);
      setRecentSessions(sessionsData);

      const aiTopics = new Set(questionsData.filter(q => q.type === 'voice').map(q => q.topic_name));
      setAiTrainingTopics(aiTopics);

      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) setActiveTab(tabParam);

    } catch (error) {
      console.log("数据加载失败", error);
    }
  };

  const getAllModules = () => {
    return [
      { category: '情商', name: '情商识别', description: '识别和理解自己及他人的情绪状态', icon: '🎭', topics: ['情商段位来比拼', '情绪识别训练', '共情能力测试'] },
      { category: '情商', name: '情绪管理', description: '有效管理和调节自己的情绪', icon: '🧘', topics: ['压力管理技巧', '情绪调节策略', '冲突情绪处理'] },
      { category: '情商', name: '社交技能', description: '在人际交往中灵活运用情商', icon: '🤝', topics: ['社交场合应对', '团队情商协作', '领导力情商'] },
      { category: '求职招聘', name: '求职应聘', description: '掌握求职面试的核心技巧和策略', icon: '💼', topics: ['晋升汇报', '面试技巧实战', '简历优化策略', '薪资谈判技巧', '职业规划面谈'] },
      { category: '求职招聘', name: '招聘选人', description: '学会识别和选择合适的人才', icon: '🔍', topics: ['候选人评估', '面试官技能', '人才画像分析', '背景调查方法'] },
      { category: '思维', name: '结构化思维', description: '系统性分析和解决复杂问题', icon: '🧩', topics: ['问题分析框架', 'MECE原则应用', '逻辑思维训练', '决策树分析'] },
      { category: '思维', name: '系统思维', description: '从全局角度思考和处理问题', icon: '🔄', topics: ['系统性思考', '全局视角培养', '因果关系分析', '复杂系统理解'] },
      { category: '思维', name: '创新思维', description: '突破常规的创造性思考方式', icon: '💡', topics: ['创意思维训练', '头脑风暴技巧', '设计思维应用', '创新方法论'] },
      { category: '沟通', name: '协作沟通', description: '在团队协作中进行有效沟通', icon: '👥', topics: ['团队协作技巧', '跨部门沟通', '会议沟通艺术', '项目沟通管理'] },
      { category: '沟通', name: '客户沟通', description: '与客户建立良好的沟通关系', icon: '🎯', topics: ['客户需求洞察', '商务沟通礼仪', '客户关系维护', '投诉处理技巧'] },
      { category: '沟通', name: '向上管理', description: '与上级进行有效沟通的艺术', icon: '⬆️', topics: ['向上管理试炼场', '汇报技巧精进', '上级关系处理', '职场政治智慧'] }
    ];
  };

  const getTopicProgress = useMemo(() => {
    const progressMapByTopicId = new Map(userProgress.map(p => [p.topic_id, p]));
    const topicsByName = new Map(topics.map(t => [t.name, t]));
    const progressTopics = new Map(userProgress.map(p => {
        const topic = topics.find(t => t.id === p.topic_id);
        return topic ? [topic.name, p] : [null, null];
    }).filter(entry => entry[0]));

    return (topicId, topicName) => {
        const progressByName = progressTopics.get(topicName);
        if (progressByName) return progressByName;

        const dbTopic = topicsByName.get(topicName);
        if (dbTopic) {
            const progress = progressMapByTopicId.get(dbTopic.id);
            if (progress) return progress;
        }

        const progressByDirectId = progressMapByTopicId.get(topicId);
        if (progressByDirectId) return progressByDirectId;
        
        return {};
    };
  }, [userProgress, topics]);
  
  const getTrainingStatus = (progress) => {
    if (!progress.knowledge_learned) {
      return { status: "需先学习", color: "bg-gray-100 text-gray-600", canTrain: false };
    }
    if (progress.training_count === 0) {
      return { status: "可开始训练", color: "bg-green-100 text-green-700", canTrain: true };
    }
    return { status: `已训练${progress.training_count}次`, color: "bg-blue-100 text-blue-700", canTrain: true };
  };

  const getModuleTrainingStats = (module) => {
    let moduleTopics = topics.filter(topic => topic.category_name === module.category && topic.module_name === module.name);

    if (moduleTopics.length === 0 && module.topics) {
      moduleTopics = module.topics.map((topicName) => ({
        id: `default_topic_${module.category}_${module.name}_${topicName.replace(/\s/g, '_')}`,
        name: topicName,
        category_name: module.category,
        module_name: module.name
      }));
    }

    const totalTopics = moduleTopics.length;
    const availableForTraining = moduleTopics.filter(topic => getTopicProgress(topic.id, topic.name).knowledge_learned).length;
    const totalTrainings = moduleTopics.reduce((sum, topic) => sum + (getTopicProgress(topic.id, topic.name).training_count || 0), 0);
    const avgScore = totalTopics > 0 ? Math.round(moduleTopics.reduce((sum, topic) => sum + (getTopicProgress(topic.id, topic.name).best_score || 0), 0) / totalTopics) : 0;

    return { totalTopics, availableForTraining, totalTrainings, avgScore };
  };

  const handleModuleToggle = (moduleKey) => {
    setExpandedModules(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(moduleKey)) {
        newExpanded.delete(moduleKey);
      } else {
        newExpanded.add(moduleKey);
      }
      return newExpanded;
    });
  };

  const handleTopicTrainClick = (topic) => {
    navigate(createPageUrl(`Training?topic=${topic.name}`));
  };

  if (selectedModule) {
    let moduleTopics = topics.filter(topic => 
      topic.category_name === selectedModule.category && 
      topic.module_name === selectedModule.name
    );

    if (moduleTopics.length === 0 && selectedModule.topics) {
      moduleTopics = selectedModule.topics.map((topicName) => {
        const foundTopic = topics.find(t => t.name === topicName);
        return foundTopic || {
          id: `default_topic_${selectedModule.category}_${selectedModule.name}_${topicName.replace(/\s/g, '_')}`,
          name: topicName,
          description: `${topicName}的训练内容`,
          category_name: selectedModule.category,
          module_name: selectedModule.name,
          estimated_time: 30
        };
      });
    }

    const moduleStats = getModuleTrainingStats(selectedModule);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 pt-8 pb-6 px-4">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedModule(null)} className="text-white hover:bg-white/20">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 text-white text-xs">{selectedModule.category}</Badge>
                </div>
                <h1 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">{selectedModule.icon}</span>
                  {selectedModule.name} 训练
                </h1>
                <p className="text-orange-100 text-sm">挑战自己，提升技能</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold">{moduleStats.availableForTraining}</div>
                <div className="text-orange-200 text-xs">可训练</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold">{moduleStats.totalTrainings}</div>
                <div className="text-orange-200 text-xs">总训练</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold">{moduleStats.avgScore}</div>
                <div className="text-orange-200 text-xs">平均分</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 -mt-2 max-w-sm mx-auto pb-8">
          <div className="space-y-3">
            {moduleTopics.map((topic) => {
              const progress = getTopicProgress(topic.id, topic.name);
              const trainingStatus = getTrainingStatus(progress);
              const isAiTopic = aiTrainingTopics.has(topic.name);
              
              return (
                <Card key={topic.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAiTopic ? 'bg-gradient-to-br from-blue-100 to-purple-200' : 'bg-gradient-to-br from-orange-100 to-red-100'}`}>
                        {isAiTopic ? <Mic className="w-5 h-5 text-blue-600" /> : <Target className="w-5 h-5 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">{topic.name}
                            {isAiTopic && <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs"><Zap className="w-3 h-3 mr-1"/>AI训练</Badge>}
                          </h3>
                          <Badge className={`text-xs ${trainingStatus.color}`}>
                            {trainingStatus.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{topic.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            预计{Math.ceil((topic.estimated_time || 30) / 5)}分钟
                          </div>
                          {progress.best_score > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              最高{progress.best_score}分
                            </div>
                          )}
                          {progress.training_count > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {progress.training_count}次训练
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {!trainingStatus.canTrain ? (
                            <Link to={createPageUrl(`TopicDetail?id=${topic.name}`)} className="flex-1">
                              <Button variant="outline" className="w-full" size="sm">
                                先去学习
                              </Button>
                            </Link>
                          ) : (
                            <Link to={createPageUrl(`Training?topic=${topic.name}`)} className="flex-1">
                              <Button className={`w-full ${isAiTopic ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90' : 'bg-orange-600 hover:bg-orange-700'}`} size="sm">
                                {isAiTopic ? <BrainCircuit className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                {isAiTopic ? '开始AI训练' : '开始训练'}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
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

  const allModules = getAllModules();
  const sortedModules = [...allModules].sort((a, b) => {
    const aHasAi = a.topics.some(topicName => aiTrainingTopics.has(topicName));
    const bHasAi = b.topics.some(topicName => aiTrainingTopics.has(topicName));
    if (aHasAi && !bHasAi) return -1;
    if (!aHasAi && bHasAi) return 1;
    return 0;
  });

  const filteredModules = activeTab === "all" ? sortedModules : 
                         activeTab === "ai" ? sortedModules.filter(m => m.topics.some(topicName => aiTrainingTopics.has(topicName))) :
                         sortedModules.filter(m => m.category === activeTab);

  const totalStats = allModules.reduce((acc, module) => {
    const stats = getModuleTrainingStats(module);
    return {
      totalTopics: acc.totalTopics + stats.totalTopics,
      availableForTraining: acc.availableForTraining + stats.availableForTraining,
      totalTrainings: acc.totalTrainings + stats.totalTrainings,
      totalScoreSum: acc.totalScoreSum + stats.avgScore
    };
  }, { totalTopics: 0, availableForTraining: 0, totalTrainings: 0, totalScoreSum: 0 });
  
  totalStats.avgScore = allModules.length > 0 ? Math.round(totalStats.totalScoreSum / allModules.length) : 0;

  const recommendedModule = sortedModules.find(module => getModuleTrainingStats(module).availableForTraining > 0);

  const categoryDefinitions = [
    { name: '情商', icon: '🎭', description: '情绪识别、管理与社交技能' },
    { name: '求职招聘', icon: '💼', description: '求职应聘与人才筛选' },
    { name: '思维', icon: '🧩', description: '结构化、系统与创新思维' },
    { name: '沟通', icon: '💬', description: '团队协作、客户沟通与向上管理' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 pt-8 pb-4 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-xl font-bold mb-1">训练中心</h1>
          <p className="text-orange-100 text-sm">通过实战训练提升职场技能</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-white font-bold text-base">{totalStats.availableForTraining}</div>
              <div className="text-orange-200 text-xs">可训练</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-white font-bold text-base">{totalStats.totalTrainings}</div>
              <div className="text-orange-200 text-xs">总训练</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-white font-bold text-base">{totalStats.avgScore}</div>
              <div className="text-orange-200 text-xs">平均分</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 -mt-1 max-w-md mx-auto pb-8">
        {recommendedModule && totalStats.availableForTraining > 0 && (
          <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white mb-3 shadow-md">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{recommendedModule.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-orange-100 flex items-center gap-1">
                      <Flame className="w-3 h-3"/> 推荐训练
                    </span>
                  </div>
                  <h3 className="font-bold text-sm truncate">{recommendedModule.name}</h3>
                </div>
                <Button 
                  size="sm" 
                  className="bg-white text-orange-600 hover:bg-orange-50 px-3 py-1.5 h-auto text-xs flex-shrink-0"
                  onClick={() => setSelectedModule(recommendedModule)}
                >
                  开始
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-3">
          <TabsList className="grid w-full grid-cols-6 bg-white/70 backdrop-blur-sm h-8">
            <TabsTrigger value="all" className="text-xs px-1 flex items-center gap-1"><MapIcon className="w-3 h-3"/>训练地图</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs px-1 text-blue-600 font-bold flex items-center gap-1"><span className="text-xs">🤖</span>AI</TabsTrigger>
            <TabsTrigger value="情商" className="text-xs px-1 flex items-center gap-1"><span className="text-xs">🧠</span>情商</TabsTrigger>
            <TabsTrigger value="求职招聘" className="text-xs px-1 flex items-center gap-1"><span className="text-xs">💼</span>求职</TabsTrigger>
            <TabsTrigger value="思维" className="text-xs px-1 flex items-center gap-1"><span className="text-xs">🧩</span>思维</TabsTrigger>
            <TabsTrigger value="沟通" className="text-xs px-1 flex items-center gap-1"><span className="text-xs">💬</span>沟通</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'all' ? (
          <div className="space-y-4">
            {categoryDefinitions.map(category => (
              <TrainingCategorySection
                key={category.name}
                category={category}
                modules={sortedModules}
                topics={topics}
                userProgress={userProgress}
                onTopicTrainClick={handleTopicTrainClick}
                expandedModules={expandedModules}
                onModuleToggle={handleModuleToggle}
                getTopicProgress={getTopicProgress}
                aiTrainingTopics={aiTrainingTopics}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredModules.map((module) => {
              const moduleStats = getModuleTrainingStats(module);
              const hasTrainings = moduleStats.totalTrainings > 0;
              const isHighScorer = moduleStats.avgScore >= 80 && hasTrainings;
              const hasAiTraining = module.topics.some(topicName => aiTrainingTopics.has(topicName));
              
              return (
                <Card 
                  key={`${module.category}_${module.name}`} 
                  className={`bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
                    hasAiTraining ? 'ring-2 ring-blue-200 bg-gradient-to-r from-blue-50 to-purple-50' :
                    isHighScorer ? 'ring-1 ring-yellow-200 bg-yellow-50' : 
                    hasTrainings ? 'ring-1 ring-orange-200 bg-orange-50' : ''
                  }`}
                  onClick={() => setSelectedModule(module)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative flex-shrink-0 ${
                        hasAiTraining ? 'bg-gradient-to-br from-blue-100 to-purple-200' :
                        isHighScorer ? 'bg-gradient-to-br from-yellow-100 to-orange-200' :
                        hasTrainings ? 'bg-gradient-to-br from-orange-100 to-red-200' :
                        'bg-gradient-to-br from-slate-100 to-slate-200'
                      }`}>
                        <span className="text-lg">{module.icon}</span>
                        {isHighScorer && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{module.name}</h3>
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">{module.category}</Badge>
                          {hasAiTraining && (
                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-1.5 py-0.5 font-bold animate-pulse"><BrainCircuit className="w-3 h-3 mr-1"/>AI训练</Badge>
                          )}
                          {isHighScorer && (
                            <Badge className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5">高分达人</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-2 line-clamp-1">{module.description}</p>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-500">
                              <span>{moduleStats.totalTopics}主题</span>
                              {moduleStats.availableForTraining > 0 && (
                                <span className="text-orange-600 font-medium">
                                  {moduleStats.availableForTraining}可训练
                                </span>
                              )}
                              {moduleStats.totalTrainings > 0 && (
                                <span className="text-blue-600 font-medium">
                                  {moduleStats.totalTrainings}次训练
                                </span>
                              )}
                            </div>
                            {moduleStats.avgScore > 0 && (
                              <div className="flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-yellow-500" />
                                <span className="text-slate-600 font-bold text-xs">{moduleStats.avgScore}分</span>
                              </div>
                            )}
                          </div>
                          
                          {moduleStats.totalTopics > 0 && (
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  hasAiTraining ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                                  isHighScorer ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                  hasTrainings ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                  'bg-gradient-to-r from-blue-400 to-blue-500'
                                }`}
                                style={{ width: `${Math.max((moduleStats.availableForTraining / moduleStats.totalTopics) * 100, (moduleStats.totalTrainings > 0 ? (moduleStats.totalTrainings / moduleStats.totalTopics) : 0) * 100, (moduleStats.totalTopics === moduleStats.availableForTraining ? 100 : 0))}%` }}
                              />
                            </div>
                          )}
                          
                          <div className="text-xs">
                            {moduleStats.availableForTraining === 0 && moduleStats.totalTopics > 0 ? (
                              <span className="text-slate-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-slate-500" /> 需要先完成学习</span>
                            ) : moduleStats.totalTrainings === 0 && moduleStats.availableForTraining > 0 ? (
                              <span className="text-orange-600 font-medium flex items-center gap-1"><Play className="w-3 h-3" /> 可以开始训练了</span>
                            ) : isHighScorer ? (
                              <span className="text-yellow-600 font-medium flex items-center gap-1"><Star className="w-3 h-3" /> 训练表现优秀</span>
                            ) : hasTrainings ? (
                              <span className="text-orange-600 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 训练进行中</span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> 暂无训练数据</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {totalStats.availableForTraining === 0 && totalStats.totalTopics > 0 && (
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white mt-4">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base mb-1">📚 先去学习吧！</h3>
              <p className="text-blue-100 text-sm mb-3">完成学习后就能开始训练了</p>
              <Button 
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => navigate(createPageUrl('Learning'))}
              >
                去学习中心
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
