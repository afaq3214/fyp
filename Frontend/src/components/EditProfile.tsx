import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Plus } from 'lucide-react';

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

export function EditProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<APIUser>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:5000/api/auth/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
        setFormData({
          bio: data.bio,
          profilePicture: data.profilePicture,
          makerStory: data.makerStory,
          portfolio: data.portfolio,
          github: data.github,
          twitter: data.twitter,
          linkedin: data.linkedin,
          website: data.website,
          badges: data.badges,
          achievements: data.achievements
        });
        setImagePreview(data.profilePicture || null);
      } catch (err) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newPortfolio = [...(prev.portfolio || [])];
      newPortfolio[index] = { ...newPortfolio[index], [field]: value };
      return { ...prev, portfolio: newPortfolio };
    });
  };

  const handlePortfolioMediaChange = (portfolioIndex: number, mediaIndex: number, value: string) => {
    setFormData(prev => {
      const newPortfolio = [...(prev.portfolio || [])];
      newPortfolio[portfolioIndex] = {
        ...newPortfolio[portfolioIndex],
        media: newPortfolio[portfolioIndex].media.map((media, i) => 
          i === mediaIndex ? value : media
        )
      };
      return { ...prev, portfolio: newPortfolio };
    });
  };

  const addPortfolioItem = () => {
    setFormData(prev => ({
      ...prev,
      portfolio: [
        ...(prev.portfolio || []),
        { title: '', demoUrl: '', media: [''], _id: '' }
      ]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Upload profile picture if a new file was selected
      let profilePictureUrl = formData.profilePicture;
      if (selectedFile) {
        const formDataImage = new FormData();
        formDataImage.append('profilePicture', selectedFile);

        const imageResponse = await fetch(`http://localhost:5000/api/auth/profile/picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataImage
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.error || 'Failed to upload profile picture');
        }

        const imageData = await imageResponse.json();
        profilePictureUrl = imageData.profilePicture;
        console.log("Frontend received image URL:", profilePictureUrl); // Debug log
      }

      // Update profile with the rest of the data
      const response = await fetch(`http://localhost:5000/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: profilePictureUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      navigate(`/profile/${userId}`);
    } catch (err) {
      console.error("Frontend error:", err); // Debug log
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${userId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={handleCancel}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
                <div className="mt-1 flex items-center space-x-4">
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Profile Preview" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      onError={() => console.error("Failed to load preview image:", imagePreview)}
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                <Textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maker Story</label>
                <Textarea
                  name="makerStory"
                  value={formData.makerStory || ''}
                  onChange={handleInputChange}
                  placeholder="Share your maker journey"
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
                <Input
                  name="github"
                  value={formData.github || ''}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Twitter URL</label>
                <Input
                  name="twitter"
                  value={formData.twitter || ''}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/username"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
                <Input
                  name="linkedin"
                  value={formData.linkedin || ''}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
                <Input
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  placeholder="https://username.dev"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio</label>
                {formData.portfolio?.map((project, index) => (
                  <div key={index} className="border p-4 rounded-lg mt-2 space-y-2">
                    <Input
                      placeholder="Project Title"
                      value={project.title}
                      onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Demo URL"
                      value={project.demoUrl}
                      onChange={(e) => handlePortfolioChange(index, 'demoUrl', e.target.value)}
                    />
                    {project.media.map((media, mediaIndex) => (
                      <Input
                        key={mediaIndex}
                        placeholder={`Media URL ${mediaIndex + 1}`}
                        value={media}
                        onChange={(e) => handlePortfolioMediaChange(index, mediaIndex, e.target.value)}
                        className="mt-1"
                      />
                    ))}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-2"
                  onClick={addPortfolioItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Portfolio Item
                </Button>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}