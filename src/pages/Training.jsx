
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Question, Topic, UserProgress, TrainingSession, User, LingdouTransaction, PointsTransaction } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { ArrowLeft, Mic, Send, Volume2, Check, X, Loader2, ThumbsUp, ThumbsDown, Gem, Sparkles, Zap, Award, Gift } from 'lucide-react'; // Added Zap, Award, Gift
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { createPageUrl } from '@/utils';

// AI反馈组件
const AIFeedback = ({ feedback }) => {
  if (!feedback) return null;

  const radarData = [
    { subject: '问题理解', A: feedback.problem_understanding || 0, fullMark: 5 },
    { subject: '原则体现', A: feedback.principle_application || 0, fullMark: 5 },
    { subject: '知识点掌握', A: feedback.knowledge_mastery || 0, fullMark: 5 },
    { subject: '语言逻辑性', A: feedback.logical_coherence || 0, fullMark: 5 },
    { subject: '语言流畅度', A: feedback.fluency || 0, fullMark: 5 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
      <div className="space-y-2">
        <h3 className={`text-4xl font-bold ${feedback.passed ? 'text-green-500' : 'text-red-500'}`}>
          {feedback.passed ? '通过' : '待提升'}
        </h3>
        <p className="text-slate-600 text-lg">"{feedback.comment}"</p>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
            <Radar name="得分" dataKey="A" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-left space-y-4">
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-2 text-green-600"><ThumbsUp className="w-5 h-5"/>亮点</h4>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-800">{feedback.strength}</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-600"><ThumbsDown className="w-5 h-5"/>可改进</h4>
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-red-800">{feedback.weakness}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Training() {
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiFeedback, setAIFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [user, setUser] = useState(null);
  const [aiInspiration, setAiInspiration] = useState('');
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const urlParams = new URLSearchParams(location.search);
      let topicId = urlParams.get('topic') || urlParams.get('id');

      console.log("Training page - URL params:", urlParams.toString());
      console.log("Training page - topicId:", topicId);

      if (!topicId) {
        console.error("No topic ID found in URL");
        setQuestions([]);
        setIsLoading(false);
        return;
      }

      // 先获取所有主题，找到对应的主题
      const allTopics = await Topic.list();
      let foundTopic = allTopics.find(t => t.id === topicId);
      
      if (!foundTopic) {
        // 如果通过ID找不到，尝试通过名称查找
        foundTopic = allTopics.find(t => t.name === topicId);
      }

      console.log("Found topic:", foundTopic);
      setCurrentTopic(foundTopic);

      if (!foundTopic) {
        console.error("Topic not found:", topicId);
        setQuestions([]);
        setIsLoading(false);
        return;
      }

      // 获取该主题的所有题目
      const allQuestions = await Question.list();
      const topicQuestions = allQuestions.filter(q => q.topic_name === foundTopic.name);

      console.log("All questions:", allQuestions.length);
      console.log("Topic questions for", foundTopic.name, ":", topicQuestions.length);

      setQuestions(topicQuestions);
    } catch (error) {
      console.error("加载数据失败:", error);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePoints = (isCorrect, difficulty = 1) => {
    // 基础积分：答对10分，答错5分
    let basePoints = isCorrect ? 10 : 5;
    // 难度系数：1-5对应1.0-1.5倍
    let difficultyMultiplier = 1 + (difficulty - 1) * 0.1;
    return Math.round(basePoints * difficultyMultiplier);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleOptionSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    setAnswers([...answers, { question_id: currentQuestion.id, is_correct: option.is_correct }]);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedOption(null);
    setAIFeedback(null);
    setTranscript('');
    setAiInspiration(''); // Clear inspiration for next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishSession();
    }
  };

  const handleRetryQuestion = () => {
    setShowResult(false);
    setSelectedOption(null);
    setAIFeedback(null);
    setTranscript('');
    setAiInspiration(''); // Clear inspiration for retry
  };

  const handleGetInspiration = async () => {
    try {
      const currentUser = await User.me(); // Ensure we have the latest user data
      
      // 检查用户是否有足够的灵豆
      if ((currentUser.lingdou_balance || 0) < 1) {
        const confirmBuy = window.confirm('灵豆不足！每次获取灵感需要1个灵豆。是否前往购买？');
        if (confirmBuy) {
          navigate(createPageUrl('Membership'));
        }
        return;
      }

      setIsLoadingInspiration(true);
      setAiInspiration('');
      
      const prompt = `针对问题："${currentQuestion.content}"，请提供三个核心的回答思路或要点，帮助我构思答案。请直接返回思路要点，无需额外解释。`;
      
      try {
        const result = await InvokeLLM({ prompt });
        setAiInspiration(result);
        
        // 扣除1个灵豆
        const newBalance = (currentUser.lingdou_balance || 0) - 1;
        await User.updateMyUserData({
          lingdou_balance: newBalance,
          total_lingdou_used: (currentUser.total_lingdou_used || 0) + 1
        });
        
        // 记录交易记录
        await LingdouTransaction.create({
          user_id: currentUser.id,
          type: 'consume',
          amount: -1,
          reason: '获取AI回答灵感',
          balance_after: newBalance
        });
        
        // 更新用户状态
        setUser({ ...currentUser, lingdou_balance: newBalance });
        
      } catch (error) {
        console.error("AI inspiration error:", error);
        setAiInspiration("获取灵感失败，请稍后再试。");
      }
    } catch (error) {
      console.error("用户数据获取失败", error);
      setAiInspiration("无法获取用户灵豆信息，请检查网络。");
    } finally {
      setIsLoadingInspiration(false);
    }
  };

  const handleVoiceSubmit = async () => {
    setIsProcessingAI(true);
    const prompt = `
      模拟职场面试官，评估以下回答。
      问题是：'${currentQuestion.content}'
      用户的回答是：'${transcript}'
      核心考察知识点：'${currentQuestion.analysis}'

      请根据以下JSON格式返回评估结果，所有评分项为1-5分：
      {
        "passed": boolean, // 综合判断是否通过
        "comment": "string", // 一句总结性评语
        "strength": "string", // 找到一个最主要的亮点
        "weakness": "string", // 找到一个最需要改进的点
        "problem_understanding": number,
        "principle_application": number,
        "knowledge_mastery": number,
        "logical_coherence": number,
        "fluency": number
      }
    `;

    try {
      const result = await InvokeLLM({ prompt, response_json_schema: { type: "object" } });
      setAIFeedback(result);
      setAnswers([...answers, { question_id: currentQuestion.id, is_correct: result.passed }]);
    } catch (error) {
      console.error("AI feedback error:", error);

      let errorMessage = "评估出错，请稍后重试。";
      // 检查是否是由于请求过于频繁导致的错误
      if (error.isAxiosError && error.response && error.response.status === 429) {
        errorMessage = "AI分析服务器正忙，请稍等片刻再试。";
      }

      // 提供一个备用的反馈信息
      setAIFeedback({
        passed: false,
        comment: errorMessage,
        strength: "本次无法进行评估。",
        weakness: "请检查您的网络连接或稍后重试。",
        problem_understanding: 0,
        principle_application: 0,
        knowledge_mastery: 0,
        logical_coherence: 0,
        fluency: 0
      });
    } finally {
      setIsProcessingAI(false);
      setShowResult(true);
    }
  };

  const finishSession = async () => {
    const correctCount = answers.filter(a => a.is_correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    setFinalScore(score);
    
    // 计算本次训练获得的积分
    let totalPoints = 0;
    answers.forEach((answer, index) => {
      const question = questions[index];
      const points = calculatePoints(answer.is_correct, question?.difficulty || 1);
      totalPoints += points;
    });

    // 奖励积分：根据正确率给予额外积分
    let bonusPoints = 0;
    if (score >= 90) bonusPoints = 20;
    else if (score >= 80) bonusPoints = 15;
    else if (score >= 70) bonusPoints = 10;
    else if (score >= 60) bonusPoints = 5;

    const finalTotalPoints = totalPoints + bonusPoints;

    try {
      if (!user || !currentTopic) {
        console.error("User or topic not loaded, cannot save user progress.");
        return;
      }

      // 更新用户积分
      const newPointsBalance = (user.points_balance || 0) + finalTotalPoints;
      const newTotalEarned = (user.total_points_earned || 0) + finalTotalPoints;
      
      await User.updateMyUserData({
        points_balance: newPointsBalance,
        total_points_earned: newTotalEarned
      });

      // 记录积分交易
      await PointsTransaction.create({
        user_id: user.id,
        type: 'earn',
        amount: finalTotalPoints,
        reason: `${currentTopic.name}训练完成 (${score}分)`,
        balance_after: newPointsBalance
      });

      const progressRecords = await UserProgress.filter({ user_id: user.id, topic_id: currentTopic.id });

      const existingProgress = progressRecords.length > 0 ? progressRecords[0] : null;

      const newTrainingCount = (existingProgress?.training_count || 0) + 1;
      const totalQuestionsAnswered = (existingProgress?.total_questions || 0) + questions.length;
      const totalCorrectAnswers = (existingProgress?.correct_answers || 0) + correctCount;
      const newAccuracy = totalQuestionsAnswered > 0 ? (totalCorrectAnswers / totalQuestionsAnswered) : 0;

      if (existingProgress) {
        await UserProgress.update(existingProgress.id, {
          training_count: newTrainingCount,
          correct_answers: totalCorrectAnswers,
          total_questions: totalQuestionsAnswered,
          accuracy_rate: Math.round(newAccuracy * 100),
          best_score: Math.max(existingProgress.best_score || 0, score),
          last_trained_date: new Date().toISOString().split('T')[0],
        });
      } else {
        await UserProgress.create({
          user_id: user.id,
          topic_id: currentTopic.id,
          training_count: 1,
          correct_answers: correctCount,
          total_questions: questions.length,
          accuracy_rate: score,
          best_score: score,
          last_trained_date: new Date().toISOString().split('T')[0],
        });
      }

      await TrainingSession.create({
        user_id: user.id,
        topic_id: currentTopic.id,
        questions_answered: questions.length,
        correct_count: correctCount,
        total_score: score,
        completion_date: new Date().toISOString(),
      });
      setSessionFinished(true);
    } catch (error) {
      console.error("保存训练记录失败:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4" />
          <p className="text-slate-600">加载训练题目...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无训练内容</h3>
        <p className="text-sm text-slate-500 mb-2">当前主题: {currentTopic?.name || '未知'}</p>
        <p className="text-sm text-slate-500 mb-6">该主题下还没有可用的训练题目。</p>
        <div className="space-y-3">
          <Button onClick={() => navigate(createPageUrl('TrainingHub'))}>
            返回训练中心
          </Button>
          {currentTopic && (
            <Button variant="outline" onClick={() => navigate(createPageUrl(`TopicDetail?id=${currentTopic.id}`))}>
              查看主题详情
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (sessionFinished) {
    const correctCount = answers.filter(a => a.is_correct).length;
    let totalPoints = 0;
    answers.forEach((answer, index) => {
      const question = questions[index];
      const points = calculatePoints(answer.is_correct, question?.difficulty || 1);
      totalPoints += points;
    });
    
    let bonusPoints = 0;
    if (finalScore >= 90) bonusPoints = 20;
    else if (finalScore >= 80) bonusPoints = 15;
    else if (finalScore >= 70) bonusPoints = 10;
    else if (finalScore >= 60) bonusPoints = 5;

    const finalTotalPoints = totalPoints + bonusPoints;

    // 根据得分确定等级和颜色
    const getScoreLevel = (score) => {
      if (score >= 90) return { level: '优秀', color: 'from-green-500 to-emerald-600', emoji: '🎉' };
      if (score >= 80) return { level: '良好', color: 'from-blue-500 to-indigo-600', emoji: '👍' };
      if (score >= 70) return { level: '及格', color: 'from-yellow-500 to-orange-500', emoji: '💪' };
      return { level: '需提升', color: 'from-red-500 to-pink-600', emoji: '🔥' };
    };

    const scoreLevel = getScoreLevel(finalScore);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* 头部区域 */}
          <div className={`bg-gradient-to-r ${scoreLevel.color} p-6 text-white text-center relative overflow-hidden`}>
            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative">
              <div className="text-4xl mb-2">{scoreLevel.emoji}</div>
              <h2 className="text-xl font-bold mb-2">训练完成！</h2>
              <div className="text-3xl font-bold mb-1">{finalScore}分</div>
              <div className="text-sm opacity-90">{scoreLevel.level}</div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6 space-y-4">
            {/* 成绩统计 */}
            <div className="text-center">
              <p className="text-slate-600 mb-4">答对 {correctCount} / {questions.length} 题</p>
              
              {/* 积分奖励 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-semibold text-purple-800">获得积分</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>答题积分:</span>
                    <span className="font-medium">+{totalPoints}</span>
                  </div>
                  {bonusPoints > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>表现奖励:</span>
                      <span className="font-medium text-green-600">+{bonusPoints}</span>
                    </div>
                  )}
                  <div className="border-t border-purple-200 pt-2">
                    <div className="flex justify-between font-bold text-purple-700">
                      <span>总计:</span>
                      <span>+{finalTotalPoints} 积分</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  再来一次
                </Button>
                <Button 
                  onClick={() => navigate(createPageUrl('TrainingHub'))}
                  className={`bg-gradient-to-r ${scoreLevel.color} hover:opacity-90 text-white font-medium transition-all duration-200`}
                >
                  返回训练
                </Button>
              </div>
              
              <Button 
                onClick={() => navigate(createPageUrl('PointsShop'))}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
              >
                <Gift className="w-4 h-4 mr-2" />
                积分商城
              </Button>
            </div>

            {/* 鼓励文案 */}
            <div className="text-center pt-2">
              {finalScore >= 90 ? (
                <p className="text-sm text-green-600 font-medium">🌟 表现优秀！继续保持！</p>
              ) : finalScore >= 80 ? (
                <p className="text-sm text-blue-600 font-medium">👏 做得不错！再接再厉！</p>
              ) : finalScore >= 70 ? (
                <p className="text-sm text-yellow-600 font-medium">💪 继续努力，你会更好！</p>
              ) : (
                <p className="text-sm text-red-600 font-medium">🔥 多练习几次，一定能提高！</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* 底部提示 */}
        {currentTopic && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-slate-500">
              刚刚完成了 <span className="font-medium text-slate-700">{currentTopic.name}</span> 的训练
            </p>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-manipulation">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium text-slate-600">
              第 {currentQuestionIndex + 1} / {questions.length} 题
            </span>
            <div className="w-10"></div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <main className="p-4 max-w-xl mx-auto">
        {currentQuestion && (
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="shadow-lg overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                      <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <p className="font-semibold text-slate-800 text-base sm:text-lg leading-relaxed pt-1 sm:pt-2">{currentQuestion.content}</p>
                  </div>

                  {/* Question Type Content */}
                  {currentQuestion.type === 'choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map(option => (
                        <div
                          key={option.label}
                          onClick={() => handleOptionSelect(option)}
                          className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 touch-manipulation ${
                            showResult && option.is_correct ? 'bg-green-50 border-green-500 shadow-md' :
                            showResult && selectedOption?.label === option.label && !option.is_correct ? 'bg-red-50 border-red-500 shadow-md' :
                            'bg-white hover:border-blue-400 hover:bg-blue-50 active:scale-[0.98]'
                          }`}
                        >
                          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm sm:text-base ${
                            showResult && (option.is_correct || selectedOption?.label === option.label) ?
                              (option.is_correct ? 'border-green-500 bg-green-500 text-white' : 'border-red-500 bg-red-500 text-white') :
                              'border-slate-300 text-slate-500'
                          }`}>
                            {showResult ? (option.is_correct ? <Check size={14} /> : <X size={14} />) : option.label}
                          </div>
                          <span className="flex-1 text-slate-700 text-sm sm:text-base">{option.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'voice' && !showResult && (
                     <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <Button variant="outline" size="sm" onClick={handleGetInspiration} disabled={isLoadingInspiration} className="touch-manipulation">
                            <Sparkles className={`mr-2 h-4 w-4 text-blue-500`} />
                            <span className="text-sm">AI回答灵感</span>
                            <div className="ml-2 flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                              <Zap className="w-3 h-3" />
                              1灵豆
                            </div>
                          </Button>
                        </div>
                        <div className="text-xs text-slate-500">
                          当前灵豆余额: {user?.lingdou_balance || 0}
                        </div>
                        {isLoadingInspiration && <div className="text-sm text-slate-500 animate-pulse">AI思考中...</div>}
                        {aiInspiration && (
                          <motion.div initial={{opacity:0, y: -10}} animate={{opacity:1, y:0}} className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left text-sm text-blue-800 whitespace-pre-line">
                            {aiInspiration}
                          </motion.div>
                        )}
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="在这里输入您的回答..."
                            className="w-full h-32 sm:h-40 p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                        />
                        <Button 
                            onClick={handleVoiceSubmit}
                            disabled={isProcessingAI || transcript.length < 10}
                            className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-base w-full sm:w-auto touch-manipulation"
                        >
                            {isProcessingAI ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                            {isProcessingAI ? 'AI分析中...' : '提交回答'}
                        </Button>
                    </div>
                  )}

                  {/* Result/Feedback Section */}
                  <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 sm:mt-8"
                    >
                      {currentQuestion.type === 'choice' && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="font-bold mb-2 text-slate-800">答案解析</h4>
                          <p className="text-sm text-slate-700 whitespace-pre-line">{currentQuestion.analysis}</p>
                        </div>
                      )}
                      {currentQuestion.type === 'voice' && (
                        <AIFeedback feedback={aiFeedback} />
                      )}

                      {/* 按钮区域 - 移动端优化 */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        {currentQuestion.type === 'voice' && aiFeedback && !aiFeedback.passed && (
                          <Button
                            onClick={handleRetryQuestion}
                            variant="outline"
                            className="w-full sm:flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 touch-manipulation"
                          >
                            重新回答
                          </Button>
                        )}
                        <Button
                          onClick={handleNextQuestion}
                          className={`${currentQuestion.type === 'voice' && aiFeedback && !aiFeedback.passed ? 'w-full sm:flex-1' : 'w-full'} bg-orange-500 hover:bg-orange-600 rounded-full py-3 sm:py-6 text-sm sm:text-base touch-manipulation`}
                        >
                          {currentQuestionIndex < questions.length - 1 ? '下一题' : '完成训练'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
