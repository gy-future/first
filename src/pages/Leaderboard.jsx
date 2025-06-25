
import React, { useState, useEffect } from 'react';
import { User, UserProgress } from '@/api/entities';
import { Award, Trophy, Star, Medal, Crown, Zap, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRanking, setCurrentUserRanking] = useState({});

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      try {
        const users = await User.list();
        const allProgress = await UserProgress.list();
        const me = await User.me();
        setCurrentUser(me);

        const leaderboardData = users.map(user => {
          const userProgresses = allProgress.filter(p => p.created_by === user.email);
          const totalScore = userProgresses.reduce((sum, p) => sum + (p.best_score || 0), 0);
          const totalTrainings = userProgresses.reduce((sum, p) => sum + (p.training_count || 0), 0);
          const masteredTopics = userProgresses.filter(p => p.mastery_level === '精通').length;
          
          return {
            id: user.id,
            name: user.full_name,
            email: user.email,
            avatar: user.avatar,
            totalScore,
            totalTrainings,
            masteredTopics,
          };
        });

        // 为每个排行榜类型计算排名
        const rankings = {
          totalScore: [...leaderboardData].sort((a, b) => b.totalScore - a.totalScore),
          totalTrainings: [...leaderboardData].sort((a, b) => b.totalTrainings - a.totalTrainings),
          masteredTopics: [...leaderboardData].sort((a, b) => b.masteredTopics - a.masteredTopics)
        };

        // 计算当前用户在各个排行榜中的排名
        const userRankings = {};
        Object.keys(rankings).forEach(key => {
          const rank = rankings[key].findIndex(user => user.id === me.id) + 1;
          userRankings[key] = rank || rankings[key].length + 1;
        });

        setLeaderboard(leaderboardData);
        setCurrentUserRanking(userRankings);
      } catch (error) {
        console.error("Failed to load leaderboard data:", error);
      }
      setIsLoading(false);
    };

    fetchLeaderboardData();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="text-yellow-500 w-5 h-5" />;
    if (index === 1) return <Trophy className="text-gray-400 w-5 h-5" />;
    if (index === 2) return <Medal className="text-amber-600 w-5 h-5" />;
    return <span className="font-bold text-slate-500 w-5 text-center text-sm">{index + 1}</span>;
  };

  const getRankBadge = (index) => {
    if (index === 0) return "👑";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    if (index < 10) return "🔥";
    return "";
  };
  
  const LeaderboardList = ({ data, sortKey, displayLimit = 50 }) => {
    const sortedData = [...data].sort((a, b) => b[sortKey] - a[sortKey]);
    const displayData = sortedData.slice(0, displayLimit);
    const currentUserIndex = sortedData.findIndex(user => user.id === currentUser?.id);
    const currentUserData = currentUserIndex !== -1 ? sortedData[currentUserIndex] : null;
    
    // 如果当前用户不在前50名但存在于排行榜中，单独显示
    const showCurrentUserSeparately = currentUserIndex >= displayLimit && currentUserData;
    
    return (
      <div className="space-y-2">
        {/* 顶部统计信息 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-700 truncate">
                {sortedData.length > 99 ? '99+' : sortedData.length} 位职场达人正在比拼！
              </span>
            </div>
            {currentUser && currentUserRanking[sortKey] && (
              <Badge className="bg-blue-100 text-blue-700 font-bold ml-2 flex-shrink-0">
                我的排名：第{currentUserRanking[sortKey]}位
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-32" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </Card>
          ))
        ) : (
          <>
            {displayData.map((user, index) => {
              const isCurrentUser = currentUser?.id === user.id;
              const rankBadge = getRankBadge(index);
              
              return (
                <Card 
                  key={user.id} 
                  className={`p-3 transition-all duration-200 ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ring-1 ring-blue-200 shadow-md' 
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 排名图标 */}
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>
                    
                    {/* 用户头像 */}
                    <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-700 font-bold">
                        {user.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* 用户信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm truncate ${
                          isCurrentUser ? 'text-blue-800' : 'text-slate-800'
                        }`}>
                          {user.name}
                          {isCurrentUser && <span className="text-blue-600 ml-1">(我)</span>}
                        </p>
                        {rankBadge && <span className="text-xs">{rankBadge}</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    
                    {/* 分数显示 */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-base ${
                        isCurrentUser ? 'text-blue-700' : 'text-orange-600'
                      }`}>
                        {user[sortKey]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sortKey === 'totalScore' ? '总分' : 
                         sortKey === 'totalTrainings' ? '训练' : '精通'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* 如果当前用户不在前50名，单独显示 */}
            {showCurrentUserSeparately && (
              <>
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="h-px bg-slate-300 w-8"></div>
                    <span className="text-xs">...</span>
                    <div className="h-px bg-slate-300 w-8"></div>
                  </div>
                </div>
                
                <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ring-1 ring-blue-200 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      <span className="font-bold text-blue-600 text-sm">#{currentUserIndex + 1}</span>
                    </div>
                    
                    <Avatar className="w-10 h-10 ring-2 ring-blue-200 shadow-sm">
                      <AvatarImage src={currentUserData.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-700 font-bold">
                        {currentUserData.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-blue-800 truncate">
                          {currentUserData.name} (我)
                        </p>
                      </div>
                      <p className="text-xs text-blue-600 truncate">{currentUserData.email}</p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-base text-blue-700">
                        {currentUserData[sortKey]}
                      </p>
                      <p className="text-xs text-blue-600">
                        {sortKey === 'totalScore' ? '总分' : 
                         sortKey === 'totalTrainings' ? '训练' : '精通'}
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 头部区域 - 更紧凑 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-8 pb-16 px-4 text-white">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              英雄榜
            </h1>
            <p className="text-blue-200 text-sm">看看谁是职场技能达人</p>
          </div>
        </div>
      </div>
      
      {/* 主内容区域 */}
      <div className="px-4 -mt-12 max-w-md mx-auto pb-8">
        <Tabs defaultValue="totalScore">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="totalScore" className="text-xs font-medium">
              <Award className="w-3 h-3 mr-1" />
              总分榜
            </TabsTrigger>
            <TabsTrigger value="totalTrainings" className="text-xs font-medium">
              <Zap className="w-3 h-3 mr-1" />
              训练榜
            </TabsTrigger>
            <TabsTrigger value="masteredTopics" className="text-xs font-medium">
              <Star className="w-3 h-3 mr-1" />
              精通榜
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="totalScore" className="mt-4">
            <LeaderboardList data={leaderboard} sortKey="totalScore" />
          </TabsContent>
          <TabsContent value="totalTrainings" className="mt-4">
            <LeaderboardList data={leaderboard} sortKey="totalTrainings" />
          </TabsContent>
          <TabsContent value="masteredTopics" className="mt-4">
            <LeaderboardList data={leaderboard} sortKey="masteredTopics" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
