
import React, { useState, useEffect } from "react";
import { Category, UserProgress, User, TrainingSession, Topic, Question } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { t } from "@/components/i18n";
import { ChevronRight, TrendingUp, Award, Target, BookOpen, Play, Flame, CheckCircle, Star, Trophy, Zap, BrainCircuit, Mic, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Corrected import statement
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [dailyGoalCompleted, setDailyGoalCompleted] = useState(0);
  const [weeklyTraining, setWeeklyTraining] = useState(0);
  const [stats, setStats] = useState({ totalTraining: 0, averageAccuracy: 0, masteredTopics: 0 });
  const [nextAction, setNextAction] = useState(null);
  const [dailyTip, setDailyTip] = useState('');
  const [aiTrainingTopics, setAiTrainingTopics] = useState(new Set());
  const DAILY_GOAL = 1;
  const WEEKLY_GOAL = 5;

  useEffect(() => {
    loadData();
    generateDailyTip();
    window.addEventListener('focus', loadData);
    return () => {
      window.removeEventListener('focus', loadData);
    };
  }, []);

  const generateDailyTip = () => {
    const tips = [
      t('home.dailyTips.tip1'),
      t('home.dailyTips.tip2'),
      t('home.dailyTips.tip3'),
      t('home.dailyTips.tip4'),
      t('home.dailyTips.tip5'),
      t('home.dailyTips.tip6'),
      t('home.dailyTips.tip7'),
      t('home.dailyTips.tip8')
    ];
    const today = new Date().toDateString();
    const hash = today.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % tips.length;
    setDailyTip(tips[index]);
  };

  const loadData = async () => {
    try {
      let currentUser = await User.me();
      
      if (typeof currentUser.lingdou_balance === 'undefined' || currentUser.lingdou_balance === null) {
        await User.updateMyUserData({ 
          lingdou_balance: 5, 
          total_lingdou_used: 0,
          points_balance: 0,
          total_points_earned: 0
        });
        currentUser = await User.me();
      }
      setUser(currentUser);
      
      const [categoriesData, progressData, allTopics, allSessions, questionsData] = await Promise.all([
        Category.list("order"),
        UserProgress.filter({ user_id: currentUser.id }, '-updated_date'),
        Topic.list(),
        TrainingSession.filter({ user_id: currentUser.id }),
        Question.list()
      ]);
      setCategories(categoriesData);

      // Identify AI training topics
      const aiTopics = new Set(
        questionsData.filter(q => q.type === 'voice').map(q => q.topic_name)
      );
      setAiTrainingTopics(aiTopics);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaySessions = allSessions.filter(s => s.completion_date?.startsWith(today)).length;
      setDailyGoalCompleted(todaySessions);

      // 计算本周训练次数
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); 
      const weekStart = format(startOfWeek, 'yyyy-MM-dd');
      const weekSessions = allSessions.filter(s => s.completion_date >= weekStart).length;
      setWeeklyTraining(weekSessions);

      // --- 计算核心统计数据 ---
      const totalTraining = progressData.reduce((sum, p) => sum + (p.training_count || 0), 0);
      const accuracySum = progressData.reduce((sum, p) => sum + (p.accuracy_rate || 0), 0);
      const averageAccuracy = progressData.length ? Math.round(accuracySum / progressData.length) : 0;
      const masteredTopics = progressData.filter(p => p.mastery_level === '精通').length;
      setStats({ totalTraining, averageAccuracy, masteredTopics });

      // --- 智能推荐下一个动作 ---
      let action = null;
      // 1. 查找是否有未完成学习的主题
      const unfinishedLearning = progressData.find(p => !p.knowledge_learned);
      if (unfinishedLearning) {
        const topic = allTopics.find(t => t.id === unfinishedLearning.topic_id);
        if (topic) {
          action = { type: 'learn', topicId: topic.id, title: t('home.continueLearning'), subtitle: topic.name, buttonText: t('home.learn'), icon: BookOpen };
        }
      }

      // 2. 如果没有，查找是否有已学习但从未训练的主题
      if (!action) {
        const readyForTraining = progressData.find(p => p.knowledge_learned && (p.training_count || 0) === 0);
        if (readyForTraining) {
          const topic = allTopics.find(t => t.id === readyForTraining.topic_id);
          if (topic) {
            action = { type: 'train', topicId: topic.id, title: t('home.startTraining'), subtitle: topic.name, buttonText: t('home.start'), icon: Play };
          }
        }
      }
      
      // 3. 如果没有，推荐继续训练最近的那个主题
      if (!action && progressData.length > 0) {
        const latestProgress = progressData[0];
        const topic = allTopics.find(t => t.id === latestProgress.topic_id);
        if (topic) {
           action = { type: 'train', topicId: topic.id, title: t('home.continueTraining'), subtitle: topic.name, buttonText: t('home.start'), icon: Play };
        }
      }

      // 4. 如果是全新用户，推荐学习第一个主题
      if (!action) {
        const firstTopic = allTopics.sort((a,b) => (a.order || 99) - (b.order || 99))[0];
        if (firstTopic) {
          action = { type: 'learn', topicId: firstTopic.id, title: '开启职场成长之路', subtitle: firstTopic.name, buttonText: t('home.learn'), icon: BookOpen };
        }
      }
      setNextAction(action);

    } catch (error) {
      console.log("用户未登录或数据加载失败", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting.morning');
    if (hour < 18) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* --- 今日行动面板 --- */}
      <div className="bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 pt-8 pb-2 px-4 relative overflow-hidden">
        <div className="max-w-md mx-auto">
          {/* 问候语 - 优化显示效果 */}
          <div className="mb-1.5">
            <h1 className="text-white text-lg font-bold mb-1 flex items-center gap-1">
              {getGreeting()}{user?.full_name?.split(' ')[0] || t('home.student')}
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-white/90 text-sm leading-relaxed">{dailyTip}</p>
          </div>

          {/* 核心行动卡片 - 精简版 */}
          {nextAction && (
            <Card className="bg-white shadow-lg mb-1.5 border-0">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                    <nextAction.icon className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-medium text-blue-700">{nextAction.title}</p>
                      <Link to={createPageUrl(nextAction.type === 'learn' ? `TopicDetail?id=${nextAction.topicId}` : `Training?topic=${nextAction.topicId}`)}>
                        <Button className="bg-blue-600 hover:bg-blue-700 px-2 py-0.5 h-auto text-xs">
                          {nextAction.buttonText}
                        </Button>
                      </Link>
                    </div>
                    <Link to={createPageUrl(nextAction.type === 'learn' ? `TopicDetail?id=${nextAction.topicId}` : `Training?topic=${nextAction.topicId}`)}>
                      <p className="font-bold text-slate-800 truncate text-sm hover:text-blue-600 transition-colors">{nextAction.subtitle}</p>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 训练目标 - 精简版 */}
          <Card className="bg-white/25 backdrop-blur-sm border border-white/40">
            <CardContent className="p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-300" />
                  <span className="text-white font-medium text-xs">今日 {dailyGoalCompleted}/{DAILY_GOAL} · 本周 {weeklyTraining}/{WEEKLY_GOAL}</span>
                </div>
                <span className="text-xs text-white/80">
                  {dailyGoalCompleted >= DAILY_GOAL ? '✅ 达标' : weeklyTraining >= WEEKLY_GOAL ? '🔥 周达标' : '💪 加油'}
                </span>
              </div>
              
              {/* 双进度条 - 紧凑版 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/90 w-8">今日</span>
                  <div className="flex-1 h-1 bg-white/40 rounded-full">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-1 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((dailyGoalCompleted / DAILY_GOAL) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/90 w-8">本周</span>
                  <div className="flex-1 h-1 bg-white/40 rounded-full">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-indigo-400 h-1 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((weeklyTraining / WEEKLY_GOAL) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 max-w-md mx-auto pt-2.5 pb-8 space-y-4">

        {/* --- AI训练特色区块 (统一背景样式) --- */}
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-100 rounded-full opacity-60"></div>
          <div className="absolute -top-1 -right-3 w-4 h-4 bg-purple-100 rounded-full opacity-70"></div>
          
          <Card className="bg-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
            
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-xl">🎯</span>
                  <h3 className="text-base font-black text-slate-800">AI智能训练</h3>
                </div>
                <Badge className="bg-blue-500 text-white text-xs font-bold">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI驱动
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 mb-3 font-medium">
                🚀 AI实时分析你的回答，提供个性化指导
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <Link to={createPageUrl("TopicDetail?id=晋升汇报")}>
                  <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 border-0">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-white" />
                        <div>
                          <h4 className="font-bold text-sm text-white">晋升汇报AI训练</h4>
                          <p className="text-xs text-blue-100">AI分析你的表达能力</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-white/25 text-white text-xs font-bold">
                          🔥 热门
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link to={createPageUrl("TopicDetail?id=情商段位来比拼")}>
                    <Card className="bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 border-0">
                      <CardContent className="p-2 text-center">
                        <Mic className="w-4 h-4 text-white mx-auto mb-1" />
                        <h4 className="font-bold text-xs text-white">情商AI测试</h4>
                        <p className="text-xs text-blue-100 mt-1">智能情商评估</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to={createPageUrl("TrainingHub?tab=ai")}>
                    <Card className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 border-0">
                      <CardContent className="p-2 text-center">
                        <Zap className="w-4 h-4 text-white mx-auto mb-1" />
                        <h4 className="font-bold text-xs text-white">更多AI训练</h4>
                        <p className="text-xs text-purple-100 mt-1">探索全部AI功能</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500">
                  <span className="text-blue-600 font-semibold">AI技术驱动</span> 让训练更智能更有效
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- 1. 我的成长足迹 (激励) --- */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-2">我的成长足迹</h2>
          <div className="space-y-3">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="font-bold text-slate-800 text-base">{stats.totalTraining}</p>
                    <p className="text-xs text-slate-500">{t('home.totalTraining')}</p>
                  </div>
                  <div>
                    <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="font-bold text-slate-800 text-base">{stats.averageAccuracy}%</p>
                    <p className="text-xs text-slate-500">{t('home.avgAccuracy')}</p>
                  </div>
                  <div>
                    <Award className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="font-bold text-slate-800 text-base">{stats.masteredTopics}</p>
                    <p className="text-xs text-slate-500">{t('home.masteredTopics')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to={createPageUrl('Leaderboard')}>
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-shadow border-0">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <div>
                      <h3 className="font-medium">挑战英雄榜</h3>
                      <p className="text-xs text-blue-100">看看你的全国排名</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-200" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
        
        {/* --- 2. 热门主题 (优化配色) --- */}
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-100 rounded-full opacity-60"></div>
          <div className="absolute -top-1 -right-3 w-4 h-4 bg-red-100 rounded-full opacity-70"></div>
          
          <Card className="bg-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
            
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-xl animate-pulse">🔥</span>
                  <h3 className="text-base font-black text-slate-800">热门主题</h3>
                </div>
                <Badge className="bg-orange-500 text-white text-xs font-bold">
                  必学
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 mb-3 font-medium">
                🔥 精选职场必修课，助你快速进阶
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <Link to={createPageUrl("TopicDetail?id=晋升汇报")}>
                  <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 border-0">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💼</span>
                        <div>
                          <h4 className="font-bold text-sm">晋升汇报</h4>
                          <p className="text-xs text-orange-100">升职必备技能</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-white/25 text-white text-xs">
                          🔥 HOT
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link to={createPageUrl("TopicDetail?id=情商段位来比拼")}>
                    <Card className="bg-gradient-to-r from-orange-400 to-red-400 text-white hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 border-0">
                      <CardContent className="p-2 text-center">
                        <span className="text-base">🧠</span>
                        <h4 className="font-bold text-xs mt-1">情商段位来比拼</h4>
                        <p className="text-xs text-orange-100 mt-1">测试你的情商</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to={createPageUrl("TopicDetail?id=向上管理试炼场")}>
                    <Card className="bg-gradient-to-r from-red-400 to-pink-400 text-white hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 border-0">
                      <CardContent className="p-2 text-center">
                        <span className="text-base">⚡</span>
                        <h4 className="font-bold text-xs mt-1">向上管理试炼场</h4>
                        <p className="text-xs text-red-100 mt-1">搞定你的老板</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500">
                  <span className="text-orange-600 font-semibold">2.3万人</span> 本周已开始学习
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- 3. 技能分类 (探索) - 统一蓝紫色系 --- */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">技能分类</h2>
            <Link to={createPageUrl("Learning")} className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors flex items-center gap-1">
              查看全部
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to={createPageUrl("Learning?tab=情商")}>
              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border-0 bg-white group shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">🧠</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">情商</h3>
                  <p className="text-xs text-slate-600 line-clamp-1 mb-2">情绪管理与人际沟通</p>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-slate-500">3个模块</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl("Learning?tab=求职招聘")}>
              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border-0 bg-white group shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">💼</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">求职招聘</h3>
                  <p className="text-xs text-slate-600 line-clamp-1 mb-2">面试技巧与人才选拔</p>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-slate-500">2个模块</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl("Learning?tab=思维")}>
              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border-0 bg-white group shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">🧩</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">思维</h3>
                  <p className="text-xs text-slate-600 line-clamp-1 mb-2">逻辑思维与问题解决</p>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-slate-500">3个模块</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl("Learning?tab=沟通")}>
              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border-0 bg-white group shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">💬</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">沟通</h3>
                  <p className="text-xs text-slate-600 line-clamp-1 mb-2">团队协作与客户服务</p>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-slate-500">3个模块</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

