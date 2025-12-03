import React, { use, useEffect, useState } from 'react';
import { 
  Trophy, Target, Zap, Star, Award, CheckCircle2, Clock, 
  TrendingUp, Flame, Heart, Rocket, Lightbulb, ThumbsUp,
  Gift, Crown, Medal, Sparkles, ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '@/App';
import axios from 'axios';
import { toast } from 'sonner';

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  type: 'daily' | 'weekly' | 'achievement';
  icon: React.ReactNode;
  xp: number;
  completed: boolean;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  requirement?: string;
}

interface ChallengeQuestsProps {
  currentUser: User | null;
  onBack: () => void;
}
interface userProgressProps {
    commentsToday:number,
    upvotesToday:number
}
 const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
export function ChallengeQuests() {
  const [activeTab, setActiveTab] = useState('quests');
  const [userProgress,setProgress]=useState<userProgressProps>()
  const  [dailyQuest,setdailyQuest]=useState<Quest[]>([])
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.get(`${url}/api/quest`, {  // Added /api here
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
        const questData = response.data[0];
        console.log("updatedProgress",questData)
      setProgress(response.data);
      if (!questData) {
    console.error("No quest data found");
    return;
  }
      setdailyQuest([
    {
      id: 'q1',
      title: 'Share the Love',
      description: 'Give emoji reactions to 3 products',
      progress: questData.commentsToday || 0 ,
      target: 3,
      reward: '30 XP',
      type: 'daily',
      icon: <Heart className="w-5 h-5" />,
      xp: 30,
      completed: (questData.commentsToday || 0) >= 3
    },
    {
      id: 'q2',
      title: 'Upvote Champion',
      description: 'Upvote 10 products',
      progress: questData?.upvotesToday || 0 ,
      target: 3,
      reward: '100 XP + Badge',
      type: 'daily',
      icon: <TrendingUp className="w-5 h-5" />,
      xp: 100,
      completed: (questData?.upvotesToday || 0) >= 3 
    },
    
  ]

)
 if(dailyQuests.some(quest => quest.completed)){
  toast.success("Daily quest completed! Rewards claimed.");
}
    })
    .catch(error => {
      console.error('Error fetching quest progress:', error);
    });
  }
}, []);
  // Mock quests data
  const dailyQuests: Quest[] = [
   
    {
      id: 'q1',
      title: 'Share the Love',
      description: 'Give emoji reactions to 3 products',
      progress: userProgress?.commentsToday || 0,
      target: 3,
      reward: '30 XP',
      type: 'daily',
      icon: <Heart className="w-5 h-5" />,
      xp: 30,
      completed: false
    },
    {
      id: 'q2',
      title: 'Upvote Champion',
      description: 'Upvote 10 products',
      progress: userProgress?.upvotesToday || 0,
      target: 3,
      reward: '100 XP + Badge',
      type: 'daily',
      icon: <TrendingUp className="w-5 h-5" />,
      xp: 100,
      completed: true
    },
    
  ];

  const weeklyQuests: Quest[] = [
    {
      id: 'w1',
      title: 'Trending Hunter',
      description: 'Discover 20 trending products this week',
      progress: 12,
      target: 20,
      reward: '500 XP + Rare Badge',
      type: 'weekly',
      icon: <Flame className="w-5 h-5" />,
      xp: 500,
      completed: false
    },
    {
      id: 'w2',
      title: 'Engagement Master',
      description: 'Get 50 total interactions on your activities',
      progress: 28,
      target: 50,
      reward: '300 XP',
      type: 'weekly',
      icon: <Zap className="w-5 h-5" />,
      xp: 300,
      completed: false
    },
    {
      id: 'w3',
      title: 'Launch a Product',
      description: 'Submit your own product this week',
      progress: 0,
      target: 1,
      reward: '1000 XP + Epic Badge',
      type: 'weekly',
      icon: <Rocket className="w-5 h-5" />,
      xp: 1000,
      completed: false
    }
  ];

  const badges: BadgeItem[] = [
    {
      id: 'b1',
      name: 'Early Adopter',
      description: 'Joined PeerRank in its first month',
      icon: <Star className="w-6 h-6" />,
      rarity: 'legendary',
      earned: true,
      earnedDate: '2 weeks ago'
    },
    {
      id: 'b2',
      name: 'Upvote Legend',
      description: 'Cast 100 upvotes',
      icon: <TrendingUp className="w-6 h-6" />,
      rarity: 'epic',
      earned: true,
      earnedDate: '5 days ago'
    },
    {
      id: 'b3',
      name: 'Reaction King',
      description: 'Give 500 emoji reactions',
      icon: <Heart className="w-6 h-6" />,
      rarity: 'rare',
      earned: false,
      progress: 245,
      requirement: '500 reactions'
    },
    {
      id: 'b4',
      name: 'Product Hunter',
      description: 'Launch 5 products',
      icon: <Rocket className="w-6 h-6" />,
      rarity: 'epic',
      earned: false,
      progress: 2,
      requirement: '5 products'
    },
    {
      id: 'b5',
      name: 'Trendsetter',
      description: 'Have a product reach trending status',
      icon: <Flame className="w-6 h-6" />,
      rarity: 'legendary',
      earned: false,
      requirement: '1 trending product'
    },
    {
      id: 'b6',
      name: 'Community Hero',
      description: 'Write 50 helpful reviews',
      icon: <Award className="w-6 h-6" />,
      rarity: 'rare',
      earned: false,
      progress: 12,
      requirement: '50 reviews'
    },
    {
      id: 'b7',
      name: 'Innovation Champion',
      description: 'Get 1000 upvotes across all products',
      icon: <Crown className="w-6 h-6" />,
      rarity: 'legendary',
      earned: false,
      progress: 324,
      requirement: '1000 upvotes'
    },
    {
      id: 'b8',
      name: 'Daily Warrior',
      description: 'Complete daily quests for 7 days straight',
      icon: <Medal className="w-6 h-6" />,
      rarity: 'epic',
      earned: false,
      progress: 3,
      requirement: '7 day streak'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300';
      case 'epic':
        return 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300';
      case 'rare':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300';
    }
  };

  const totalXP = 2450;
  const level = Math.floor(totalXP / 500) + 1;
  const xpForNextLevel = (level * 500) - totalXP;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            // onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discovery
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
                Challenge Quests
              </h1>
              <p className="text-lg text-gray-600">
                Complete quests, earn badges, and level up your PeerRank journey
              </p>
            </div>
            
            {/* User Level Card */}
            <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-0 shadow-xl w-full md:w-auto">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 mb-1">Your Level</p>
                    <p className="text-3xl font-bold">Level {level}</p>
                    <p className="text-xs text-white/70 mt-1">{xpForNextLevel} XP to Level {level + 1}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(totalXP % 500) / 500 * 100} 
                    className="h-2 bg-white/20"
                  />
                  <p className="text-xs text-white/70 mt-2">{totalXP % 500} / 500 XP</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Overview */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Quests Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-600 text-white">Rare</Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-600">Badges Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-600 text-white">Hot</Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-600 text-white">Total</Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalXP}</p>
              <p className="text-sm text-gray-600">Total XP</p>
            </CardContent>
          </Card>
        </div> */}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-gray-200">
            <TabsTrigger value="quests" className="rounded-xl">
              <Target className="w-4 h-4 mr-2" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="badges" className="rounded-xl">
              <Award className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
          </TabsList>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-8">
            {/* Daily Quests */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-2xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Daily Quests</h2>
                    <p className="text-sm text-gray-600">Resets in 8 hours</p>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white px-4 py-2">
                  1/4 Complete
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dailyQuest.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            </div>

            {/* Weekly Quests */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-2xl">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Weekly Quests</h2>
                    <p className="text-sm text-gray-600">Resets in 4 days</p>
                  </div>
                </div>
                <Badge className="bg-purple-600 text-white px-4 py-2">
                  0/3 Complete
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklyQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-3 rounded-2xl">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Badge Collection</h2>
                  <p className="text-sm text-gray-600">
                    {badges.filter(b => b.earned).length} of {badges.length} badges earned
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {badges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`${
                    badge.earned 
                      ? getRarityBg(badge.rarity) 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  } border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    badge.earned ? 'hover:scale-105' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`bg-gradient-to-br ${getRarityColor(
                          badge.rarity
                        )} p-4 rounded-2xl mb-4 ${
                          !badge.earned && 'grayscale'
                        }`}
                      >
                        {badge.icon}
                      </div>
                      <Badge
                        className={`mb-3 ${
                          badge.rarity === 'legendary'
                            ? 'bg-yellow-500'
                            : badge.rarity === 'epic'
                            ? 'bg-purple-500'
                            : badge.rarity === 'rare'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                        } text-white`}
                      >
                        {badge.rarity.toUpperCase()}
                      </Badge>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">
                        {badge.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {badge.description}
                      </p>
                      {badge.earned ? (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Earned {badge.earnedDate}
                        </div>
                      ) : (
                        <div className="w-full">
                          {badge.progress !== undefined && (
                            <>
                              <Progress
                                value={(badge.progress / parseInt(badge.requirement || '100')) * 100}
                                className="h-2 mb-2"
                              />
                              <p className="text-xs text-gray-500">
                                {badge.progress} / {badge.requirement}
                              </p>
                            </>
                          )}
                          {!badge.progress && (
                            <p className="text-xs text-gray-500">
                              {badge.requirement}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface QuestCardProps {
  quest: Quest;
}

function QuestCard({ quest }: QuestCardProps) {
  const progressPercent = (quest.progress / quest.target) * 100;

  return (
    <Card
      className={`${
        quest.completed
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
          : 'bg-white/80 backdrop-blur-sm border-slate-200'
      } shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div
            className={`${
              quest.completed ? 'bg-green-100' : 'bg-blue-100'
            } p-3 rounded-xl`}
          >
            {quest.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              quest.icon
            )}
          </div>
          <Badge
            className={`${
              quest.completed ? 'bg-green-600' : 'bg-orange-600'
            } text-white`}
          >
            {quest.reward}
          </Badge>
        </div>
        <CardTitle className="text-lg">{quest.title}</CardTitle>
        <CardDescription>{quest.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">
              {quest.progress} / {quest.target}
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {quest.completed ? (
            <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              disabled={progressPercent < 100}
            >
              {progressPercent >= 100 ? 'Claim Reward' : 'In Progress'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
