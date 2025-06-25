import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingGoal, User } from '@/api/entities';
import { ArrowLeft, Target, Calendar, Clock, TrendingUp, Bell, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export default function TrainingGoals() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState({
    daily_training_count: 1,
    weekly_training_count: 5,
    target_accuracy: 80,
    target_mastery_topics: 3,
    reminder_enabled: true,
    reminder_time: '20:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await User.me();
      setUser(currentUser);

      const userGoals = await TrainingGoal.filter({ user_id: currentUser.id });
      if (userGoals.length > 0) {
        setGoals(userGoals[0]);
      }
    } catch (error) {
      console.error('加载训练目标失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const userGoals = await TrainingGoal.filter({ user_id: user.id });
      
      if (userGoals.length > 0) {
        await TrainingGoal.update(userGoals[0].id, goals);
      } else {
        await TrainingGoal.create({
          user_id: user.id,
          ...goals
        });
      }
      
      alert('训练目标保存成功！');
    } catch (error) {
      console.error('保存训练目标失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const updateGoal = (key, value) => {
    setGoals(prev => ({ ...prev, [key]: value }));
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
              <h1 className="text-white text-xl font-bold">训练目标</h1>
              <p className="text-green-100 text-sm">设置你的学习计划</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-2 max-w-sm mx-auto pb-8 space-y-4">
        {/* 每日目标 */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-green-600" />
              每日训练目标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-600 mb-2 block">每日训练次数</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[goals.daily_training_count]}
                  onValueChange={(value) => updateGoal('daily_training_count', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-green-600">
                  {goals.daily_training_count}次
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 每周目标 */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              每周训练目标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-600 mb-2 block">每周训练次数</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[goals.weekly_training_count]}
                  onValueChange={(value) => updateGoal('weekly_training_count', value[0])}
                  max={30}
                  min={3}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-blue-600">
                  {goals.weekly_training_count}次
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 准确率目标 */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              准确率目标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-600 mb-2 block">目标准确率</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[goals.target_accuracy]}
                  onValueChange={(value) => updateGoal('target_accuracy', value[0])}
                  max={100}
                  min={50}
                  step={5}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-orange-600">
                  {goals.target_accuracy}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 精通主题目标 */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-purple-600" />
              精通主题目标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-600 mb-2 block">目标精通主题数</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[goals.target_mastery_topics]}
                  onValueChange={(value) => updateGoal('target_mastery_topics', value[0])}
                  max={20}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-purple-600">
                  {goals.target_mastery_topics}个
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提醒设置 */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-pink-600" />
              提醒设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-600">开启训练提醒</Label>
              <Switch
                checked={goals.reminder_enabled}
                onCheckedChange={(checked) => updateGoal('reminder_enabled', checked)}
              />
            </div>
            
            {goals.reminder_enabled && (
              <div>
                <Label className="text-slate-600 mb-2 block">提醒时间</Label>
                <Input
                  type="time"
                  value={goals.reminder_time}
                  onChange={(e) => updateGoal('reminder_time', e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
        >
          {saving ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存设置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}