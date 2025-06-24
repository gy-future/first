
import React, { useState, useEffect, useRef } from "react";
import { Topic, UserProgress, User } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Play, Pause, BookOpen, Clock, Target, CheckCircle2, Volume2, Rewind, FastForward, Gem } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// 模拟媒体播放器组件
const MediaPlayer = ({ type, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const duration = 180; // 模拟3分钟时长

  const startPlayback = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          onComplete();
          return 100;
        }
        return p + 100 / duration;
      });
    }, 1000);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  };
  
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const formatTime = (percentage) => {
    const totalSeconds = (percentage / 100) * duration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 text-white text-center shadow-2xl">
      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        {type === 'video' ? (
          <Play className="w-12 h-12 text-white" />
        ) : (
          <Volume2 className="w-12 h-12 text-white" />
        )}
      </div>
      <p className="font-semibold text-lg mb-4">
        {type === 'video' ? '视频学习' : '音频学习'}
      </p>
      
      <div className="space-y-3">
        <Progress value={progress} className="h-2 [&>div]:bg-white" />
        <div className="flex justify-between text-xs text-slate-400">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(100)}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-6">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><Rewind /></Button>
        <Button 
          size="icon" 
          className="w-16 h-16 rounded-full bg-white text-slate-800 hover:bg-slate-200"
          onClick={isPlaying ? pausePlayback : startPlayback}
        >
          {isPlaying ? <Pause className="w-8 h-8"/> : <Play className="w-8 h-8 ml-1"/>}
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><FastForward /></Button>
      </div>
    </div>
  );
};

export default function TopicDetail() {
  const [topic, setTopic] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [currentKnowledgeIndex, setCurrentKnowledgeIndex] = useState(0);
  const [isLearning, setIsLearning] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const topicId = urlParams.get('id');
      
      console.log("正在查找主题ID:", topicId);
      
      if (!topicId) {
        navigate(createPageUrl("Learning"));
        return;
      }

      const currentUser = await User.me();
      setUser(currentUser);
      
      // 获取所有主题并查找匹配的
      const allTopics = await Topic.list();
      console.log("所有主题:", allTopics);
      
      let foundTopic = allTopics.find(t => t.id === topicId);
      console.log("尝试通过ID找到的主题:", foundTopic);
      
      let actualTopic = foundTopic;

      if (!foundTopic) {
        // 尝试通过名称查找
        const topicByName = allTopics.find(t => t.name === topicId);
        if (topicByName) {
          actualTopic = topicByName;
          console.log("通过名称找到主题:", topicByName);
        } else {
          console.log("未找到主题，ID/名称:", topicId);
        }
      }

      setTopic(actualTopic); // Set topic state regardless of how it was found (or null if not found)
      
      if (actualTopic) {
        const progressData = await UserProgress.filter({ 
          user_id: currentUser.id, 
          topic_id: actualTopic.id 
        });
        
        if (progressData.length > 0) {
          setUserProgress(progressData[0]);
        }
      }
    } catch (error) {
      console.log("数据加载失败", error);
      // It's good practice to navigate back or show an error even if the topic wasn't found,
      // as it implies an invalid state. The check below `if (!topic)` will also catch this.
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    setIsLearning(true);
    setCurrentKnowledgeIndex(0);
  };

  const handleNextKnowledge = async () => {
    if (currentKnowledgeIndex < (topic.knowledge_points?.length || 0) - 1) {
      setCurrentKnowledgeIndex(prev => prev + 1);
    } else {
      // 学习完成，更新进度
      await markLearningComplete();
    }
  };

  const markLearningComplete = async () => {
    try {
      if (userProgress) {
        await UserProgress.update(userProgress.id, {
          knowledge_learned: true,
          mastery_level: '初学'
        });
      } else {
        await UserProgress.create({
          user_id: user.id,
          topic_id: topic.id,
          knowledge_learned: true,
          mastery_level: '初学'
        });
      }
      
      setIsLearning(false);
      loadData(); // 重新加载数据
    } catch (error) {
      console.log("更新进度失败");
    }
  };

  const handleStartTraining = () => {
    navigate(createPageUrl(`Training?topic=${topic.id}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-600 mb-4">主题不存在或已被删除</p>
          <p className="text-xs text-slate-400 mb-4">
            请检查URL参数是否正确
          </p>
          <Button onClick={() => navigate(createPageUrl("Learning"))}>
            返回学习页面
          </Button>
        </div>
      </div>
    );
  }
  
  const isAdvanced = topic.difficulty === '高级';
  const canAccess = !isAdvanced || (isAdvanced && user?.is_vip);

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100 flex flex-col items-center justify-center p-6 text-center">
        <Gem className="w-20 h-20 text-yellow-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3">VIP专属高级课程</h2>
        <p className="text-slate-600 mb-8">升级成为VIP会员，即可解锁本课程及所有高级内容。</p>
        <div className="w-full max-w-xs space-y-3">
          <Button onClick={() => navigate(createPageUrl('Membership'))} className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">立即升级</Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    )
  }

  if (isLearning) {
    const currentKnowledge = topic.knowledge_points?.[currentKnowledgeIndex];
    const progress = ((currentKnowledgeIndex + 1) / (topic.knowledge_points?.length || 1)) * 100;

    return (
      <div className="min-h-screen bg-slate-100">
        {/* 学习进度头部 */}
        <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="icon" onClick={() => setIsLearning(false)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="font-semibold text-slate-700">{topic.name}</h2>
              <span className="text-sm font-medium text-slate-500 w-10 text-right">
                {currentKnowledgeIndex + 1}/{topic.knowledge_points?.length || 0}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        {/* 学习内容 */}
        <div className="p-4 max-w-md mx-auto">
          {currentKnowledge ? (
            <motion.div
              key={currentKnowledge.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-slate-800 text-center">{currentKnowledge.name}</h3>

              {currentKnowledge.type === 'video' || currentKnowledge.type === 'audio' ? (
                <MediaPlayer type={currentKnowledge.type} onComplete={handleNextKnowledge} />
              ) : (
                <div className="prose prose-sm max-w-none bg-white p-6 rounded-xl shadow-md">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {currentKnowledge.content}
                  </p>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleNextKnowledge}
                  className="bg-orange-500 hover:bg-orange-600 px-10 py-6 text-base"
                >
                  {currentKnowledgeIndex < (topic.knowledge_points?.length || 0) - 1 ? '下一个知识点' : '我学完了'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-8">
              <p className="text-slate-600">没有找到学习内容</p>
              <Button onClick={() => setIsLearning(false)} className="mt-4">
                返回主题页
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-12 pb-8 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(createPageUrl("Learning"))}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-white text-xl font-bold mb-1">{topic.name}</h1>
              <p className="text-blue-100 text-sm">{topic.description}</p>
            </div>
          </div>

          {/* 基础信息 */}
          <div className="flex items-center gap-4 text-sm text-blue-100">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {topic.estimated_time || 30}分钟
            </div>
            <Badge className={`${topic.difficulty === '高级' ? 'bg-red-100 text-red-700' : 
                                topic.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-green-100 text-green-700'}`}>
              {topic.difficulty || '初级'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 max-w-sm mx-auto space-y-6">
        {/* 学习目标 */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-orange-500" />
              学习目标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{topic.goal || '掌握核心概念和实用技巧'}</p>
          </CardContent>
        </Card>

        {/* 应用场景 */}
        {topic.scenarios && topic.scenarios.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">应用场景</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topic.scenarios.map((scenario, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold text-sm mt-1">{index + 1}.</span>
                    <span className="text-slate-700 text-sm">{scenario}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 知识点预览 */}
        {topic.knowledge_points && topic.knowledge_points.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">知识点</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topic.knowledge_points.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      {point.type === 'video' ? (
                        <Play className="w-4 h-4 text-blue-600" />
                      ) : point.type === 'audio' ? (
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{point.name}</h4>
                      <p className="text-xs text-slate-500 capitalize">{point.type} 内容</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3 pb-8">
          {!userProgress?.knowledge_learned ? (
            <Button 
              onClick={handleStartLearning}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              开始学习
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">知识点已学习完成</span>
              </div>
              
              <Button 
                onClick={handleStartTraining}
                className="w-full bg-orange-500 hover:bg-orange-600 h-12"
              >
                <Play className="w-5 h-5 mr-2" />
                开始训练
              </Button>
              
              <Button 
                onClick={handleStartLearning}
                variant="outline" 
                className="w-full h-12"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                重新学习
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
