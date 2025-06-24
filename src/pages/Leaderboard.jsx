
import React, { useState, useEffect } from 'react';
import { User, UserProgress } from '@/api/entities';
import { Award, Trophy, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

        // Sort by totalScore for default view
        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Failed to load leaderboard data:", error);
      }
      setIsLoading(false);
    };

    fetchLeaderboardData();
  }, []);

  const renderRank = (index) => {
    if (index === 0) return <Trophy className="text-yellow-400 w-6 h-6" />;
    if (index === 1) return <Trophy className="text-gray-400 w-6 h-6" />;
    if (index === 2) return <Trophy className="text-amber-600 w-6 h-6" />;
    return <span className="font-bold text-slate-500 w-6 text-center">{index + 1}</span>;
  };
  
  const LeaderboardList = ({ data, sortKey }) => {
    const sortedData = [...data].sort((a, b) => b[sortKey] - a[sortKey]);
    
    return (
      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="w-6 h-6" />
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-12" />
            </Card>
          ))
        ) : (
          sortedData.map((user, index) => (
            <Card key={user.id} className={`p-4 flex items-center gap-4 transition-all ${currentUser?.id === user.id ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
              <div className="flex-shrink-0">{renderRank(index)}</div>
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{user[sortKey]}</p>
                <p className="text-xs text-slate-500">
                  {sortKey === 'totalScore' ? '总分' : sortKey === 'totalTrainings' ? '训练次数' : '精通主题'}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-12 pb-20 px-6 text-white">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">英雄榜</h1>
          <p className="text-blue-200">看看谁是职场技能达人</p>
        </div>
      </div>
      <div className="px-6 -mt-16 max-w-md mx-auto">
        <Tabs defaultValue="totalScore">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="totalScore">总分榜</TabsTrigger>
            <TabsTrigger value="totalTrainings">训练榜</TabsTrigger>
            <TabsTrigger value="masteredTopics">精通榜</TabsTrigger>
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
