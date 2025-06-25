import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PointsTransaction, User } from '@/api/entities';
import { ArrowLeft, Plus, Minus, Gift, TrendingUp, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function PointsHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    currentBalance: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await User.me();
      setUser(currentUser);

      const userTransactions = await PointsTransaction.filter({ user_id: currentUser.id }, '-created_date');
      setTransactions(userTransactions);

      // 计算统计数据
      const totalEarned = userTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalSpent = userTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      setStats({
        totalEarned,
        totalSpent,
        currentBalance: currentUser.points_balance || 0
      });
    } catch (error) {
      console.error('加载积分记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type, amount) => {
    if (amount > 0) {
      return type === 'bonus' ? <Gift className="w-5 h-5 text-green-500" /> : <Plus className="w-5 h-5 text-blue-500" />;
    }
    return <Minus className="w-5 h-5 text-red-500" />;
  };

  const getTransactionColor = (amount) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatAmount = (amount) => {
    return amount > 0 ? `+${amount}` : amount.toString();
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
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 pt-12 pb-6 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white text-xl font-bold">积分记录</h1>
              <p className="text-purple-100 text-sm">查看你的积分收支明细</p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.currentBalance}</div>
                <div className="text-xs text-purple-100">当前余额</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.totalEarned}</div>
                <div className="text-xs text-purple-100">累计获得</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.totalSpent}</div>
                <div className="text-xs text-purple-100">累计消费</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-2 max-w-sm mx-auto pb-8">
        {transactions.length === 0 ? (
          <Card className="bg-white shadow-sm mt-4">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-600 mb-2">还没有积分记录</h3>
              <p className="text-sm text-slate-400 mb-4">开始训练赚取积分吧！</p>
              <Button onClick={() => navigate(createPageUrl('TrainingHub'))} className="bg-purple-600 hover:bg-purple-700">
                去训练
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 mt-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type, transaction.amount)}
                      <div>
                        <h4 className="font-semibold text-slate-800">{transaction.reason}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {transaction.created_date ? format(new Date(transaction.created_date), 'MM-dd HH:mm') : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTransactionColor(transaction.amount)}`}>
                        {formatAmount(transaction.amount)}
                      </div>
                      <div className="text-xs text-slate-400">
                        余额: {transaction.balance_after}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 获取更多积分按钮 */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mt-6">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-800 mb-2">想要更多积分？</h3>
            <p className="text-sm text-slate-600 mb-4">多做训练题目，积分奖励等你来拿！</p>
            <Button onClick={() => navigate(createPageUrl('TrainingHub'))} className="bg-purple-500 hover:bg-purple-600">
              立即训练
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}