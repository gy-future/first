
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
      const topicParam = urlParams.get('id') || urlParams.get('topic');
      
      console.log("TopicDetail - URL参数:", topicParam);
      
      if (!topicParam) {
        console.log("没有找到主题参数");
        navigate(createPageUrl("Learning"));
        return;
      }

      const currentUser = await User.me();
      setUser(currentUser);
      
      // 获取所有主题
      const allTopics = await Topic.list();
      console.log("所有主题数量:", allTopics.length);
      
      let foundTopic = null;
      
      // 策略1: 直接通过ID匹配
      foundTopic = allTopics.find(t => t.id === topicParam);
      console.log("通过ID查找结果:", foundTopic?.name || "未找到");
      
      // 策略2: 通过名称匹配
      if (!foundTopic) {
        foundTopic = allTopics.find(t => t.name === topicParam);
        console.log("通过名称查找结果:", foundTopic?.name || "未找到");
      }
      
      // 策略3: 如果都没找到，从模拟数据中创建
      if (!foundTopic) {
        console.log("数据库中未找到，尝试从模拟数据创建");
        foundTopic = createMockTopic(topicParam);
      }

      setTopic(foundTopic);
      
      if (foundTopic) {
        // 获取用户进度
        const progressData = await UserProgress.filter({ 
          user_id: currentUser.id, 
          topic_id: foundTopic.id 
        });
        
        if (progressData.length > 0) {
          setUserProgress(progressData[0]);
        } else {
          setUserProgress(null); // Clear previous progress if not found
        }
      }
    } catch (error) {
      console.error("数据加载失败", error);
    } finally {
      setLoading(false);
    }
  };

  // 创建模拟主题数据
  const createMockTopic = (topicName) => {
    // 检查是否为预定义的主题
    const mockTopics = {
      '晋升汇报': {
        id: 'default_topic_求职招聘_求职应聘_晋升汇报',
        name: '晋升汇报',
        description: '掌握向上级汇报工作成果和申请晋升的核心技巧',
        category_name: '求职招聘',
        module_name: '求职应聘',
        goal: '学会如何有效地向上级展示自己的工作成果，提高晋升成功率',
        difficulty: '中级',
        estimated_time: 45,
        scenarios: [
          '年度绩效汇报时展示个人价值',
          '申请内部岗位调整时的表达技巧',
          '向领导争取更多资源和机会'
        ],
        knowledge_points: [
          {
            name: '汇报框架设计',
            content: '学习STAR法则：Situation（情境）、Task（任务）、Action（行动）、Result（结果）。\n\n在晋升汇报中，要清晰地描述：\n1. 面临的工作挑战或项目背景\n2. 承担的具体任务和职责\n3. 采取的关键行动和解决方案\n4. 取得的具体成果和影响\n\n记住，数据说话比空洞的形容词更有说服力。',
            type: 'text'
          },
          {
            name: '成果量化技巧',
            content: '如何用数字证明你的价值：\n\n• 业绩提升：销售额增长30%、客户满意度提升至95%\n• 效率优化：流程优化节省2小时/天、错误率降低50%\n• 团队影响：培训新人5名、跨部门协作项目3个\n• 创新贡献：提出改进建议10条、实施落地3项\n\n用具体的百分比、时间、金额来展示你的贡献。',
            type: 'text'
          },
          {
            name: '沟通表达要点',
            content: '晋升汇报的黄金法则：\n\n1. 开场：简洁明了地说明汇报目的\n2. 主体：按重要性排序展示成果\n3. 展望：说明未来的发展规划\n4. 结尾：明确表达晋升意愿\n\n语言技巧：\n• 用"我们团队"体现协作精神\n• 用"我负责/我主导"突出个人贡献\n• 避免过度谦虚，自信展示成果',
            type: 'audio'
          }
        ]
      },
      '情商段位来比拼': {
        id: 'default_topic_情商_情商识别_情商段位来比拼',
        name: '情商段位来比拼',
        description: '测试和提升你的情商水平，学会识别和管理情绪',
        category_name: '情商',
        module_name: '情商识别',
        goal: '提高情绪识别能力和情商水平',
        difficulty: '初级',
        estimated_time: 30,
        scenarios: [
          '职场冲突中的情绪管理',
          '团队合作中的情绪感知',
          '客户服务中的共情能力'
        ],
        knowledge_points: [
          {
            name: '情商基础概念',
            content: '情商包含四个核心维度：\n\n1. 自我情绪认知：能准确识别自己的情绪状态\n2. 自我情绪管理：能有效调节和控制情绪\n3. 他人情绪认知：能敏锐感知他人的情绪\n4. 关系管理：能运用情绪信息改善人际关系\n\n高情商的人在职场中通常表现更出色，领导力更强。',
            type: 'text'
          },
          {
            name: '情绪识别技巧',
            content: '如何快速识别情绪：\n\n• 观察面部表情：眉头、眼神、嘴角的变化\n• 注意肢体语言：姿态、手势、距离感\n• 倾听语音语调：语速、音量、停顿\n• 感受能量状态：兴奋、低落、紧张、放松\n\n练习：每天观察3个人的情绪状态，记录你的判断和验证结果。',
            type: 'video'
          },
          {
            name: '情绪管理策略',
            content: '常用的情绪调节方法：\n\n1. 深呼吸法：4秒吸气-4秒屏息-4秒呼气\n2. 认知重构：换个角度看问题\n3. 情绪命名：准确说出情绪类型\n4. 身体放松：肌肉松弛、适度运动\n5. 寻求支持：与信任的人分享\n\n记住：情绪本身没有对错，关键是如何合理表达和处理。',
            type: 'text'
          }
        ]
      },
      '向上管理试炼场': {
        id: 'default_topic_沟通_向上管理_向上管理试炼场',
        name: '向上管理试炼场',
        description: '学会与上级有效沟通，获得更多支持和发展机会',
        category_name: '沟通',
        module_name: '向上管理',
        goal: '掌握向上管理的核心技巧，改善与上级的工作关系',
        difficulty: '高级',
        estimated_time: 60,
        scenarios: [
          '与不同风格的领导打交道',
          '汇报工作进展和请求支持',
          '处理与上级的意见分歧'
        ],
        knowledge_points: [
          {
            name: '了解你的上级',
            content: '向上管理的第一步：了解领导的工作风格\n\n• 沟通偏好：邮件还是面谈？详细还是简洁？\n• 决策方式：数据驱动还是直觉判断？\n• 时间习惯：什么时候最容易接受新想法？\n• 压力来源：来自上级的压力点在哪里？\n• 价值观念：最看重什么样的工作成果？\n\n观察并适应领导的节奏，而不是让领导适应你。',
            type: 'text'
          },
          {
            name: '有效汇报技巧',
            content: '让汇报更有效的5个要点：\n\n1. 准备充分：提前梳理要点，准备可能的问题\n2. 简洁明了：先说结论，再说过程\n3. 数据支撑：用事实和数据说话\n4. 方案导向：不只是报告问题，要提出解决方案\n5. 积极主动：主动更新进展，及时寻求指导\n\n汇报模板：目标-现状-问题-方案-需要的支持',
            type: 'video'
          },
          {
            name: '处理分歧和冲突',
            content: '与上级意见不一致时的处理策略：\n\n• 理解立场：先了解领导的考虑角度\n• 表达观点：用"我认为"而不是"你错了"\n• 寻找共同点：找到双方都认同的目标\n• 提供选择：给出多个方案供领导选择\n• 尊重决定：即使不同意也要执行决定\n\n记住：向上管理不是操控，而是协作。',
            type: 'text'
          }
        ]
      }
    };

    // 如果找到预定义的主题，返回它
    if (mockTopics[topicName]) {
      return mockTopics[topicName];
    }

    // 否则创建一个通用的默认主题
    return {
      id: `default_topic_${topicName.replace(/\s/g, '_')}`,
      name: topicName,
      description: `${topicName}的详细学习内容`,
      goal: `掌握${topicName}的核心概念和实用技巧`,
      difficulty: '初级',
      estimated_time: 30,
      scenarios: [
        `${topicName}的实际应用场景`,
        `如何在工作中运用${topicName}`,
        `${topicName}的进阶技巧`
      ],
      knowledge_points: [
        {
          name: `${topicName}基础概念`,
          content: `这是${topicName}的基础学习内容。\n\n在这个章节中，您将学习：\n1. ${topicName}的基本定义和重要性\n2. ${topicName}在职场中的具体应用\n3. 掌握${topicName}的核心技巧\n\n通过系统的学习，您将能够熟练运用${topicName}来提升工作效率。`,
          type: 'text'
        },
        {
          name: `${topicName}实践技巧`,
          content: `${topicName}的实践应用方法：\n\n• 第一步：理解核心原理\n• 第二步：观察实际案例\n• 第三步：模拟练习\n• 第四步：实际应用\n• 第五步：反思总结\n\n记住：理论结合实践，才能真正掌握技能。`,
          type: 'video'
        },
        {
          name: `${topicName}进阶应用`,
          content: `进阶级的${topicName}应用策略：\n\n1. 深度理解：不仅知道怎么做，更要知道为什么\n2. 灵活运用：根据不同情况调整策略\n3. 持续改进：定期反思和优化方法\n4. 经验分享：与他人交流学习心得\n\n持续的学习和实践是成长的关键。`,
          type: 'text'
        }
      ]
    };
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
      
      // 重新加载数据以确保状态更新
      await loadData();
      
      // 显示成功提示
      alert('恭喜！你已完成本主题的学习，现在可以开始训练了！');
    } catch (error) {
      console.error("更新进度失败", error);
      alert('保存学习进度时出现问题，请重试');
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-8 pb-8 px-6">
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
