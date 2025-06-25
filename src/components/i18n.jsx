// 多语言配置
const translations = {
  zh: {
    // 通用
    common: {
      home: "首页",
      learning: "学习",
      training: "训练",
      leaderboard: "排行榜",
      profile: "我的",
      back: "返回",
      save: "保存",
      cancel: "取消",
      confirm: "确认",
      loading: "加载中...",
      comingSoon: "敬请期待",
      viewAll: "查看全部"
    },
    
    // 首页
    home: {
      greeting: {
        morning: "早上好",
        afternoon: "下午好", 
        evening: "晚上好"
      },
      student: "学员",
      dailyGoal: "今日目标",
      trainingTimes: "次训练",
      goalCompleted: "今日目标已完成，太棒了！",
      goalProgress: "加油，完成今天的训练目标吧！",
      totalTraining: "总训练",
      avgAccuracy: "平均正确率",
      masteredTopics: "精通主题",
      recommendedActions: "推荐行动",
      continueLearning: "继续学习",
      continueTraining: "继续训练",
      startTraining: "开始训练",
      startNewTopic: "学习新主题",
      skillCategories: "技能分类",
      start: "开始",
      learn: "学习",
      dailyTips: {
        tip1: "每天进步一点点，成就更好的自己！",
        tip2: "坚持学习，让知识成为你的力量！",
        tip3: "今天的训练，是明天成功的基石！",
        tip4: "持续练习，技能才能真正掌握！",
        tip5: "每一次学习都是对未来的投资！",
        tip6: "专业技能需要刻意练习来精进！",
        tip7: "学以致用，让知识转化为能力！",
        tip8: "今天比昨天更进步，就是最大的收获！"
      }
    },
    
    // 学习中心
    learning: {
      title: "学习中心",
      subtitle: "选择感兴趣的技能开始学习",
      topics: "个主题",
      mastered: "已精通",
      minutes: "分钟",
      difficulty: {
        beginner: "初级",
        intermediate: "中级",
        advanced: "高级"
      },
      status: {
        notStarted: "未开始",
        beginner: "初学",
        practicing: "练习中",
        proficient: "熟练",
        mastered: "精通"
      },
      vipOnly: "VIP专享",
      advancedCourse: "高级课程",
      upgradeToUnlock: "升级解锁",
      noCourses: "该分类下暂无课程"
    },
    
    // 训练中心
    training: {
      title: "训练中心",
      subtitle: "通过实战训练提升职场技能",
      trainingCompleted: "训练完成！",
      score: "分",
      correctAnswers: "答对",
      earnedPoints: "获得积分",
      answerPoints: "答题积分",
      bonusReward: "表现奖励",
      total: "总计",
      points: "积分",
      tryAgain: "再来一次",
      backToTraining: "返回训练",
      pointsShop: "积分商城",
      question: "题",
      noTrainingContent: "暂无训练内容",
      getInspiration: "AI回答灵感",
      lingdouBalance: "当前灵豆余额",
      aiThinking: "AI思考中...",
      enterAnswer: "在这里输入您的回答...",
      submitAnswer: "提交回答",
      analyzing: "AI分析中...",
      retryAnswer: "重新回答",
      nextQuestion: "下一题",
      finishTraining: "完成训练",
      answerAnalysis: "答案解析",
      passed: "通过",
      needsImprovement: "待提升",
      strengths: "亮点",
      improvements: "可改进"
    },
    
    // 个人中心
    profile: {
      title: "个人中心",
      trainingTimes: "训练次数",
      masteredTopics: "精通主题",
      avgAccuracy: "平均正确率",
      membershipCenter: "会员中心",
      upgradeVip: "升级VIP",
      trainingGoals: "训练目标",
      trainingHistory: "训练记录",
      lingdouHistory: "灵豆记录",
      pointsHistory: "积分记录",
      pointsShop: "积分商城",
      exchangeHistory: "兑换记录",
      myOrders: "我的订单",
      settings: "设置",
      shareWithFriends: "分享好友",
      contactSupport: "联系客服",
      logout: "退出登录",
      lingdou: "灵豆",
      points: "积分"
    },
    
    // 会员中心
    membership: {
      title: "会员中心",
      subtitle: "解锁全部潜能，加速你的职业成长",
      member: "会员",
      vipMember: "VIP会员",
      superVip: "超级VIP",
      ultimateVip: "至尊VIP",
      monthlyPrice: "/月",
      popular: "推荐",
      current: "当前",
      upgradeNow: "立即升级",
      activated: "已开通",
      lingdouShop: "灵豆商城",
      lingdouDescription: "灵豆可用于获取AI回答灵感，让你的回答更加出色",
      buy: "购买"
    },
    
    // 积分商城
    pointsShop: {
      title: "积分商城",
      subtitle: "用积分兑换精美奖品",
      myPoints: "我的积分",
      totalEarned: "累计获得",
      categories: {
        all: "全部",
        physical: "实物",
        virtual: "虚拟",
        badge: "徽章"
      },
      hot: "热门",
      premium: "精品",
      stock: "库存",
      sufficient: "充足",
      outOfStock: "缺货",
      exchange: "兑换",
      insufficient: "不足",
      needMorePoints: "积分不够用？",
      trainToEarn: "多做训练题目，每道题都有积分奖励哦！",
      goTraining: "去训练赚积分"
    },
    
    // 语言设置
    language: {
      title: "语言设置",
      chinese: "中文",
      english: "English",
      switch: "切换语言"
    },

    // 设置页面
    settings: {
        title: "设置"
    }
  },
  
  en: {
    // Common
    common: {
      home: "Home",
      learning: "Learning", 
      training: "Training",
      leaderboard: "Leaderboard",
      profile: "Profile",
      back: "Back",
      save: "Save",
      cancel: "Cancel", 
      confirm: "Confirm",
      loading: "Loading...",
      comingSoon: "Coming Soon",
      viewAll: "View All"
    },
    
    // Home
    home: {
      greeting: {
        morning: "Good Morning",
        afternoon: "Good Afternoon",
        evening: "Good Evening"
      },
      student: "Student",
      dailyGoal: "Daily Goal",
      trainingTimes: " trainings",
      goalCompleted: "Daily goal completed, excellent!",
      goalProgress: "Keep going, complete today's training goal!",
      totalTraining: "Total Training",
      avgAccuracy: "Avg Accuracy",
      masteredTopics: "Mastered Topics",
      recommendedActions: "Recommended Actions",
      continueLearning: "Continue Learning",
      continueTraining: "Continue Training",
      startTraining: "Start Training",
      startNewTopic: "Learn New Topic",
      skillCategories: "Skill Categories",
      start: "Start",
      learn: "Learn",
      dailyTips: {
        tip1: "A little progress each day makes a better you!",
        tip2: "Keep learning, let knowledge be your strength!",
        tip3: "Today's training is tomorrow's foundation for success!",
        tip4: "Continuous practice makes skills truly mastered!",
        tip5: "Every learning session is an investment in your future!",
        tip6: "Professional skills need deliberate practice to excel!",
        tip7: "Apply what you learn, turn knowledge into capability!",
        tip8: "Being better than yesterday is the greatest achievement!"
      }
    },
    
    // Learning Center
    learning: {
      title: "Learning Center",
      subtitle: "Choose skills you're interested in to start learning",
      topics: " topics",
      mastered: " mastered",
      minutes: " minutes",
      difficulty: {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced"
      },
      status: {
        notStarted: "Not Started",
        beginner: "Beginner",
        practicing: "Practicing",
        proficient: "Proficient",
        mastered: "Mastered"
      },
      vipOnly: "VIP Only",
      advancedCourse: "Advanced Course",
      upgradeToUnlock: "Upgrade to Unlock",
      noCourses: "No courses available in this category"
    },
    
    // Training Center
    training: {
      title: "Training Center",
      subtitle: "Improve workplace skills through practical training",
      trainingCompleted: "Training Completed!",
      score: " points",
      correctAnswers: "Correct: ",
      earnedPoints: "Points Earned",
      answerPoints: "Answer Points",
      bonusReward: "Bonus Reward",
      total: "Total",
      points: " points",
      tryAgain: "Try Again",
      backToTraining: "Back to Training",
      pointsShop: "Points Shop",
      question: " questions",
      noTrainingContent: "No training content available",
      getInspiration: "AI Answer Inspiration",
      lingdouBalance: "Current Lingdou Balance",
      aiThinking: "AI is thinking...",
      enterAnswer: "Enter your answer here...",
      submitAnswer: "Submit Answer",
      analyzing: "AI analyzing...",
      retryAnswer: "Retry Answer",
      nextQuestion: "Next Question",
      finishTraining: "Finish Training",
      answerAnalysis: "Answer Analysis",
      passed: "Passed",
      needsImprovement: "Needs Improvement",
      strengths: "Strengths",
      improvements: "Areas for Improvement"
    },
    
    // Profile
    profile: {
      title: "Profile",
      trainingTimes: "Training Times",
      masteredTopics: "Mastered Topics",
      avgAccuracy: "Avg Accuracy",
      membershipCenter: "Membership Center",
      upgradeVip: "Upgrade VIP",
      trainingGoals: "Training Goals",
      trainingHistory: "Training History",
      lingdouHistory: "Lingdou History",
      pointsHistory: "Points History",
      pointsShop: "Points Shop",
      exchangeHistory: "Exchange History",
      myOrders: "My Orders",
      settings: "Settings",
      shareWithFriends: "Share with Friends",
      contactSupport: "Contact Support",
      logout: "Logout",
      lingdou: "Lingdou",
      points: "Points"
    },
    
    // Membership
    membership: {
      title: "Membership Center",
      subtitle: "Unlock your full potential and accelerate career growth",
      member: " Member",
      vipMember: "VIP Member",
      superVip: "Super VIP",
      ultimateVip: "Ultimate VIP",
      monthlyPrice: "/month",
      popular: "Popular",
      current: "Current",
      upgradeNow: "Upgrade Now",
      activated: "Activated",
      lingdouShop: "Lingdou Shop",
      lingdouDescription: "Lingdou can be used to get AI answer inspiration for better responses",
      buy: "Buy"
    },
    
    // Points Shop
    pointsShop: {
      title: "Points Shop",
      subtitle: "Exchange points for amazing rewards",
      myPoints: "My Points",
      totalEarned: "Total Earned",
      categories: {
        all: "All",
        physical: "Physical",
        virtual: "Virtual",
        badge: "Badge"
      },
      hot: "Hot",
      premium: "Premium",
      stock: "Stock",
      sufficient: "Sufficient",
      outOfStock: "Out of Stock",
      exchange: "Exchange",
      insufficient: "Insufficient",
      needMorePoints: "Need more points?",
      trainToEarn: "Do more training exercises, each question rewards points!",
      goTraining: "Go Training for Points"
    },
    
    // Language Settings
    language: {
      title: "Language Settings",
      chinese: "中文",
      english: "English",
      switch: "Switch Language"
    },

    // Settings Page
    settings: {
        title: "Settings"
    }
  }
};

// 获取当前语言
export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'zh';
};

// 设置语言
export const setLanguage = (lang) => {
  localStorage.setItem('language', lang);
  window.location.reload(); // 刷新页面以应用新语言
};

// 获取翻译文本
export const t = (key, params = {}) => {
  const lang = getCurrentLanguage();
  const keys = key.split('.');
  let value = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }

  if (value === undefined) {
    // 如果当前语言没有找到，尝试默认语言（中文）
    value = translations.zh;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // 如果都没找到，返回key本身
      }
    }
  }

  // 处理参数替换
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }

  return value || key;
};