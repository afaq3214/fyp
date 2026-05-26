import React, { useContext, useEffect, useState } from 'react';
import {
  Trophy, Target, Clock, TrendingUp, Heart, Rocket,
  Award, CheckCircle2, Flame, Zap, Crown, Star, User
} from 'lucide-react';
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
}

const url = import.meta.env.VITE_API_URL || 'https://fyp-1ejm.vercel.app';

export function ChallengeQuests() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<'quests' | 'badges'>('quests');
  const [dailyQuest, setDailyQuest] = useState<Quest[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userBadges, setUserBadges] = useState<any[]>([]);

  useEffect(() => {
    if (!user?._id) return;
    axios.get(`${url}/api/badge/${user._id}`).then(r => {
      setUserBadges(r.data.badges || []);
    }).catch(console.error);
  }, [user?._id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${url}/api/quest`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const questData = r.data.quests?.[0];
        setUserPoints(r.data.userPoints || 0);
        if (!questData) return;
        setDailyQuest([
          {
            id: 'q1',
            title: 'Share the Love',
            description: 'Give emoji reactions to 3 products',
            progress: questData.commentsToday || 0,
            target: 3,
            reward: '2.5 pts',
            type: 'daily',
            icon: <Heart className="w-4 h-4" />,
            xp: 30,
            completed: (questData.commentsToday || 0) >= 3,
          },
          {
            id: 'q2',
            title: 'Upvote Champion',
            description: 'Upvote 2 products',
            progress: questData.upvotesToday || 0,
            target: 2,
            reward: '2.5 pts',
            type: 'daily',
            icon: <TrendingUp className="w-4 h-4" />,
            xp: 100,
            completed: (questData.upvotesToday || 0) >= 2,
          },
        ]);
      })
      .catch(console.error);
  }, []);

  const badgeMap: { [key: string]: Omit<BadgeItem, 'earned' | 'earnedDate'> } = {
    first5upvotes: {
      id: 'b1', name: 'Upvote Starter', description: 'Cast your first 5 upvotes',
      icon: <TrendingUp className="w-5 h-5" />, rarity: 'common',
    },
    first10comments: {
      id: 'b2', name: 'Comment King', description: 'Write 10 comments',
      icon: <Heart className="w-5 h-5" />, rarity: 'rare',
    },
    firstLogin: {
      id: 'b5', name: 'Welcome Aboard', description: 'Complete your first login',
      icon: <User className="w-5 h-5" />, rarity: 'common',
    },
    profileComplete: {
      id: 'b6', name: 'Profile Perfectionist', description: 'Complete your profile',
      icon: <User className="w-5 h-5" />, rarity: 'rare',
    },
  };

  const mapBadgesToDisplay = (): BadgeItem[] => {
    const earnedKeys = userBadges.map(b => b.key);
    return Object.entries(badgeMap).map(([key, badge]) => {
      const earned = earnedKeys.includes(key);
      const earnedBadge = userBadges.find(b => b.key === key);
      return {
        ...badge,
        earned,
        earnedDate: earned && earnedBadge?.awardedAt
          ? new Date(earnedBadge.awardedAt).toLocaleDateString()
          : undefined,
      };
    });
  };

  const rarityLabel: Record<string, string> = {
    legendary: 'Legendary',
    epic: 'Epic',
    rare: 'Rare',
    common: 'Common',
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Challenge Quests</h1>
              <p className="text-zinc-500 text-sm">
                Complete quests, earn badges, and level up your journey
              </p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
              <Trophy className="w-5 h-5 text-white" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Your Points</p>
                <p className="text-2xl font-bold">{userPoints}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit mb-8">
          {(['quests', 'badges'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'quests' ? <Target className="w-4 h-4" /> : <Award className="w-4 h-4" />}
              {tab === 'quests' ? 'Quests' : 'Badges'}
            </button>
          ))}
        </div>

        {/* Quests Tab */}
        {activeTab === 'quests' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-zinc-500" />
                <div>
                  <h2 className="text-sm font-semibold">Daily Quests</h2>
                  <p className="text-xs text-zinc-600">Resets in 8 hours</p>
                </div>
              </div>
              <span className="text-xs border border-zinc-800 text-zinc-500 px-3 py-1 rounded-full">
                {dailyQuest.filter(q => q.completed).length}/{dailyQuest.length} Complete
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyQuest.map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
              {dailyQuest.length === 0 && (
                <div className="col-span-2 border border-dashed border-zinc-800 rounded-xl p-12 text-center">
                  <Target className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                  <p className="text-zinc-500 text-sm">Sign in to view your quests</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-4 h-4 text-zinc-500" />
              <div>
                <h2 className="text-sm font-semibold">Badge Collection</h2>
                <p className="text-xs text-zinc-600">
                  {mapBadgesToDisplay().filter(b => b.earned).length} of{' '}
                  {mapBadgesToDisplay().length} badges earned
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mapBadgesToDisplay().map(badge => (
                <div
                  key={badge.id}
                  className={`border rounded-xl p-5 text-center transition-all ${
                    badge.earned
                      ? 'bg-zinc-900 border-zinc-700'
                      : 'bg-zinc-950 border-zinc-900 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                      badge.earned ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider border border-zinc-700 px-2 py-0.5 rounded-full">
                    {rarityLabel[badge.rarity]}
                  </span>
                  <h3 className={`font-semibold text-sm mt-2 mb-1 ${badge.earned ? 'text-white' : 'text-zinc-600'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-xs text-zinc-600 mb-3">{badge.description}</p>
                  {badge.earned ? (
                    <div className="flex items-center justify-center gap-1 text-xs text-zinc-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      {badge.earnedDate ? `Earned ${badge.earnedDate}` : 'Earned'}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-700">Not yet earned</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface QuestCardProps {
  quest: Quest;
}

function QuestCard({ quest }: QuestCardProps) {
  const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

  return (
    <div
      className={`border rounded-xl p-5 transition-all ${
        quest.completed
          ? 'bg-zinc-900 border-zinc-700'
          : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            quest.completed ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {quest.completed ? <CheckCircle2 className="w-4 h-4" /> : quest.icon}
        </div>
        <span className="text-[10px] border border-zinc-700 text-zinc-500 px-2 py-0.5 rounded-full">
          {quest.reward}
        </span>
      </div>

      <h3 className="font-semibold text-sm text-white mb-1">{quest.title}</h3>
      <p className="text-xs text-zinc-500 mb-4">{quest.description}</p>

      {!quest.completed && (
        <>
          <div className="flex items-center justify-between text-xs text-zinc-600 mb-2">
            <span>Progress</span>
            <span className="font-medium text-zinc-400">{quest.progress} / {quest.target}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full mb-4">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      )}

      <button
        disabled={quest.completed || progressPercent < 100}
        className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
          quest.completed
            ? 'bg-white/10 text-zinc-400 cursor-default'
            : progressPercent >= 100
            ? 'bg-white text-black hover:bg-zinc-200'
            : 'border border-zinc-800 text-zinc-600 cursor-default'
        }`}
      >
        {quest.completed ? 'Completed' : progressPercent >= 100 ? 'Claim Reward' : 'In Progress'}
      </button>
    </div>
  );
}
