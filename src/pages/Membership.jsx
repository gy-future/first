
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Gem, BrainCircuit, Mic, Star, Crown, Diamond, Zap, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPageUrl } from '@/utils';

export default function Membership() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error('加载用户数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const vipPlans = [
    {
      level: "VIP",
      name: "VIP会员",
      icon: Star,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      price: "¥19.9/月",
      features: [
        "解锁所有中级主题课程",
        "每日免费获得2个灵豆",
        "AI分析优先处理",
        "专属VIP标识"
      ]
    },
    {
      level: "超级VIP",
      name: "超级VIP",
      icon: Crown,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      price: "¥39.9/月",
      popular: true,
      features: [
        "解锁所有高级主题课程",
        "每日免费获得5个灵豆",
        "无限次AI回答灵感",
        "专属训练报告分析",
        "优先客服支持"
      ]
    },
    {
      level: "至尊VIP",
      name: "至尊VIP",
      icon: Diamond,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      price: "¥99.9/月",
      features: [
        "解锁全部课程内容",
        "每日免费获得10个灵豆",
        "AI个性化学习路径",
        "一对一专家指导",
        "专属学习社群",
        "线下活动优先权"
      ]
    }
  ];

  const lingdouPackages = [
    { amount: 10, price: "¥1.99", bonus: 0 },
    { amount: 50, price: "¥9.99", bonus: 5 },
    { amount: 100, price: "¥19.99", bonus: 15 },
    { amount: 500, price: "¥99.99", bonus: 100 }
  ];

  const handleUpgrade = (level) => {
    alert(`升级到${level}功能开发中，敬请期待！`);
  };

  const handleBuyLingdou = (packageInfo) => {
    alert(`购买${packageInfo.amount}个灵豆功能开发中，敬请期待！`);
  };

  const getUserVipStatus = () => {
    if (!user) return { level: "普通", isVip: false };
    const isVip = user.vip_level && user.vip_level !== "普通";
    return { level: user.vip_level || "普通", isVip };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const { level: currentLevel, isVip } = getUserVipStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 pt-8 pb-16 px-6 text-white text-center shadow-lg">
        <div className="max-w-md mx-auto relative">
          <Button variant="ghost" size="icon" className="absolute left-0 top-0 text-white hover:bg-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <Gem className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">会员中心</h1>
          <p className="mt-2 text-white/80">解锁全部潜能，加速你的职业成长</p>
          
          {/* 用户当前状态 */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <Badge className={`${isVip ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-600'} mb-2`}>
                  {currentLevel}
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>灵豆余额: {user?.lingdou_balance || 0}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-white border-white/50 hover:bg-white/20"
                onClick={() => navigate(createPageUrl('LingdouShop'))}
              >
                购买灵豆
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 max-w-md mx-auto">
        <Tabs defaultValue="vip" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="vip">VIP会员</TabsTrigger>
            <TabsTrigger value="lingdou">灵豆商城</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vip" className="space-y-4 mt-6">
            {vipPlans.map((plan, index) => (
              <Card key={plan.level} className={`${plan.bgColor} ${plan.borderColor} border-2 ${plan.popular ? 'ring-2 ring-purple-300' : ''} relative overflow-hidden`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs rounded-bl-lg">
                    推荐
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center`}>
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <p className="text-sm text-slate-600">{plan.price}</p>
                      </div>
                    </div>
                    {currentLevel === plan.level && (
                      <Badge className="bg-green-100 text-green-700">当前</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                  <Button 
                    onClick={() => handleUpgrade(plan.level)}
                    className={`w-full mt-4 bg-gradient-to-r ${plan.color} hover:opacity-90 ${currentLevel === plan.level ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={currentLevel === plan.level}
                  >
                    {currentLevel === plan.level ? '已开通' : '立即升级'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="lingdou" className="space-y-4 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  灵豆商城
                </CardTitle>
                <p className="text-sm text-slate-600">灵豆可用于获取AI回答灵感，让你的回答更加出色</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {lingdouPackages.map((pkg, index) => (
                  <Card key={index} className="bg-white border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{pkg.amount} 灵豆</h4>
                            {pkg.bonus > 0 && (
                              <p className="text-xs text-green-600">+{pkg.bonus} 赠送</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{pkg.price}</p>
                          <Button 
                            size="sm" 
                            onClick={() => handleBuyLingdou(pkg)}
                            className="bg-orange-500 hover:bg-orange-600 mt-1"
                          >
                            购买
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
