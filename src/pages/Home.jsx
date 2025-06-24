
import React, { useState, useEffect } from "react";
import { Category, UserProgress, User, TrainingSession } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, Clock, TrendingUp, Award, Target, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalTraining: 0,
    averageAccuracy: 0,
    masteredTopics: 0,
    dailyGoalCompleted: 0,
  });
  const DAILY_GOAL = 1; // 每日目标训练次数

  useEffect(() => {
    loadData();
    // 添加事件监听器，当窗口重新获得焦点时刷新数据
    window.addEventListener('focus', loadData);
    return () => {
      window.removeEventListener('focus', loadData);
    };
  }, []);

  const loadData = async () => {
    try {
      let currentUser = await User.me();
      
      // 为没有灵豆的老用户进行一次性初始化
      if (typeof currentUser.lingdou_balance === 'undefined' || currentUser.lingdou_balance === null) {
        await User.updateMyUserData({ lingdou_balance: 5, total_lingdou_used: 0 });
        // 重新获取用户信息以确保数据最新
        currentUser = await User.me();
      }
      
      setUser(currentUser);
      
      const categoriesData = await Category.list("order");
      setCategories(categoriesData);
      
      const progressData = await UserProgress.filter({ user_id: currentUser.id });
      
      // 计算统计数据
      const totalTraining = progressData.reduce((sum, p) => sum + (p.training_count || 0), 0);
      const accuracySum = progressData.reduce((sum, p) => sum + (p.accuracy_rate || 0), 0);
      const averageAccuracy = progressData.length ? Math.round(accuracySum / progressData.length) : 0;
      const masteredTopics = progressData.filter(p => p.mastery_level === '精通').length;

      // 获取今天的训练记录来计算每日目标
      const today = format(new Date(), 'yyyy-MM-dd');
      const allSessions = await TrainingSession.filter({ user_id: currentUser.id });
      const todaySessions = allSessions.filter(s => s.completion_date?.startsWith(today)).length;
      
      setStats({
        totalTraining,
        averageAccuracy,
        masteredTopics,
        dailyGoalCompleted: todaySessions
      });
    } catch (error) {
      console.log("用户未登录或数据加载失败", error);
      // Optionally handle specific errors, e.g., redirect to login if User.me() fails due to auth
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 顶部问候区域 */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 pt-12 pb-8 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-2xl font-bold mb-1">
                {getGreeting()}，{user?.full_name || '学员'}
              </h1>
              <p className="text-blue-100 text-sm">今天也要好好学习哦！</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {user?.full_name?.charAt(0) || '学'}
              </span>
            </div>
          </div>

          {/* 每日学习目标 */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-300" />
                  <span className="text-white font-medium">今日目标</span>
                </div>
                <Badge className={`transition-all ${stats.dailyGoalCompleted >= DAILY_GOAL ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
                  {stats.dailyGoalCompleted}/{DAILY_GOAL} 次训练
                </Badge>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.dailyGoalCompleted / DAILY_GOAL) * 100, 100)}%` }}
                />
              </div>
              <p className="text-blue-100 text-xs mt-2">
                {stats.dailyGoalCompleted >= DAILY_GOAL ? '今日目标已完成，太棒了！' : '加油，完成今天的训练目标吧！'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-6 -mt-4 max-w-sm mx-auto">
        {/* 学习统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-slate-800">{stats.totalTraining}</div>
              <div className="text-xs text-slate-500">总训练次数</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-slate-800">{stats.averageAccuracy}%</div>
              <div className="text-xs text-slate-500">平均正确率</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-slate-800">{stats.masteredTopics}</div>
              <div className="text-xs text-slate-500">精通主题</div>
            </CardContent>
          </Card>
        </div>

        {/* 推荐行动 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">推荐行动</h2>
          </div>
          
          <div className="space-y-3">
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">继续训练</h3>
                      <p className="text-sm text-slate-600">巩固已学知识</p>
                    </div>
                  </div>
                  <Link to={createPageUrl("TrainingHub")}>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      开始
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">学习新知识</h3>
                      <p className="text-sm text-slate-600">探索更多技能</p>
                    </div>
                  </div>
                  <Link to={createPageUrl("Learning")}>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-600">
                      学习
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 技能类目 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">技能类目</h2>
            <Link to={createPageUrl("Learning")} className="text-blue-600 text-sm font-medium">
              查看全部
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {categories.slice(0, 4).map((category) => (
              <Link key={category.id} to={createPageUrl(`Learning?category=${category.id}`)}>
                <Card className="bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${category.color || 'bg-blue-100'} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-2xl">{category.icon || '📚'}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
