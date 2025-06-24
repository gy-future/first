
import React, { useState, useEffect } from 'react';
import { User, UserProgress } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Edit, LogOut, FileWarning, Gift, FileText, Share2, MessageSquare, Gem, Zap } from 'lucide-react'; // Added Zap import
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalTrainings: 0, masteredTopics: 0, accuracy: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const progress = await UserProgress.filter({ user_id: currentUser.id });
        const totalTrainings = progress.reduce((sum, p) => sum + (p.training_count || 0), 0);
        const masteredTopics = progress.filter(p => p.mastery_level === '精通').length;
        const totalCorrect = progress.reduce((sum, p) => sum + (p.correct_answers || 0), 0);
        const totalQuestions = progress.reduce((sum, p) => sum + (p.total_questions || 0), 0);
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        
        setStats({ totalTrainings, masteredTopics, accuracy });
      } catch (error) {
        navigate(createPageUrl("Home")); // Redirect if not logged in
      }
      setIsLoading(false);
    };
    loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await User.logout();
    navigate(createPageUrl("Home"));
    window.location.reload();
  };

  const menuItems = [
    { icon: FileWarning, text: "训练记录", page: "TrainingHistory", comingSoon: false },
    { icon: Zap, text: "灵豆记录", page: "LingdouHistory", comingSoon: true },
    { icon: Gift, text: "积分商城", comingSoon: true },
    { icon: FileText, text: "我的订单", comingSoon: true },
    { icon: Share2, text: "分享好友", comingSoon: false },
    { icon: MessageSquare, text: "联系客服", comingSoon: false },
  ];

  if (isLoading) {
    return (
       <div className="p-6 max-w-md mx-auto">
         <div className="flex items-center gap-4 mb-8">
           <Skeleton className="w-20 h-20 rounded-full" />
           <div className="flex-1 space-y-2">
             <Skeleton className="h-6 w-32" />
             <Skeleton className="h-4 w-48" />
           </div>
         </div>
         <Card><CardContent className="p-4 grid grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
         </CardContent></Card>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-b from-blue-100 to-slate-50 pt-12 pb-6 px-6">
        <div className="max-w-md mx-auto">
          {/* 用户信息 */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="w-20 h-20 border-4 border-white">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-3xl">{user?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-slate-800">{user?.full_name}</h1>
                {user?.vip_level && user.vip_level !== '普通' && (
                  <Badge className="bg-yellow-400 text-yellow-900">
                    <Gem className="w-3 h-3 mr-1" />
                    {user.vip_level}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-slate-600">灵豆: {user?.lingdou_balance || 0}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Edit className="w-5 h-5" />
            </Button>
          </div>

          {/* 数据统计 */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTrainings}</p>
                <p className="text-xs text-slate-500">训练次数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.masteredTopics}</p>
                <p className="text-xs text-slate-500">精通主题</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.accuracy}%</p>
                <p className="text-xs text-slate-500">平均正确率</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 菜单列表 */}
      <div className="px-6 max-w-md mx-auto mt-6">
        <Card className="bg-white">
          <CardContent className="p-2">
             <div className="flex items-center p-4 hover:bg-slate-50 rounded-lg cursor-pointer bg-gradient-to-r from-yellow-50 to-orange-100" 
                  onClick={() => navigate(createPageUrl('Membership'))}>
                <Gem className="w-5 h-5 text-orange-500 mr-4" />
                <span className="flex-1 font-bold text-orange-800">会员中心</span>
                <span className="text-xs text-orange-600 mr-2">
                  {user?.vip_level && user.vip_level !== '普通' ? `${user.vip_level}会员` : '升级VIP'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            {menuItems.map((item, index) => (
              <div key={index} className={`flex items-center p-4 hover:bg-slate-50 rounded-lg ${!item.comingSoon ? 'cursor-pointer' : ''}`} 
                   onClick={() => !item.comingSoon && item.page && navigate(createPageUrl(item.page))}>
                <item.icon className="w-5 h-5 text-slate-600 mr-4" />
                <span className="flex-1 text-slate-800">{item.text}</span>
                {item.comingSoon && <span className="text-xs text-slate-400 mr-2">敬请期待</span>}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 退出登录 */}
        <div className="mt-8">
          <Button variant="outline" className="w-full bg-white" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
