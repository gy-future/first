
import React, { useState, useEffect } from 'react';
import { User, UserProgress } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { t } from '@/components/i18n';
import { ChevronRight, Edit, LogOut, FileWarning, Gift, FileText, Share2, MessageSquare, Gem, Zap, Target, Star, Package, Settings, TrendingUp, Award, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        navigate(createPageUrl("Home"));
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

  const walletItems = [
    { icon: Zap, text: t('profile.lingdouHistory'), page: "LingdouHistory", value: user?.lingdou_balance || 0, unit: t('profile.lingdou'), color: "text-orange-600" },
    { icon: Star, text: t('profile.pointsHistory'), page: "PointsHistory", value: user?.points_balance || 0, unit: t('profile.points'), color: "text-purple-600" }
  ];

  const recordItems = [
    { icon: Package, text: t('profile.exchangeHistory'), page: "ExchangeHistory" },
    { icon: FileText, text: t('profile.myOrders'), page: "MyOrders" }
  ];

  const socialItems = [
    { icon: Share2, text: t('profile.shareWithFriends'), comingSoon: true },
    { icon: MessageSquare, text: t('profile.contactSupport'), comingSoon: true }
  ];

  if (isLoading) {
    return (
       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
         <div className="max-w-md mx-auto">
           <div className="flex items-center gap-3 mb-6">
             <Skeleton className="w-16 h-16 rounded-full" />
             <div className="flex-1 space-y-2">
               <Skeleton className="h-5 w-28" />
               <Skeleton className="h-3 w-40" />
             </div>
           </div>
           <div className="grid grid-cols-3 gap-3 mb-6">
             <Skeleton className="h-16 w-full rounded-lg" />
             <Skeleton className="h-16 w-full rounded-lg" />
             <Skeleton className="h-16 w-full rounded-lg" />
           </div>
         </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 个人信息头部 - 简化设计，只保留基本信息 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-8 pb-12 px-4">
        <div className="max-w-md mx-auto">
          {/* 用户基本信息 */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-3 border-white/20 shadow-lg">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xl bg-white/20 text-white">{user?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full p-0">
                <Edit className="w-3 h-3 text-white" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white truncate">{user?.full_name}</h1>
                {user?.vip_level && user.vip_level !== '普通' && (
                  <Badge className="bg-yellow-500 text-yellow-900 text-xs shadow-md">
                    <Gem className="w-3 h-3 mr-1" />
                    {user.vip_level}
                  </Badge>
                )}
              </div>
              <p className="text-blue-100 text-sm truncate">{user?.email}</p>
              
              {/* 简化的数据展示 */}
              <div className="flex items-center gap-4 mt-2 text-xs text-blue-100">
                <span>{stats.totalTrainings}次训练</span>
                <span>{stats.masteredTopics}个精通</span>
                <span>{stats.accuracy}%正确率</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 -mt-8 max-w-md mx-auto pb-8">
        {/* VIP会员卡片 - 移到头部下方作为独立卡片 */}
        <div 
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 cursor-pointer hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-white"
          onClick={() => navigate(createPageUrl('Membership'))}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('profile.membershipCenter')}</h3>
                <p className="text-yellow-100 text-sm">
                  {user?.vip_level && user.vip_level !== '普通' ? `${user.vip_level}${t('membership.member')}` : t('profile.upgradeVip')}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80" />
          </div>
        </div>

        {/* 重新设计的快捷操作 - 包含更多功能 */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3">学习工具</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => navigate(createPageUrl("TrainingGoals"))}
            >
              <CardContent className="p-3 text-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                  <Target className="w-5 h-5" />
                </div>
                <p className="font-medium text-slate-800 text-xs">{t('profile.trainingGoals')}</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-gradient-to-br from-green-50 to-green-100 border-0 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => navigate(createPageUrl("TrainingHistory"))}
            >
              <CardContent className="p-3 text-center">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="font-medium text-slate-800 text-xs">{t('profile.trainingHistory')}</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => navigate(createPageUrl("PointsShop"))}
            >
              <CardContent className="p-3 text-center">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="font-medium text-slate-800 text-xs">{t('profile.pointsShop')}</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => navigate(createPageUrl("Settings"))}
            >
              <CardContent className="p-3 text-center">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                  <Settings className="w-5 h-5" />
                </div>
                <p className="font-medium text-slate-800 text-xs">{t('profile.settings')}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 我的钱包 */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3">我的钱包</h2>
          <div className="space-y-3">
            {walletItems.map((item, index) => (
              <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl(item.page))}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.text}</p>
                        <p className="text-xs text-slate-500">查看详细记录</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-slate-400">{item.unit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 订单与记录 */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3">订单与记录</h2>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-1">
              {recordItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => navigate(createPageUrl(item.page))}
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                    <item.icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="flex-1 text-slate-800 font-medium text-sm">{item.text}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 更多功能 */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3">更多功能</h2>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-1">
              {socialItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                    <item.icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="flex-1 text-slate-800 font-medium text-sm">{item.text}</span>
                  {item.comingSoon && <span className="text-xs text-slate-400 mr-2">{t('common.comingSoon')}</span>}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 退出登录 */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('profile.logout')}
          </Button>
        </div>
      </div>
    </div>
  );
}
