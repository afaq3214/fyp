import React, { use, useContext, useEffect, useState } from 'react';
import { 
  Trophy, Target, Zap, Star, Award, CheckCircle2, Clock, 
  TrendingUp, Flame, Heart, Rocket, Lightbulb, ThumbsUp,
  Gift, Crown, Medal, Sparkles, ArrowLeft, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';
import { UserContext } from '@/context/UserContext';

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


interface UserProgressProps {
  dailyQuests: {
    upvotesToday: number;
    commentsToday: number;
    upvotesRemaining: number;
    commentsRemaining: number;
    completed: boolean;
    reward: number;
  };
  userStats: {
    points: number;
    badges: any[];
  };
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
 const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
export function ChallengeQuests() {
  const {user}=useContext(UserContext)
  const [activeTab, setActiveTab] = useState('quests');
  const [userProgress,setProgress]=useState<UserProgressProps>()
  const  [dailyQuest,setdailyQuest]=useState<Quest[]>([])
  const [userPoints,setUserPoints]=useState<number>(0)
  const [userBadges,setUserBadges]=useState<any>([])
  useEffect(() => {
    const getbadges=async ()=>{
      axios.get(`${url}/api/badge/${user._id}`).then((response)=>{
        setUserBadges(response.data.badges);
        console.log("user badges",response.data.badges)
      }).catch((error)=>{
        console.error("Error fetching badges:", error);
      });
    }
    getbadges();
  },[])
// Update the badges mapping to use real badges
const mapBadgesToDisplay = (): BadgeItem[] => {
  console.log("mapBadgesToDisplay called, userBadges:", userBadges);
  
  const badgeMap: { [key: string]: Omit<BadgeItem, 'earned' | 'earnedDate'> } = {
    'first5upvotes': {
      id: 'b1',
      name: 'Upvote Starter',
      description: 'Cast your first 5 upvotes',
      icon: <TrendingUp className="w-6 h-6" />,
      rarity: 'common'
      // Remove earned: true from here
    },
    'first10comments': {
      id: 'b2',
      name: 'Comment King',
      description: 'Write 10 comments',
      icon: <Heart className="w-6 h-6" />,
      rarity: 'rare'
    },
    // Add more badges here
    'first20upvotes': {
      id: 'b3',
      name: 'Upvote Master',
      description: 'Receive 20 upvotes on your content',
      icon: <TrendingUp className="w-6 h-6" />,
      rarity: 'epic'
    },
    'first50upvotes': {
      id: 'b4',
      name: 'Upvote Legend',
      description: 'Reach 50 upvotes milestone',
      icon: <TrendingUp className="w-6 h-6" />,
      rarity: 'legendary'
    },
    'firstLogin': {
      id: 'b5',
      name: 'Welcome Aboard',
      description: 'Complete your first login',
      icon: <User className="w-6 h-6" />,
      rarity: 'common'
    },
    'profileComplete': {
      id: 'b6',
      name: 'Profile Perfectionist',
      description: 'Complete your profile with all details',
      icon: <User className="w-6 h-6" />,
      rarity: 'rare'
    }
  };

  // Fix: use 'key' instead of 'badge' based on the actual data structure
  const earnedBadgeKeys = userBadges.map(b => b.key);
  console.log("Earned badge keys:", earnedBadgeKeys);
  
  
  return Object.entries(badgeMap).map(([key, badge]) => {
    const isEarned = earnedBadgeKeys.includes(key);
    const earnedBadge = userBadges.find(b => b.key === key);
    console.log(`Badge Key: ${key}, isEarned: ${isEarned}, Earned Badge Data:`, earnedBadge);
    
    return {
      ...badge,
      earned: isEarned,  // This sets earned based on API data
      earnedDate: isEarned && earnedBadge?.awardedAt 
        ? new Date(earnedBadge.awardedAt).toLocaleDateString()
        : undefined
    };
  });
};
useEffect(() => {
  console.log("Fetching quest progress...",user);
   

  const token = localStorage.getItem('token');
  if (token) {
    axios.get(`${url}/api/quest`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
        const questData = response.data.quests[0];
        setUserPoints(response.data.userPoints)
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
      description: `Upvote 5 products`,
      progress: questData?.upvotesToday || 0 ,
      target: 5,
      reward: '100 XP + Badge',
      type: 'daily',
      icon: <TrendingUp className="w-5 h-5" />,
      xp: 100,
      completed: (questData?.upvotesToday || 0) >= 5 
    },
    
  ])
 if(dailyQuest.some(quest => quest.completed)){
  toast.success("Daily quest completed! Rewards claimed.");
}
    })
    .catch(error => {
      console.error('Error fetching quest progress:', error);
    });
  }
}, []);
  // Mock quests data

 

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
      name:  'Early Adopter',
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
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 mb-1">Your Points</p>
                    <p className="text-3xl font-bold text-white">{userPoints}</p>
                  </div>
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
            {/* <div>
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
            </div> */}
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
                    {mapBadgesToDisplay().filter(b => b.earned).length} of {mapBadgesToDisplay().length} badges earned
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mapBadgesToDisplay().map((badge) => (
                <Card
                  key={badge.id}
                  className={`${
                    badge.earned 
                      ? getRarityBg(badge.rarity) 
                      : 'bg-gray-50 border-gray-200'
                  } border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    badge.earned ? 'hover:scale-105' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`bg-gradient-to-br ${getRarityColor(
                          badge.rarity
                        )} p-4 rounded-2xl mb-4 text-white ${
                          !badge.earned && 'opacity-40 grayscale'
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
                      <h3 className={`font-bold text-lg mb-2 ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                        {badge.name}
                      </h3>
                      <p className={`text-sm mb-4 ${badge.earned ? 'text-gray-600' : 'text-gray-500'}`}>
                        {badge.description}
                      </p>
                      {badge.earned ? (
                        <div className="flex items-center text-sm text-green-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Earned {badge.earnedDate}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Not yet earned</p>
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
          {!quest.completed && <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">
              {quest.progress} / {quest.target}
            </span>
          </div>}
          {!quest.completed && 
          <Progress value={progressPercent} className="h-3" />}
          {quest.completed ? (
            <Button className="w-full bg-green-600 hover:bg-green-700 " style={{color:"black"}} disabled>
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


