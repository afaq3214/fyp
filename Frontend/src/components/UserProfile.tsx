import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Star, 
  Trophy, 
  Users, 
  Briefcase,
  Github,
  Twitter,
  Globe,
  Edit3,
  Plus,
  ExternalLink,
  Heart,
  MessageCircle,
  Linkedin
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserProfileProps {
  onBackToDiscovery: () => void;
}

interface APIUser {
  _id: string;
  name: string;
  email: string;
  badges: string[];
  role: string;
  portfolio: {
    title: string;
    demoUrl: string;
    media: string[];
    _id: string;
  }[];
  achievements: {
    title: string;
    earnedAt: string;
    _id: string;
  }[];
  bio: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  makerStory: string;
  profilePicture: string;
  createdAt: string;
}

const mockProjects = [
  {
    id: '1',
    title: 'AI Writing Assistant',
    description: 'Transform your writing with AI-powered suggestions and grammar corrections',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    upvotes: 124,
    comments: 32,
    status: 'live',
    category: 'AI Tools'
  },
  {
    id: '2',
    title: 'TaskFlow Pro',
    description: 'Visual project management tool designed for creative teams',
    image: 'https://images.unsplash.com/photo-1700561570982-5f845601c505?w=400&h=250&fit=crop',
    upvotes: 89,
    comments: 18,
    status: 'development',
    category: 'Productivity'
  },
  {
    id: '3',
    title: 'CodeSnap',
    description: 'Beautiful code screenshots with syntax highlighting and themes',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe382dcfd?w=400&h=250&fit=crop',
    upvotes: 156,
    comments: 45,
    status: 'live',
    category: 'Developer Tools'
  }
];

const mockAchievements = [
  { name: 'Early Adopter', description: 'Joined PeerRank in the first month', icon: '🚀' },
  { name: 'Top Reviewer', description: 'Provided 50+ helpful reviews', icon: '⭐' },
  { name: 'AI Enthusiast', description: 'Active in AI Tools category', icon: '🤖' },
  { name: 'Community Builder', description: 'Helped 10+ makers with feedback', icon: '🤝' },
  { name: 'Trending Creator', description: 'Had 3 products in trending', icon: '🔥' }
];

const mockStats = {
  totalUpvotes: 369,
  totalComments: 95,
  profileViews: 1247,
  followerGrowth: 23
};

export function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<APIUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [profileCompletion, setProfileCompletion] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`https://fyp-1ejm.vercel.app/api/auth/${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            throw new Error('Please login again');
          }
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        console.log('Fetched user data:', data);
        setUser(data);

        // Calculate profile completion
        const fields = [
          data.name,
          data.email,
          data.bio,
          data.profilePicture,
          data.makerStory,
          data.github,
          data.twitter,
          data.linkedin,
          data.website,
          data.portfolio?.length > 0,
          data.badges?.length > 0,
        ];
        const filledFields = fields.filter(field => field && field !== '').length;
        const completionPercentage = Math.round((filledFields / fields.length) * 100);
        setProfileCompletion(completionPercentage);
      } catch (err) {
        console.error('Fetch user error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (err instanceof Error && err.message === 'No authentication token found') {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  const handleBackToDiscovery = () => {
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate(`/edit-profile/${userId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBackToDiscovery}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discovery
        </Button>

        {/* Profile Completion Progress Bar */}
        {profileCompletion < 100 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Profile Completion: {profileCompletion}%
                </h3>
                <Button 
                  variant="link" 
                  onClick={handleEditProfile}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Complete Your Profile
                </Button>
              </div>
              <Progress value={profileCompletion} className="w-full" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Add more details to your profile to unlock more features and increase visibility!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Profile Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl mb-6" />
          
          <div className="absolute -bottom-16 left-8">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800">
              <AvatarImage 
                src={user.profilePicture ? `${user.profilePicture}?t=${Date.now()}` : ''} 
                alt={user.name}
                onError={(e:any) => console.error('Failed to load profile picture:', user.profilePicture, e)}
              />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-12 pb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditProfile}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
                {user.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.role}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Full-stack Developer
                </div>
              </div>

              {user.makerStory && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Maker Story</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{user.makerStory}</p>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              <div className="flex items-center space-x-4 mb-6">
                {user.github && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.github} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {user.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {user.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
                {user.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {user.badges.map(badge => (
                  <Badge key={badge} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-8 md:mt-0 md:ml-8">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.portfolio.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{user.portfolio.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Collaborations</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{mockStats.totalUpvotes}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Upvotes</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{mockStats.totalComments}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Reviews Given</div>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Users className="w-4 h-4 mr-2" />
                Connect & Collaborate
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.portfolio.map(project => (
                <Card key={project._id} className="group cursor-pointer hover:shadow-lg transition-all duration-200">
                  <div className="relative">
                    {project.media[0] && (
                      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-lg">
                        <ImageWithFallback
                          src={project.media[0]}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={() => console.error('Failed to load project image:', project.media[0])}
                        />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white/90 text-gray-700" asChild>
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Achievements & Badges</h2>
            
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Progress to Collaboration Master</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">7/10 collaborations</span>
                </div>
                <Progress value={70} className="mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete 3 more collaborations to unlock this badge
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAchievements.map((achievement, index) => (
                <Card key={index} className="group hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{achievement.icon}</div>
                    <h3 className="font-semibold mb-2">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              {[
                { action: 'Received upvote', target: 'AI Writing Assistant', time: '2 hours ago', icon: '👍' },
                { action: 'Left review on', target: 'TaskFlow Pro', time: '1 day ago', icon: '💬' },
                { action: 'Connected with', target: 'Sarah Chen', time: '2 days ago', icon: '🤝' },
                { action: 'Updated project', target: 'CodeSnap', time: '3 days ago', icon: '✏️' },
                { action: 'Earned badge', target: 'Top Reviewer', time: '1 week ago', icon: '🏆' }
              ].map((activity, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span>
                          {' '}
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {activity.target}
                          </span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
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