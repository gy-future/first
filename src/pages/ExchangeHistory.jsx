import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PointsExchange, User } from '@/api/entities';
import { ArrowLeft, Package, Calendar, CheckCircle, Clock, Truck, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function ExchangeHistory() {
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await User.me();
      setUser(currentUser);

      const userExchanges = await PointsExchange.filter({ user_id: currentUser.id }, '-exchange_date');
      setExchanges(userExchanges);
    } catch (error) {
      console.error('加载兑换记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'processed':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Package className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '处理中',
      'processed': '已发货',
      'delivered': '已完成'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-orange-100 text-orange-700',
      'processed': 'bg-blue-100 text-blue-700',
      'delivered': 'bg-green-100 text-green-700'
    };
    return colorMap[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 pt-12 pb-6 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white text-xl font-bold">兑换记录</h1>
              <p className="text-green-100 text-sm">查看你的积分兑换历史</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-2 max-w-sm mx-auto pb-8">
        {exchanges.length === 0 ? (
          <Card className="bg-white shadow-sm mt-4">
            <CardContent className="p-8 text-center">
              <Gift className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-600 mb-2">还没有兑换记录</h3>
              <p className="text-sm text-slate-400 mb-4">去积分商城看看有什么好东西吧！</p>
              <Button onClick={() => navigate(createPageUrl('PointsShop'))} className="bg-green-600 hover:bg-green-700">
                去商城
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 mt-4">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">{exchange.product_name}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exchange.exchange_date ? format(new Date(exchange.exchange_date), 'MM-dd HH:mm') : ''}
                        </div>
                        <span>{exchange.points_cost} 积分</span>
                      </div>
                      {exchange.delivery_info && (
                        <p className="text-xs text-slate-600">{exchange.delivery_info}</p>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(exchange.status)} flex items-center gap-1`}>
                      {getStatusIcon(exchange.status)}
                      {getStatusText(exchange.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 继续兑换提示 */}
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200 mt-6">
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-800 mb-2">发现更多好物</h3>
            <p className="text-sm text-slate-600 mb-4">用你辛苦赚来的积分兑换心仪的奖品</p>
            <Button onClick={() => navigate(createPageUrl('PointsShop'))} className="bg-green-500 hover:bg-green-600">
              继续兑换
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}