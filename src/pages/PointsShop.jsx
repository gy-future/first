
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, PointsTransaction, PointsExchange } from '@/api/entities';
import { ArrowLeft, Gift, Star, Coffee, BookOpen, Trophy, Crown, Smartphone, Headphones, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';

export default function PointsShop() {
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

  const products = [
    {
      id: "points_001",
      name: "咖啡券",
      description: "星巴克中杯美式咖啡券",
      price: 150,
      originalPrice: 180,
      icon: Coffee,
      color: "bg-amber-100 text-amber-600",
      category: "实物",
      hot: true,
      stock: 50
    },
    {
      id: "points_002",
      name: "电子书券",
      description: "知名出版社电子书阅读券",
      price: 100,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      category: "虚拟",
      stock: 100
    },
    {
      id: "points_003",
      name: "专属徽章",
      description: "职场达人专属数字徽章",
      price: 80,
      icon: Award,
      color: "bg-yellow-100 text-yellow-600",
      category: "徽章",
      stock: 999
    },
    {
      id: "points_004",
      name: "手机支架",
      description: "便携式桌面手机支架",
      price: 200,
      originalPrice: 240,
      icon: Smartphone,
      color: "bg-slate-100 text-slate-600",
      category: "实物",
      stock: 30
    },
    {
      id: "points_005",
      name: "蓝牙耳机",
      description: "无线蓝牙运动耳机",
      price: 500,
      icon: Headphones,
      color: "bg-purple-100 text-purple-600",
      category: "实物",
      premium: true,
      stock: 10
    },
    {
      id: "points_006",
      name: "学习礼包",
      description: "职场技能学习大礼包",
      price: 300,
      icon: Gift,
      color: "bg-green-100 text-green-600",
      category: "虚拟",
      stock: 20
    }
  ];

  const handleExchange = async (product) => {
    if ((user?.points_balance || 0) < product.price) {
      alert('积分不足，多做训练获取更多积分吧！');
      return;
    }

    try {
      // 扣除积分
      const newBalance = (user.points_balance || 0) - product.price;
      await User.updateMyUserData({
        points_balance: newBalance
      });

      // 记录兑换
      await PointsExchange.create({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        points_cost: product.price,
        exchange_date: new Date().toISOString()
      });

      // 记录积分交易
      await PointsTransaction.create({
        user_id: user.id,
        type: 'spend',
        amount: -product.price,
        reason: `兑换${product.name}`,
        balance_after: newBalance
      });

      // 更新本地用户状态
      setUser({ ...user, points_balance: newBalance });
      
      alert(`成功兑换${product.name}！我们会尽快为您处理。`);
      
      // 跳转到兑换记录页面
      navigate(createPageUrl('ExchangeHistory'));
    } catch (error) {
      console.error('兑换失败:', error);
      alert('兑换失败，请稍后重试');
    }
  };

  const categories = ["全部", "实物", "虚拟", "徽章"];
  const [activeCategory, setActiveCategory] = useState("全部");

  const filteredProducts = activeCategory === "全部" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 pt-12 pb-6 px-4 sm:px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20 touch-manipulation">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white text-lg sm:text-xl font-bold">积分商城</h1>
              <p className="text-purple-100 text-sm">用积分兑换精美奖品</p>
            </div>
          </div>

          {/* 用户积分信息 - 移动端优化 */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-semibold">我的积分</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white">{user?.points_balance || 0}</div>
              <div className="text-xs text-purple-100 mt-1">
                累计获得: {user?.total_points_earned || 0} 积分
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 sm:px-6 -mt-2 max-w-sm mx-auto pb-8">
        {/* 分类标签 - 移动端优化 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap touch-manipulation flex-shrink-0 ${
                activeCategory === category 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-slate-600'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* 商品列表 - 移动端优化 */}
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              {product.hot && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded-bl-lg">
                  热门
                </div>
              )}
              {product.premium && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-2 py-1 text-xs rounded-bl-lg">
                  精品
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${product.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <product.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base truncate">{product.name}</h3>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-purple-600">{product.price} 积分</span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">{product.originalPrice} 积分</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      库存: {product.stock > 99 ? '充足' : product.stock}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleExchange(product)}
                    disabled={(user?.points_balance || 0) < product.price || product.stock === 0}
                    className={`flex-shrink-0 touch-manipulation ${
                      (user?.points_balance || 0) >= product.price && product.stock > 0
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                    size="sm"
                  >
                    {product.stock === 0 ? '缺货' : (user?.points_balance || 0) >= product.price ? '兑换' : '不足'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 获取更多积分提示 - 移动端优化 */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mt-6">
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">积分不够用？</h3>
            <p className="text-sm text-slate-600 mb-4">多做训练题目，每道题都有积分奖励哦！</p>
            <div className="space-y-1 text-xs text-slate-500 mb-4">
              <p>答对题目: 10-15 积分</p>
              <p>答错题目: 5-8 积分</p>
              <p>高分奖励: 额外 5-20 积分</p>
            </div>
            <Button onClick={() => navigate(createPageUrl('TrainingHub'))} className="bg-purple-600 hover:bg-purple-700 w-full touch-manipulation">
              去训练赚积分
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
