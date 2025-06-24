import React, { useState, useEffect } from 'react';
import { TrainingSession, Topic, User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Target, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function TrainingHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    bestScore: 0,
    totalTime: 0
  });

  useEffect(() => {
    loadTrainingHistory();
  }, []);

  const loadTrainingHistory = async () => {
    try {
      setLoading(true);
      const user = await User.me();
      
      // 获取用户的训练记录
      const userSessions = await TrainingSession.filter({ user_id: user.id }, '-completion_date');
      setSessions(userSessions);
      
      // 获取所有主题用于显示名称
      const allTopics = await Topic.list();
      setTopics(allTopics);
      
      // 计算统计数据
      if (userSessions.length > 0) {
        const totalSessions = userSessions.length;
        const totalScore = userSessions.reduce((sum, s) => sum + (s.total_score || 0), 0);
        const avgScore = Math.round(totalScore / totalSessions);
        const bestScore = Math.max(...userSessions.map(s => s.total_score || 0));
        const totalTime = userSessions.reduce((sum, s) => sum + (s.session_duration || 0), 0);
        
        setStats({ totalSessions, avgScore, bestScore, totalTime });
      }
    } catch (error) {
      console.error('加载训练历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.name : '未知主题';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分钟`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">加载训练记录...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-12 pb-6 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white text-xl font-bold">训练记录</h1>
              <p className="text-blue-100 text-sm">查看你的训练历程</p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.totalSessions}</div>
                <div className="text-xs text-blue-100">训练次数</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.avgScore}</div>
                <div className="text-xs text-blue-100">平均分数</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 训练记录列表 */}
      <div className="px-6 -mt-2 max-w-sm mx-auto pb-8">
        {sessions.length === 0 ? (
          <Card className="bg-white shadow-sm mt-4">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-600 mb-2">还没有训练记录</h3>
              <p className="text-sm text-slate-400 mb-4">开始你的第一次训练吧！</p>
              <Button onClick={() => navigate(createPageUrl('TrainingHub'))} className="bg-blue-600 hover:bg-blue-700">
                去训练
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 mt-4">
            {sessions.map((session) => (
              <Card key={session.id} className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">
                        {getTopicName(session.topic_id)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {session.completion_date ? format(new Date(session.completion_date), 'MM-dd HH:mm') : ''}
                      </div>
                    </div>
                    <Badge className={`font-bold ${getScoreColor(session.total_score || 0)}`}>
                      {session.total_score || 0}分
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {session.questions_answered || 0}题
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      答对{session.correct_count || 0}题
                    </div>
                    {session.session_duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.session_duration)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}