
import React, { useState, useEffect, useMemo } from "react";
import { Category, Topic, UserProgress, User, Question } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Clock, BookOpen, Play, CheckCircle, Gem, Target, Zap, Users, TrendingUp, BrainCircuit, Map as MapIcon, Lock, Award, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// 学习路径节点组件 - 优化紧凑性和层次感 (Not used in the new path view, but kept for other views if any)
const PathNode = ({ topic, status, side, moduleName, onNodeClick }) => {
  const isLeft = side === 'left';
  
  const statusConfig = {
    completed: {
      icon: <CheckCircle className="w-3 h-3 text-white" />,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      badge: '✓',
      badgeColor: 'bg-green-500 text-white',
      shadowColor: 'shadow-green-200',
    },
    current: {
      icon: <Play className="w-3 h-3 text-white" />,
      bgColor: 'bg-blue-600 animate-pulse',
      textColor: 'text-white',
      badge: '▶',
      badgeColor: 'bg-blue-600 text-white animate-pulse',
      shadowColor: 'shadow-blue-200',
    },
    unlocked: {
      icon: <BookOpen className="w-3 h-3 text-slate-600" />,
      bgColor: 'bg-white',
      textColor: 'text-slate-800',
      badge: `${Math.ceil((topic.estimated_time || 30) / 10)}min`,
      badgeColor: 'bg-slate-100 text-slate-600',
      shadowColor: 'shadow-slate-200',
    },
    locked: {
      icon: <Lock className="w-3 h-3 text-slate-400" />,
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-400',
      badge: '🔒',
      badgeColor: 'bg-slate-100 text-slate-400',
      shadowColor: 'shadow-slate-100',
    }
  };

  const config = statusConfig[status] || statusConfig.locked;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`relative mb-4 w-full flex ${isLeft ? 'justify-start' : 'justify-end'}`}
      onClick={() => status !== 'locked' && onNodeClick(topic)}
    >
      {/* 连接线 */}
      <div className="absolute top-1/2 -translate-y-1/2 w-1/2 border-t border-dashed border-slate-300" style={isLeft ? { right: '50%' } : { left: '50%' }}></div>
      
      {/* 中心节点 */}
      <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white ${
        status === 'completed' ? 'bg-green-500' : 
        status === 'current' ? 'bg-blue-500 ring-2 ring-blue-200' : 
        status === 'unlocked' ? 'bg-slate-300' : 'bg-slate-200'
      } ${config.shadowColor} shadow-lg`} 
      style={isLeft ? { right: 'calc(50% - 4px)' } : { left: 'calc(50% - 4px)' }}></div>
      
      {/* 内容卡片 */}
      <Card className={`w-[calc(50%-1rem)] ${config.shadowColor} shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-200 ${
        status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'
      } ${config.bgColor} ${status === 'current' ? 'ring-1 ring-blue-300' : ''} border-0`}>
        <CardContent className="p-2.5">
          <div className="flex items-start gap-2">
            {/* 状态图标 */}
            <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center ${
              status === 'completed' ? 'bg-green-500' :
              status === 'current' ? 'bg-blue-600' :
              status === 'unlocked' ? 'bg-slate-100' : 'bg-slate-50'
            }`}>
              {status === 'completed' ? (
                <CheckCircle className="w-3 h-3 text-white" />
              ) : status === 'current' ? (
                <Play className="w-3 h-3 text-white" />
              ) : status === 'unlocked' ? (
                <span className="text-xs">{topic.emoji || '📚'}</span>
              ) : (
                <Lock className="w-3 h-3 text-slate-400" />
              )}
            </div>
            
            {/* 内容区域 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h4 className={`font-semibold text-xs leading-tight ${config.textColor} line-clamp-2`}>
                  {topic.name}
                </h4>
                <Badge className={`${config.badgeColor} text-xs px-1 py-0.5 ml-1 flex-shrink-0`}>
                  {config.badge}
                </Badge>
              </div>
              
              <p className={`text-xs leading-tight truncate ${
                status !== 'unlocked' ? 'text-white/80' : 'text-slate-500'
              }`}>
                {moduleName}
              </p>
              
              {/* 进度指示器 */}
              {status !== 'locked' && (
                <div className="mt-1.5 flex items-center gap-1">
                  <div className={`w-full h-0.5 rounded-full ${
                    status === 'completed' ? 'bg-green-200' :
                    status === 'current' ? 'bg-blue-200' : 'bg-slate-200'
                  }`}>
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      status === 'completed' ? 'bg-green-400 w-full' :
                      status === 'current' ? 'bg-blue-400 w-1/3' : 'bg-slate-300 w-0'
                    }`}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 分类里程碑组件 - 更紧凑的设计 (Not used in the new path view, but kept for other views if any)
const MilestoneNode = ({ category }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative my-6 flex items-center justify-center"
    >
      <div className="w-full border-t border-slate-300"></div>
      <div className="absolute px-2 bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-md flex items-center justify-center">
            <span className="text-sm">{category.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{category.name}</h3>
            <p className="text-xs text-slate-500 leading-tight">{category.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 折叠式模块节点组件 (Used by "Modules" tab, not affected by the "path" tab changes)
const CollapsibleModule = ({ module, topics, userProgress, onTopicClick, isExpanded, onToggle, getTopicProgress }) => {
  // Filter all topics down to only those that match the module's category and name.
  // This will primarily use database-fetched topics if available.
  const moduleTopicsFromDB = topics.filter(topic => 
    topic.category_name === module.category && 
    topic.module_name === module.name
  );

  // If no topics are found in the database for this module, use default/mock topics.
  // This ensures the module always has content to display, even if not yet fully defined in the backend.
  const finalTopics = moduleTopicsFromDB.length > 0 ? moduleTopicsFromDB : 
    (module.topics || []).map((topicName) => ({
      id: `default_topic_${module.category}_${module.name}_${topicName.replace(/\s/g, '_')}`,
      name: topicName,
      category_name: module.category,
      module_name: module.name,
      estimated_time: 30, // Default estimated time
      emoji: '📚' // Default emoji
    }));

  const completedCount = finalTopics.filter(topic => {
    const progress = getTopicProgress(topic.id, topic.name);
    return progress.knowledge_learned;
  }).length;

  const progressPercentage = finalTopics.length > 0 ? (completedCount / finalTopics.length) * 100 : 0;

  // Find the first uncompleted topic to mark as 'current'
  const currentTopicIndex = finalTopics.findIndex(topic => {
    const progress = getTopicProgress(topic.id, topic.name);
    return !progress.knowledge_learned;
  });

  return (
    <div className="mb-4">
      {/* 模块头部 (Card that toggles expansion) */}
      <Card className={`cursor-pointer transition-all duration-200 ${
        progressPercentage === 100 ? 'bg-green-50 border-green-200' :
        progressPercentage > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white'
      }`} onClick={onToggle}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Chevron icon for expand/collapse */}
              {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              {/* Module icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                progressPercentage === 100 ? 'bg-green-500' :
                progressPercentage > 0 ? 'bg-blue-500' : 'bg-slate-400'
              }`}>
                <span className="text-xl text-white">{module.icon}</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800">{module.name}</h3>
                {/* Completion badge */}
                <Badge className={
                  progressPercentage === 100 ? 'bg-green-100 text-green-700' :
                  progressPercentage > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }>
                  {completedCount}/{finalTopics.length}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 mb-2">{module.description}</p>
              
              {/* Progress bar for the module */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    progressPercentage === 100 ? 'bg-green-500' :
                    progressPercentage > 0 ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                  style={{ width: `${Math.max(progressPercentage, 2)}%` }} // Ensure progress bar is visible even at 0%
                />
              </div>
              
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{module.category}</span>
                <span>{Math.round(progressPercentage)}% 完成</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Topic List (conditionally rendered) */}
      {isExpanded && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-slate-200 pl-4">
          {finalTopics.map((topic, index) => {
            const progress = getTopicProgress(topic.id, topic.name);
            const isCompleted = progress.knowledge_learned;
            // Mark as 'current' if it's the first uncompleted topic
            const isCurrent = currentTopicIndex === index;
            // Topics after the 'current' one (if current one exists) are locked
            const isLocked = currentTopicIndex !== -1 && index > currentTopicIndex;

            return (
              <Card 
                key={topic.id || topic.name}
                className={`cursor-pointer transition-all duration-200 ${
                  isCompleted ? 'bg-green-50 border-green-200' :
                  isCurrent ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' :
                  isLocked ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white hover:bg-slate-50'
                }`}
                onClick={() => !isLocked && onTopicClick(topic)} // Only clickable if not locked
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Status icon for each topic */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' :
                      isCurrent ? 'bg-blue-500' :
                      isLocked ? 'bg-slate-300' : 'bg-slate-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : isCurrent ? (
                        <Play className="w-4 h-4 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-slate-500" />
                      ) : (
                        <span className="text-sm">{topic.emoji || '📚'}</span>
                      )}
                    </div>
                    
                    {/* Topic information */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-sm ${
                          isLocked ? 'text-slate-400' : 'text-slate-800'
                        }`}>
                          {topic.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs animate-pulse">
                              从这开始
                            </Badge>
                          )}
                          <span className={`text-xs ${
                            isLocked ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {topic.estimated_time || 30}分钟
                          </span>
                        </div>
                      </div>
                      
                      {/* Training count and best score */}
                      {(progress.training_count > 0 || progress.best_score > 0) && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          {progress.training_count > 0 && <span>训练{progress.training_count}次</span>}
                          {progress.best_score > 0 && <span>最高{progress.best_score}分</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 分类分组组件 (Used by "Modules" tab, not affected by the "path" tab changes)
const CategorySection = ({ category, modules, topics, userProgress, onTopicClick, expandedModules, onModuleToggle, getTopicProgress }) => {
  // Filter the list of all modules to only include those belonging to the current category.
  const categoryModules = modules.filter(m => m.category === category.name);
  
  // Calculate total topics within this category for progress tracking.
  const totalTopics = categoryModules.reduce((sum, module) => {
    // Check if the module has actual topics loaded from DB, otherwise fallback to default topics list.
    const moduleTopics = topics.filter(t => 
      t.category_name === module.category && t.module_name === module.name
    );
    return sum + (moduleTopics.length > 0 ? moduleTopics.length : (module.topics?.length || 0));
  }, 0);
  
  // Calculate completed topics within this category.
  const completedTopics = categoryModules.reduce((sum, module) => {
    const moduleTopics = topics.filter(t => 
      t.category_name === module.category && t.module_name === module.name
    );
    // If no DB topics, use the default ones for progress calculation.
    const currentModuleTopics = moduleTopics.length > 0 ? moduleTopics : (module.topics || []).map(name => ({ name }));
    
    return sum + currentModuleTopics.filter(topic => {
      const progress = getTopicProgress(topic.id, topic.name);
      return progress?.knowledge_learned;
    }).length;
  }, 0);

  // Calculate the overall progress percentage for the category.
  const categoryProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="mb-6">
      {/* Category Title/Header */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl flex items-center justify-center">
          <span className="text-xl">{category.icon}</span>
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg text-slate-800">{category.name}</h2>
          <p className="text-sm text-slate-600">{category.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {/* Category progress bar */}
            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${categoryProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{Math.round(categoryProgress)}%</span>
          </div>
        </div>
      </div>
      
      {/* List of Collapsible Modules within this category */}
      <div className="space-y-3">
        {categoryModules.map(module => (
          <CollapsibleModule
            key={`${module.category}_${module.name}`}
            module={module}
            topics={topics} // Pass all topics for consistent lookup
            userProgress={userProgress}
            onTopicClick={onTopicClick}
            isExpanded={expandedModules.has(`${module.category}_${module.name}`)}
            onToggle={() => onModuleToggle(`${module.category}_${module.name}`)}
            getTopicProgress={getTopicProgress} // Pass the global getTopicProgress
          />
        ))}
      </div>
    </div>
  );
};


// 简化的模块卡片组件 (New component for the "path" view)
const ModuleCard = ({ module, topics, userProgress, onTopicClick, isExpanded, onToggle, getTopicProgress }) => {
  const moduleTopics = topics.filter(topic => 
    topic.category_name === module.category && 
    topic.module_name === module.name
  ) || [];

  const finalTopics = moduleTopics.length > 0 ? moduleTopics : 
    (module.topics || []).map((topicName) => ({
      id: `default_topic_${module.category}_${module.name}_${topicName.replace(/\s/g, '_')}`,
      name: topicName,
      category_name: module.category,
      module_name: module.name,
      estimated_time: 30,
      emoji: '📚'
    }));

  const completedCount = finalTopics.filter(topic => {
    const progress = getTopicProgress(topic.id, topic.name);
    return progress.knowledge_learned;
  }).length;

  const progressPercentage = finalTopics.length > 0 ? (completedCount / finalTopics.length) * 100 : 0;

  // 找到下一个要学习的主题
  const nextTopic = finalTopics.find(topic => {
    const progress = getTopicProgress(topic.id, topic.name);
    return !progress.knowledge_learned;
  });

  return (
    <Card className={`transition-all duration-200 ${
      progressPercentage === 100 ? 'bg-green-50 border-green-200' :
      progressPercentage > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white'
    }`}>
      <CardContent className="p-4">
        {/* 模块头部信息 */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            progressPercentage === 100 ? 'bg-green-500' :
            progressPercentage > 0 ? 'bg-blue-500' : 'bg-slate-400'
          }`}>
            <span className="text-xl text-white">{module.icon}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800">{module.name}</h3>
              <Badge className={`text-xs ${
                progressPercentage === 100 ? 'bg-green-100 text-green-700' :
                progressPercentage > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {completedCount}/{finalTopics.length}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{module.description}</p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-3">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                progressPercentage === 100 ? 'bg-green-500' :
                progressPercentage > 0 ? 'bg-blue-500' : 'bg-slate-300'
              }`}
              style={{ width: `${Math.max(progressPercentage, 2)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{module.category}</span>
            <span>{Math.round(progressPercentage)}% 完成</span>
          </div>
        </div>

        {/* 下一个学习主题 */}
        {nextTopic ? (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">下一个：{nextTopic.name}</span>
              </div>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 text-xs"
                onClick={() => onTopicClick(nextTopic)}
              >
                开始
              </Button>
            </div>
          </div>
        ) : progressPercentage === 100 ? (
          <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">已完成全部学习</span>
            </div>
          </div>
        ) : null}

        {/* 展开/收起按钮 */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle}
          className="w-full justify-center text-slate-600 hover:bg-slate-100"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              收起主题列表
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 mr-1" />
              查看全部主题 ({finalTopics.length})
            </>
          )}
        </Button>

        {/* 展开的主题列表 - 简化版 */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="grid gap-2">
              {finalTopics.map((topic, index) => {
                const progress = getTopicProgress(topic.id, topic.name);
                const isCompleted = progress.knowledge_learned;
                const isCurrent = topic === nextTopic;
                // A topic is locked if it's not the current one, not completed, AND any previous topics are not completed.
                const isLocked = !isCurrent && !isCompleted && finalTopics.slice(0, index).some(t => {
                  const p = getTopicProgress(t.id, t.name);
                  return !p.knowledge_learned;
                });

                return (
                  <div 
                    key={topic.id || topic.name}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isCompleted ? 'bg-green-50 hover:bg-green-100' :
                      isCurrent ? 'bg-blue-50 hover:bg-blue-100' :
                      isLocked ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                    onClick={() => !isLocked && onTopicClick(topic)}
                  >
                    <div className="flex items-center gap-2">
                      {/* 状态图标 */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500' :
                        isCurrent ? 'bg-blue-500' :
                        isLocked ? 'bg-slate-300' : 'bg-slate-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-3 h-3 text-white" />
                        ) : isCurrent ? (
                          <Play className="w-3 h-3 text-white" />
                        ) : isLocked ? (
                          <Lock className="w-3 h-3 text-slate-500" />
                        ) : (
                          <span className="text-xs text-white">{index + 1}</span>
                        )}
                      </div>
                      
                      <div>
                        <p className={`text-sm font-medium ${
                          isLocked ? 'text-slate-400' : 'text-slate-800'
                        }`}>
                          {topic.name}
                        </p>
                        {progress.training_count > 0 && (
                          <p className="text-xs text-slate-500">
                            训练{progress.training_count}次 
                            {progress.best_score > 0 && ` · 最高${progress.best_score}分`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {isCurrent && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">当前</Badge>
                      )}
                      <span className="text-xs text-slate-500">{topic.estimated_time || 30}min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 简化的分类区域组件 (New component for the "path" view)
const SimpleCategorySection = ({ category, modules, topics, userProgress, onTopicClick, expandedModules, onModuleToggle, getTopicProgress }) => {
  const categoryModules = modules.filter(m => m.category === category.name);
  
  // Calculate category total progress
  const totalTopics = categoryModules.reduce((sum, module) => {
    const moduleTopics = topics.filter(t => 
      t.category_name === module.category && t.module_name === module.name
    );
    return sum + (moduleTopics.length || module.topics?.length || 0);
  }, 0);
  
  const completedTopics = categoryModules.reduce((sum, module) => {
    const moduleTopics = topics.filter(t => 
      t.category_name === module.category && t.module_name === module.name
    ) || (module.topics || []).map(name => ({ name }));
    
    return sum + moduleTopics.filter(topic => {
      const progress = getTopicProgress(topic.id, topic.name); // Use the passed getTopicProgress
      return progress?.knowledge_learned;
    }).length;
  }, 0);

  const categoryProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="mb-6">
      {/* 分类标题 - 简化版 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
          <span className="text-lg">{category.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800">{category.name}</h2>
            <span className="text-sm text-slate-600">{Math.round(categoryProgress)}%</span>
          </div>
          <p className="text-sm text-slate-600">{category.description}</p>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${categoryProgress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 模块网格 */}
      <div className="space-y-3">
        {categoryModules.map(module => (
          <ModuleCard
            key={`${module.category}_${module.name}`}
            module={module}
            topics={topics}
            userProgress={userProgress}
            onTopicClick={onTopicClick}
            isExpanded={expandedModules.has(`${module.category}_${module.name}`)}
            onToggle={() => onModuleToggle(`${module.category}_${module.name}`)}
            getTopicProgress={getTopicProgress} // Pass the global getTopicProgress
          />
        ))}
      </div>
    </div>
  );
};


export default function Learning() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState("path"); // 默认设置为“地图”视图
  const [user, setUser] = useState(null);
  const [aiTrainingTopics, setAiTrainingTopics] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState(new Set()); // State for managing expanded modules in the new path view

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    
    // 监听页面获得焦点时重新加载数据，确保从其他页面返回时数据能刷新
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 添加监听 selectedModule 变化，当返回模块页面时重新加载数据
  useEffect(() => {
    if (selectedModule) {
      loadData();
    }
  }, [selectedModule]);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const [categoriesData, topicsData, progressData, questionsData] = await Promise.all([
        Category.list("order"),
        Topic.list("order"),
        UserProgress.filter({ user_id: currentUser.id }),
        Question.list()
      ]);
      
      setCategories(categoriesData);
      setTopics(topicsData);
      setUserProgress(progressData);

      const aiTopics = new Set(
        questionsData.filter(q => q.type === 'voice').map(q => q.topic_name)
      );
      setAiTrainingTopics(aiTopics);
      
      // 检查URL参数设置默认tab
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const viewParam = urlParams.get('view');
      if (tabParam && tabParam !== 'path') { // 如果有tab参数且不是path，则使用该tab
        setActiveTab(tabParam);
      } else {
        setActiveTab('path'); // 默认或指定时，都使用path
      }
      
      console.log('学习中心数据加载完成:', {
        topics: topicsData.length,
        progress: progressData.length,
        progressDetails: progressData.map(p => ({
          topic_id: p.topic_id,
          knowledge_learned: p.knowledge_learned,
          mastery_level: p.mastery_level
        })),
        aiTopics: aiTopics.size
      });
    } catch (error) {
      console.log("数据加载失败", error);
    }
  };

  const getMasteryColor = (level) => {
    const colors = { 
      '未开始': 'bg-gray-100 text-gray-600', 
      '初学': 'bg-blue-100 text-blue-700', 
      '练习中': 'bg-yellow-100 text-yellow-700', 
      '熟练': 'bg-green-100 text-green-700', 
      '精通': 'bg-purple-100 text-purple-700' 
    };
    return colors[level] || colors['未开始'];
  };

  // 优化后的getTopicProgress函数，使用useMemo提升性能
  const getTopicProgress = useMemo(() => {
    // 创建Map以提高查找效率
    const progressMapByTopicId = new Map(userProgress.map(p => [p.topic_id, p]));
    const topicsByName = new Map(topics.map(t => [t.name, t]));
    const progressTopics = new Map(userProgress.map(p => {
        const topic = topics.find(t => t.id === p.topic_id);
        return topic ? [topic.name, p] : [null, null];
    }).filter(entry => entry[0]));

    return (topicId, topicName) => {
        // 策略1: 通过主题名称在进度主题Map中查找，最高效
        const progressByName = progressTopics.get(topicName);
        if (progressByName) return progressByName;

        // 策略2: 通过真实Topic ID在进度Map中查找
        const dbTopic = topicsByName.get(topicName);
        if (dbTopic) {
            const progress = progressMapByTopicId.get(dbTopic.id);
            if (progress) return progress;
        }

        // 策略3: 直接用传入的ID（可能是mock ID）查找
        const progressByDirectId = progressMapByTopicId.get(topicId);
        if (progressByDirectId) return progressByDirectId;
        
        return {}; // 未找到则返回空对象
    };
  }, [userProgress, topics]);

  // 获取所有模块数据
  const getAllModules = () => {
    return [
      // 情商类目
      { category: '情商', name: '情商识别', description: '识别和理解自己及他人的情绪状态', icon: '🎭', topics: ['情商段位来比拼', '情绪识别训练', '共情能力测试'] },
      { category: '情商', name: '情绪管理', description: '有效管理和调节自己的情绪', icon: '🧘', topics: ['压力管理技巧', '情绪调节策略', '冲突情绪处理'] },
      { category: '情商', name: '社交技能', description: '在人际交往中灵活运用情商', icon: '🤝', topics: ['社交场合应对', '团队情商协作', '领导力情商'] },
      
      // 求职招聘类目
      { category: '求职招聘', name: '求职应聘', description: '掌握求职面试的核心技巧和策略', icon: '💼', topics: ['晋升汇报', '面试技巧实战', '简历优化策略', '薪资谈判技巧', '职业规划面谈'] },
      { category: '求职招聘', name: '招聘选人', description: '学会识别和选择合适的人才', icon: '🔍', topics: ['候选人评估', '面试官技能', '人才画像分析', '背景调查方法'] },
      
      // 思维类目
      { category: '思维', name: '结构化思维', description: '系统性分析和解决复杂问题', icon: '🧩', topics: ['问题分析框架', 'MECE原则应用', '逻辑思维训练', '决策树分析'] },
      { category: '思维', name: '系统思维', description: '从全局角度思考和处理问题', icon: '🔄', topics: ['系统性思考', '全局视角培养', '因果关系分析', '复杂系统理解'] },
      { category: '思维', name: '创新思维', description: '突破常规的创造性思考方式', icon: '💡', topics: ['创意思维训练', '头脑风暴技巧', '设计思维应用', '创新方法论'] },
      
      // 沟通类目 - 修正协作沟通模块
      { category: '沟通', name: '协作沟通', description: '在团队协作中进行有效沟通', icon: '👥', topics: ['团队协作技巧', '跨部门沟通', '会议沟通艺术', '项目沟通管理'] },
      { category: '沟通', name: '客户沟通', description: '与客户建立良好的沟通关系', icon: '🎯', topics: ['客户需求洞察', '商务沟通礼仪', '客户关系维护', '投诉处理技巧'] },
      { category: '沟通', name: '向上管理', description: '与上级进行有效沟通的艺术', icon: '⬆️', topics: ['向上管理试炼场', '汇报技巧精进', '上级关系处理', '职场政治智慧'] }
    ];
  };

  // 获取学习路径数据 - 定义完整的学习路径结构 (Not directly used by the new path view, but good for reference if a linear path ever needed to be generated)
  const getPathStructure = () => {
    return [
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
  };

  // 获取模块的学习状态统计
  const getModuleStats = (module) => {
    let moduleTopics = topics.filter(topic => 
      topic.category_name === module.category && 
      topic.module_name === module.name
    );

    // If no topics are found in the database, use mock topics (from module.topics property)
    if (moduleTopics.length === 0 && module.topics) {
      moduleTopics = module.topics.map((topicName) => ({
        id: `default_topic_${module.category}_${module.name}_${topicName.replace(/\s/g, '_')}`, 
        name: topicName,
        category_name: module.category,
        module_name: module.name
      }));
    }

    const totalTopics = moduleTopics.length;
    
    // Corrected: use the centralized getTopicProgress for accuracy
    const learnedTopics = moduleTopics.filter(topic => {
      const progress = getTopicProgress(topic.id, topic.name);
      return progress && progress.knowledge_learned === true;
    }).length;
    
    const masteredTopics = moduleTopics.filter(topic => {
      const progress = getTopicProgress(topic.id, topic.name);
      return progress && progress.mastery_level === '精通';
    }).length;

    const learningProgress = totalTopics > 0 ? Math.round((learnedTopics / totalTopics) * 100) : 0;

    return { totalTopics, learnedTopics, masteredTopics, learningProgress };
  };

  // Handle node click (for PathNode or CollapsibleModule topic click)
  const handleTopicClick = (topic) => {
    navigate(createPageUrl(`TopicDetail?id=${topic.id || topic.name}`));
  };

  // Create default topic content - adding detailed definition for '团队协作技巧'
  const createDefaultTopic = (topicName, category, module) => {
    // Special handling for specific important topics
    const specialTopics = {
      '团队协作技巧': {
        id: `default_topic_${category}_${module}_团队协作技巧`,
        name: '团队协作技巧',
        description: '掌握高效团队协作的核心技能和沟通策略',
        category_name: category,
        module_name: module,
        estimated_time: 45,
        difficulty: '中级',
        emoji: '🤝',
        goal: '学会在团队中有效协作，提升团队工作效率',
        scenarios: [
          '跨部门项目协作中的沟通协调',
          '团队冲突处理和共识达成',
          '远程团队协作的最佳实践'
        ],
        knowledge_points: [
          {
            name: '团队协作基础',
            content: '团队协作的核心要素：\n\n1. 明确的目标和角色分工\n2. 开放透明的沟通机制\n3. 相互信任和支持的氛围\n4. 有效的决策流程\n5. 持续的反馈和改进\n\n成功的团队协作需要每个成员都具备协作意识和技能。',
            type: 'text'
          },
          {
            name: '沟通协调技巧',
            content: '团队沟通的最佳实践：\n\n• 主动沟通：定期同步进展和问题\n• 倾听理解：认真听取他人观点\n• 清晰表达：准确传达自己的想法\n• 建设性反馈：提供有价值的建议\n• 冲突解决：理性处理意见分歧\n\n记住：良好的沟通是团队协作的基石。',
            type: 'video'
          },
          {
            name: '协作工具运用',
            content: '现代团队协作工具的使用：\n\n1. 项目管理工具：Trello、Asana、Jira\n2. 沟通平台：钉钉、企业微信、Slack\n3. 文档协作：腾讯文档、石墨文档\n4. 视频会议：腾讯会议、Zoom\n5. 文件共享：网盘、Git等\n\n选择合适的工具，建立规范的使用流程。',
            type: 'text'
          }
        ]
      }
    };

    if (specialTopics[topicName]) {
      return specialTopics[topicName];
    }

    // Default topic creation logic
    return {
      id: `default_topic_${category}_${module}_${topicName.replace(/\s/g, '_')}`,
      name: topicName,
      description: `${topicName}的详细学习内容`,
      category_name: category,
      module_name: module,
      estimated_time: 30,
      difficulty: '初级',
      emoji: '📚',
      goal: `掌握${topicName}的核心概念和实用技巧`,
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

  // Performance optimization using useMemo for derived data
  const { allModules, pathStructure, totalStats } = useMemo(() => {
    const modules = getAllModules();
    const structure = getPathStructure();

    const stats = modules.reduce((acc, module) => {
      const moduleStats = getModuleStats(module);
      return {
        totalTopics: acc.totalTopics + moduleStats.totalTopics,
        learnedTopics: acc.learnedTopics + moduleStats.learnedTopics,
        masteredTopics: acc.masteredTopics + moduleStats.masteredTopics
      };
    }, { totalTopics: 0, learnedTopics: 0, masteredTopics: 0 });
    
    return { allModules: modules, pathStructure: structure, totalStats: stats };
  }, [topics, userProgress]); // Recalculate if topics or userProgress change

  // Find recommended module (one with unlearned topics)
  const recommendedModule = allModules.find(module => {
    const stats = getModuleStats(module);
    return stats.totalTopics > stats.learnedTopics;
  });

  // Handle module expansion/collapse in the new path view
  const handleModuleToggle = (moduleKey) => {
    setExpandedModules(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(moduleKey)) {
        newExpanded.delete(moduleKey);
      } else {
        newExpanded.add(moduleKey);
      }
      return newExpanded;
    });
  };

  // Predefined category data for the new path view tabs
  const categoryData = [
    { name: '情商', icon: '🧠', description: '情绪管理与人际沟通' },
    { name: '求职招聘', icon: '💼', description: '面试技巧与人才选拔' },
    { name: '思维', icon: '🧩', description: '逻辑思维与问题解决' },
    { name: '沟通', icon: '💬', description: '团队协作与客户服务' }
  ];

  // If a module is selected, render its detail page
  if (selectedModule) {
    let moduleTopics = topics.filter(topic => 
      topic.category_name === selectedModule.category && 
      topic.module_name === selectedModule.name
    );

    // If no topics are found in the database, create default topics for the selected module
    if (moduleTopics.length === 0 && selectedModule.topics) {
      moduleTopics = selectedModule.topics.map((topicName) => 
        createDefaultTopic(topicName, selectedModule.category, selectedModule.name)
      );
    }

    const moduleStats = getModuleStats(selectedModule);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-8 pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedModule(null)} className="text-white hover:bg-white/20">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 text-white text-xs">{selectedModule.category}</Badge>
                </div>
                <h1 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">{selectedModule.icon}</span>
                  {selectedModule.name}
                </h1>
                <p className="text-blue-100 text-sm">{selectedModule.description}</p>
              </div>
            </div>

            {/* Module Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold">{moduleStats.totalTopics}</div>
                <div className="text-blue-200 text-xs">个主题</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold">{moduleStats.learnedTopics}</div>
                <div className="text-blue-200 text-xs">已学习</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-white font-bold">{moduleStats.masteredTopics}</div>
                <div className="text-blue-200 text-xs">已精通</div>
              </div>
            </div>

            {/* Learning Progress Bar */}
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between text-xs text-blue-100 mb-2">
                <span>学习进度</span>
                <span>{moduleStats.learningProgress}%</span>
              </div>
              <Progress value={moduleStats.learningProgress} className="h-2 bg-white/20" />
            </div>
          </div>
        </div>
        
        <div className="px-4 -mt-2 max-w-md mx-auto pb-8">
          <div className="space-y-3">
            {moduleTopics.length > 0 ? (
              moduleTopics.map((topic) => {
                const progress = getTopicProgress(topic.id, topic.name);
                const isAdvanced = topic.difficulty === '高级';
                const needsVip = isAdvanced && (!user?.vip_level || user.vip_level === '普通');
                const isAiTopic = aiTrainingTopics.has(topic.name);

                if (needsVip) {
                  return (
                    <Card key={topic.id} className="bg-white shadow-sm opacity-75 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-500 text-white px-2 py-1 text-xs rounded-bl-lg">
                        VIP专享
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-500 mb-1 flex items-center gap-2 text-sm">
                              {topic.name}
                              <Gem className="w-4 h-4 mr-1 text-yellow-500" />
                            </h3>
                            <p className="text-sm text-slate-500 mb-2">{topic.description}</p>
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              高级课程
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          onClick={() => navigate(createPageUrl('Membership'))} 
                          className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
                        >
                          <Gem className="w-4 h-4 mr-2" />
                          升级解锁
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={topic.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAiTopic ? 'bg-gradient-to-br from-blue-100 to-purple-200' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
                          <span className="text-lg">{isAiTopic ? '🤖' : topic.emoji || '📖'}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">{topic.name}
                              {isAiTopic && <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs"><Zap className="w-3 h-3 mr-1"/>AI实战</Badge>}
                            </h3>
                            <Badge className={`text-xs ${getMasteryColor(progress.mastery_level || '未开始')}`}>
                              {progress.mastery_level || '未开始'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{topic.description}</p>
                          
                          {/* Learning Status Indicators */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {topic.estimated_time || 30}分钟
                            </div>
                            {progress.knowledge_learned && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                已学习
                              </div>
                            )}
                            {progress.training_count > 0 && (
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                训练{progress.training_count}次
                              </div>
                            )}
                            {progress.best_score > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                最高{progress.best_score}分
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Link to={createPageUrl(`TopicDetail?id=${topic.name}`)} className="flex-1">
                              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                                <BookOpen className="w-4 h-4 mr-1" />
                                {progress.knowledge_learned ? '复习' : '学习'}
                              </Button>
                            </Link>
                            {progress.knowledge_learned && (
                              <Link to={createPageUrl(`Training?topic=${topic.name}`)}>
                                <Button variant="outline" size="sm" className={isAiTopic ? 'text-purple-600 border-purple-300' : 'text-orange-600 border-orange-300'}>
                                  {isAiTopic ? <BrainCircuit className="w-4 h-4 mr-1"/> : <Play className="w-4 h-4 mr-1" />}
                                  {isAiTopic ? 'AI训练' : '训练'}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">该模块下暂无主题</h3>
                      <p className="text-sm text-slate-500">我们正在努力为您准备更多精彩内容</p>
                    </div>
                    <Button onClick={() => setSelectedModule(null)} variant="outline">
                      返回选择其他模块
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Learning page content
  const filteredModules = activeTab === "all" || activeTab === "path" ? allModules : 
                         allModules.filter(m => m.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-8 pb-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-1">
             <h1 className="text-white text-xl font-bold">学习中心</h1>
          </div>
          <p className="text-blue-100 text-sm">选择感兴趣的技能开始学习</p>
          
          {/* Learning Overview Stats - Compact Version */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-white font-bold text-base">{totalStats.totalTopics}</div>
              <div className="text-blue-200 text-xs">总主题</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-white font-bold text-base">{totalStats.learnedTopics}</div>
              <div className="text-blue-200 text-xs">已学习</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-white font-bold text-base">{totalStats.masteredTopics}</div>
              <div className="text-blue-200 text-xs">已精通</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 -mt-1 max-w-md mx-auto pb-8">
        {/* Recommended Learning Card - Compact Version */}
        {recommendedModule && totalStats.learnedTopics < totalStats.totalTopics && (
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white mb-3 shadow-md">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{recommendedModule.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-100">💡 推荐学习</span>
                  </div>
                  <h3 className="font-bold text-sm truncate">{recommendedModule.name}</h3>
                </div>
                <Button 
                  size="sm" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 h-auto text-xs flex-shrink-0"
                  onClick={() => setSelectedModule(recommendedModule)}
                >
                  开始
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Switching Tabs and Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-sm h-8 mb-3">
            <TabsTrigger value="path" className="text-xs px-1 flex items-center gap-1"><MapIcon className="w-3 h-3"/>学习地图</TabsTrigger>
            <TabsTrigger value="情商" className="text-xs px-1 flex items-center gap-1"><span className="text-xs">🧠</span>情商</TabsTrigger>
            <TabsTrigger value="求职招聘" className="text-xs px-1 flex items-center gap-1"><span className="text-xs">💼</span>求职</TabsTrigger>
            <TabsTrigger value="思维" className="text-xs px-1 flex items-center gap-1"><span className="text-xs">🧩</span>思维</TabsTrigger>
            <TabsTrigger value="沟通" className="text-xs px-1 flex items-center gap-1"><span className="text-xs">💬</span>沟通</TabsTrigger>
          </TabsList>
          
          <TabsContent value="path" className="mt-0">
            {/* 极简网格式学习地图 */}
            <div className="space-y-4">
              {categoryData.map(category => (
                <SimpleCategorySection
                  key={category.name}
                  category={category}
                  modules={allModules}
                  topics={topics}
                  userProgress={userProgress}
                  onTopicClick={handleTopicClick}
                  expandedModules={expandedModules}
                  onModuleToggle={handleModuleToggle}
                  getTopicProgress={getTopicProgress}
                />
              ))}
              
              {/* 完成成就卡片 */}
              {totalStats.learnedTopics === totalStats.totalTopics && totalStats.totalTopics > 0 && (
                <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-bold mb-1">🎉 恭喜完成全部学习！</h3>
                    <p className="text-yellow-100 text-sm">你已经成为真正的职场达人！</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 分类特定视图 (原有渲染逻辑) */}
          {['情商', '求职招聘', '思维', '沟通'].map(categoryName => (
            <TabsContent key={categoryName} value={categoryName} className="mt-0">
              <div className="space-y-2.5">
                {filteredModules.filter(m => m.category === categoryName).map((module) => {
                  const moduleStats = getModuleStats(module);
                  const isCompleted = moduleStats.learningProgress === 100;
                  const hasStarted = moduleStats.learningProgress > 0;
                  const hasAiTraining = module.topics.some(topicName => aiTrainingTopics.has(topicName));
                  
                  return (
                    <Card 
                      key={`${module.category}_${module.name}`} 
                      className={`bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
                        isCompleted ? 'ring-1 ring-green-200 bg-green-50' : 
                        hasStarted ? 'ring-1 ring-blue-200 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedModule(module)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center relative flex-shrink-0 ${
                            hasAiTraining ? 'from-blue-100 to-purple-200' :
                            isCompleted ? 'from-green-100 to-green-200' :
                            hasStarted ? 'from-blue-100 to-indigo-200' :
                            'from-indigo-100 to-purple-100'
                          }`}>
                            <span className="text-lg">{module.icon}</span>
                            {isCompleted && (
                              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-slate-800 text-sm truncate">{module.name}</h3>
                              {hasAiTraining && (
                                <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs px-1.5 py-0.5"><Zap className="w-3 h-3 mr-1"/>AI训练</Badge>
                              )}
                              {isCompleted && (
                                <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5">完成</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-1">{module.description}</p>
                            
                            {/* Detailed Learning Progress - Compact Version */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-slate-500">
                                  <span>{moduleStats.totalTopics}主题</span>
                                  {moduleStats.learnedTopics > 0 && (
                                    <span className="text-green-600 font-medium">
                                      {moduleStats.learnedTopics}已学
                                    </span>
                                  )}
                                  {moduleStats.masteredTopics > 0 && (
                                    <span className="text-purple-600 font-medium">
                                      {moduleStats.masteredTopics}精通
                                    </span>
                                  )}
                                </div>
                                {moduleStats.learningProgress > 0 && (
                                  <span className="text-blue-600 font-bold text-xs">{moduleStats.learningProgress}%</span>
                                )}
                              </div>
                              
                              {/* Progress bar - Thinner */}
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    hasStarted ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                    'bg-gradient-to-r from-slate-300 to-slate-400'
                                  }`}
                                  style={{ width: `${Math.max(moduleStats.learningProgress, 2)}%` }}
                                />
                              </div>
                              
                              {/* Learning Status Hint - Compact Version */}
                              <div className="text-xs">
                                {isCompleted ? (
                                  <span className="text-green-600 font-medium">🎉 已完成全部学习</span>
                                ) : hasStarted ? (
                                  <span className="text-blue-600 font-medium">📚 学习进行中</span>
                                ) : (
                                  <span className="text-slate-500">📖 点击开始学习</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Learning Completion Prompt - Compact Version */}
        {totalStats.learnedTopics === totalStats.totalTopics && totalStats.totalTopics > 0 && (
          <Card className="bg-gradient-to-r from-green-600 to-emerald-700 text-white mt-4">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base mb-1">🎉 学习达人！</h3>
              <p className="text-green-100 text-sm mb-3">已完成所有主题学习</p>
              <Button 
                size="sm"
                className="bg-white text-green-600 hover:bg-green-50"
                onClick={() => navigate(createPageUrl('TrainingHub'))}
              >
                <Zap className="w-4 h-4 mr-1" />
                去训练中心
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
