import React, { useState, useEffect } from 'react';
import { User, Topic, UserProgress } from '@/api/entities';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Lock, Play, Star, Map, BookOpen, Flag, Award, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// 学习路径节点组件
const PathNode = ({ topic, status, side, moduleName, onNodeClick }) => {
  const isLeft = side === 'left';
  
  const statusConfig = {
    completed: {
      icon: <Check className="w-5 h-5 text-white" />,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      badge: '已完成',
      badgeColor: 'bg-green-100 text-green-700',
    },
    current: {
      icon: <Play className="w-5 h-5 text-white ml-1" />,
      bgColor: 'bg-blue-600 animate-pulse',
      textColor: 'text-white',
      badge: '从这开始',
      badgeColor: 'bg-blue-100 text-blue-700 animate-pulse',
    },
    unlocked: {
      icon: <BookOpen className="w-5 h-5 text-slate-600" />,
      bgColor: 'bg-white',
      textColor: 'text-slate-800',
      badge: `${topic.estimated_time || 30}分钟`,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    locked: {
      icon: <Lock className="w-5 h-5 text-slate-500" />,
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-500',
      badge: '未解锁',
      badgeColor: 'bg-slate-200 text-slate-500',
    }
  };

  const config = statusConfig[status] || statusConfig.locked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative mb-8 w-full flex ${isLeft ? 'justify-start' : 'justify-end'}`}
      onClick={() => status !== 'locked' && onNodeClick(topic)}
    >
      <div className="absolute top-1/2 -translate-y-1/2 w-1/2 border-t-2 border-dashed border-slate-300" style={isLeft ? { right: '50%' } : { left: '50%' }}></div>
      <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 ${status === 'completed' ? 'bg-green-500' : ''} ${status === 'current' ? 'bg-blue-500 ring-4 ring-blue-200' : ''}`} style={isLeft ? { right: 'calc(50% - 8px)' } : { left: 'calc(50% - 8px)' }}></div>
      
      <Card className={`w-[calc(50%-2rem)] shadow-lg transform hover:scale-105 transition-transform duration-300 ${status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'} ${config.bgColor} ${status === 'current' ? 'ring-2 ring-blue-400' : ''}`}>
        <CardContent className={`p-3`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${config.bgColor} ${status !== 'unlocked' ? 'bg-opacity-80' : 'bg-slate-100'}`}>
              <span className={`text-xl ${status === 'locked' ? 'opacity-50' : ''}`}>{topic.emoji || '💡'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-sm truncate ${config.textColor}`}>{topic.name}</h4>
              <p className={`text-xs truncate ${status !== 'unlocked' ? 'text-white/80' : 'text-slate-500'}`}>{moduleName}</p>
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <Badge className={config.badgeColor}>{config.badge}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 分类里程碑组件
const MilestoneNode = ({ category }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative my-10 flex items-center justify-center"
    >
      <div className="w-full border-t-2 border-slate-300"></div>
      <div className="absolute px-4 bg-slate-50">
        <div className="bg-white border-2 border-slate-300 rounded-xl px-4 py-2 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">{category.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{category.name}</h3>
            <p className="text-xs text-slate-500">{category.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function LearningPath() {
  const [learningPath, setLearningPath] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 定义完整的学习路径结构
  const pathStructure = [
    { 
      name: '求职招聘', 
      icon: '💼',
      description: '掌握求职面试核心技巧',
      modules: [
        { name: '求职应聘', topics: ['简历优化策略', '面试技巧实战', '薪资谈判技巧', '晋升汇报'] },
        { name: '招聘选人', topics: ['候选人评估', '面试官技能'] }
      ]
    },
    { 
      name: '沟通',
      icon: '💬',
      description: '提升职场沟通协作效率',
      modules: [
        { name: '向上管理', topics: ['向上管理试炼场', '汇报技巧精进'] },
        { name: '协作沟通', topics: ['团队协作技巧', '跨部门沟通'] },
        { name: '客户沟通', topics: ['客户需求洞察', '商务沟通礼仪'] }
      ]
    },
    { 
      name: '情商',
      icon: '🧠',
      description: '识别和管理自我与他人情绪',
      modules: [
        { name: '情商识别', topics: ['情商段位来比拼', '情绪识别训练'] },
        { name: '情绪管理', topics: ['压力管理技巧', '情绪调节策略'] }
      ]
    },
    { 
      name: '思维',
      icon: '🧩',
      description: '构建系统化与创新性思维',
      modules: [
        { name: '结构化思维', topics: ['问题分析框架', '逻辑思维训练'] },
        { name: '系统思维', topics: ['系统性思考', '因果关系分析'] }
      ]
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        const allTopics = await Topic.list();
        const allProgress = await UserProgress.filter({ user_id: user.id });
        setProgressData(allProgress);
        
        // 将数据库中的主题映射到预定义的路径结构上
        const pathWithData = pathStructure.map(category => ({
          ...category,
          modules: category.modules.map(module => ({
            ...module,
            topics: module.topics.map(topicName => {
              const topicData = allTopics.find(t => t.name === topicName);
              return topicData || { name: topicName, estimated_time: 30, locked: true }; 
            }).filter(Boolean) // 过滤掉未找到的主题
          }))
        }));

        setLearningPath(pathWithData);
      } catch (error) {
        console.error("加载学习路径失败:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleNodeClick = (topic) => {
    navigate(createPageUrl(`TopicDetail?id=${topic.id || topic.name}`));
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-4 w-64 mx-auto mb-8" />
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }
  
  let currentTopicFound = false;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-12 pb-8 px-6 text-white text-center">
        <Map className="w-12 h-12 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-2">我的学习地图</h1>
        <p className="text-blue-100">跟随路径，一步步解锁职场新技能</p>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-slate-200 rounded-full"></div>
          
          {learningPath && learningPath.map((category) => (
            <div key={category.name}>
              <MilestoneNode category={category} />
              {category.modules.map(module => (
                module.topics.map((topic, index) => {
                  const progress = progressData.find(p => p.topic_id === topic.id);
                  let status = 'locked';
                  
                  if (topic.locked) {
                     status = 'locked';
                  } else if (progress?.knowledge_learned) {
                    status = 'completed';
                  } else if (!currentTopicFound) {
                    status = 'current';
                    currentTopicFound = true;
                  } else {
                    status = 'unlocked';
                  }
                  
                  return (
                    <PathNode 
                      key={topic.id || topic.name}
                      topic={topic}
                      status={status}
                      side={index % 2 === 0 ? 'left' : 'right'}
                      moduleName={module.name}
                      onNodeClick={handleNodeClick}
                    />
                  );
                })
              ))}
            </div>
          ))}
          
          {/* 最终目标节点 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-10 flex flex-col items-center"
          >
             <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center ring-8 ring-white shadow-lg">
                <Award className="w-8 h-8 text-white"/>
             </div>
             <h3 className="mt-4 font-bold text-lg text-slate-800">达成所有成就</h3>
             <p className="text-slate-500">成为职场技能大神！</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}