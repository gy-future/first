
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Question, Topic, UserProgress, TrainingSession, User, LingdouTransaction } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { ArrowLeft, Mic, Send, Volume2, Check, X, Loader2, ThumbsUp, ThumbsDown, Gem, Sparkles, Zap } from 'lucide-react'; // Added Zap
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
    setSessionFinished(true);

    try {
      if (!user || !currentTopic) {
        console.error("User or topic not loaded, cannot save user progress.");
        return;
      }

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
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-6 text-white text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <h2 className="text-2xl font-bold mb-2">训练完成！</h2>
          <div className="w-48 h-48 rounded-full bg-white/20 flex flex-col items-center justify-center mx-auto my-8">
            <span className="text-5xl font-bold">{finalScore}</span>
            <span className="text-lg">分</span>
          </div>
          <p className="mb-4">答对 {answers.filter(a => a.is_correct).length} / {questions.length} 题</p>
          <div className="flex gap-4">
            <Button variant="outline" className="text-white border-white/50" onClick={() => window.location.reload()}>再来一次</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate(createPageUrl('TrainingHub'))}>返回训练</Button>
            <Button className="bg-green-500 hover:bg-green-600" onClick={() => navigate(createPageUrl('TrainingHistory'))}>查看记录</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium text-slate-600">
              第 {currentQuestionIndex + 1} / {questions.length} 题
            </span>
            <div className="w-10"></div>
          </div>
          <Progress value={progress} className="h-1.5" />
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
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Card className="shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                      <Volume2 className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-800 text-lg leading-relaxed pt-2">{currentQuestion.content}</p>
                  </div>

                  {/* Question Type Content */}
                  {currentQuestion.type === 'choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map(option => (
                        <div
                          key={option.label}
                          onClick={() => handleOptionSelect(option)}
                          className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            showResult && option.is_correct ? 'bg-green-50 border-green-500 shadow-md' :
                            showResult && selectedOption?.label === option.label && !option.is_correct ? 'bg-red-50 border-red-500 shadow-md' :
                            'bg-white hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold ${
                            showResult && (option.is_correct || selectedOption?.label === option.label) ?
                              (option.is_correct ? 'border-green-500 bg-green-500 text-white' : 'border-red-500 bg-red-500 text-white') :
                              'border-slate-300 text-slate-500'
                          }`}>
                            {showResult ? (option.is_correct ? <Check size={16} /> : <X size={16} />) : option.label}
                          </div>
                          <span className="flex-1 text-slate-700">{option.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'voice' && !showResult && (
                     <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <Button variant="outline" size="sm" onClick={handleGetInspiration} disabled={isLoadingInspiration}>
                            <Sparkles className={`mr-2 h-4 w-4 text-blue-500`} />
                            AI回答灵感
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
                            className="w-full h-40 p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <Button 
                            onClick={handleVoiceSubmit}
                            disabled={isProcessingAI || transcript.length < 10}
                            className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 py-6 text-base"
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
                      className="mt-8"
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

                      {/* 按钮区域 */}
                      <div className="flex gap-3 mt-6">
                        {currentQuestion.type === 'voice' && aiFeedback && !aiFeedback.passed && (
                          <Button
                            onClick={handleRetryQuestion}
                            variant="outline"
                            className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            重新回答
                          </Button>
                        )}
                        <Button
                          onClick={handleNextQuestion}
                          className={`${currentQuestion.type === 'voice' && aiFeedback && !aiFeedback.passed ? 'flex-1' : 'w-full'} bg-orange-500 hover:bg-orange-600 rounded-full py-6 text-base`}
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
