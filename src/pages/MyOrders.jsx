import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, User } from '@/api/entities';
import { ArrowLeft, Package, Calendar, CreditCard, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
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

      const userOrders = await Order.filter({ user_id: currentUser.id }, '-order_date');
      setOrders(userOrders);
    } catch (error) {
      console.error('加载订单数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'refunded':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '待支付',
      'paid': '已支付',
      'cancelled': '已取消',
      'refunded': '已退款'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-orange-100 text-orange-700',
      'paid': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'refunded': 'bg-blue-100 text-blue-700'
    };
    return colorMap[status] || 'bg-slate-100 text-slate-700';
  };

  const getTypeText = (type) => {
    const typeMap = {
      'vip': 'VIP会员',
      'lingdou': '灵豆',
      'course': '课程'
    };
    return typeMap[type] || type;
  };

  const handleOrderAction = (order) => {
    if (order.status === 'pending') {
      alert('支付功能开发中，敬请期待！');
    } else if (order.status === 'paid') {
      alert('订单详情功能开发中！');
    }
  };

  const filterOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-12 pb-6 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white text-xl font-bold">我的订单</h1>
              <p className="text-blue-100 text-sm">查看你的购买记录</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-2 max-w-sm mx-auto pb-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="pending">待付款</TabsTrigger>
            <TabsTrigger value="paid">已完成</TabsTrigger>
            <TabsTrigger value="cancelled">已取消</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <OrderList orders={filterOrdersByStatus('all')} onOrderAction={handleOrderAction} />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            <OrderList orders={filterOrdersByStatus('pending')} onOrderAction={handleOrderAction} />
          </TabsContent>
          
          <TabsContent value="paid" className="mt-4">
            <OrderList orders={filterOrdersByStatus('paid')} onOrderAction={handleOrderAction} />
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-4">
            <OrderList orders={filterOrdersByStatus('cancelled')} onOrderAction={handleOrderAction} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OrderList({ orders, onOrderAction }) {
  if (orders.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-600 mb-2">暂无订单</h3>
          <p className="text-sm text-slate-400">你还没有任何订单记录</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800">{order.product_name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {getTypeText(order.type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>订单号: {order.order_number}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {order.order_date ? format(new Date(order.order_date), 'MM-dd HH:mm') : ''}
                  </div>
                  {order.payment_method && (
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {order.payment_method}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-800 mb-1">
                  ¥{order.amount}
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{getStatusText(order.status)}</span>
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              {order.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => onOrderAction(order)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  立即支付
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOrderAction(order)}
              >
                订单详情
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}