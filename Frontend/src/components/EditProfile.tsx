import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
  const [portfolioMediaFiles, setPortfolioMediaFiles] = useState<{ [key: number]: File[] }>({});
 const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${url}/api/auth/${userId}`, {
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
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('File is too large. Maximum size is 5MB.');
        e.target.value = ''; // Reset the file input
        return;
      }
      
      setSelectedFile(file);
      setError(null); // Clear any previous errors
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
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

  const handlePortfolioMediaFileChange = (portfolioIndex: number, mediaIndex: number, file: File) => {
    setPortfolioMediaFiles(prev => {
      const files = prev[portfolioIndex] ? [...prev[portfolioIndex]] : [];
      files[mediaIndex] = file;
      return { ...prev, [portfolioIndex]: files };
    });

    // Optionally, show a preview or upload immediately
  };

  const addPortfolioItem = () => {
    setFormData(prev => ({
      ...prev,
      portfolio: [
        ...(prev.portfolio || []),
        { title: '', demoUrl: '', media: [''] }
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
      try {
        const formDataImage = new FormData();
        formDataImage.append('profilePicture', selectedFile);

        const imageResponse = await fetch(`${url}/api/auth/profile/picture`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataImage
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to upload profile picture');
        }

        const imageData = await imageResponse.json();
        profilePictureUrl = imageData.profilePicture;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
        return;
      }
    }

    // Rest of the code remains the same...
    const updatedPortfolio = await Promise.all(
      (formData.portfolio || []).map(async (project, pIdx) => {
        try {
          const updatedMedia = await Promise.all(
            (project.media || []).map(async (media, mIdx) => {
              const file = portfolioMediaFiles[pIdx]?.[mIdx];
              if (file) {
                try {
                  const formDataImage = new FormData();
                  formDataImage.append('media', file);
                  const response = await fetch(`${url}/api/auth/profile/media`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formDataImage
                  });
                  const data = await response.json();
                  return data.mediaUrl;
                } catch (err) {
                  console.error('Error uploading media:', err);
                  return media; // Return existing media URL if upload fails
                }
              }
              return media;
            })
          );
          return { ...project, media: updatedMedia };
        } catch (err) {
          console.error('Error processing portfolio item:', err);
          return project; // Return original project if processing fails
        }
      })
    );

    // Update profile with the rest of the data
    const response = await fetch(`${url}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        profilePicture: profilePictureUrl,
        portfolio: updatedPortfolio
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update profile');
    }

    navigate(`/profile/${userId}`);
  } catch (err) {
    console.error("Error in handleSubmit:", err);
    setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
  }
};
  const handleCancel = () => {
    navigate(`/profile/${userId}`);
  };

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;

  const labelClass = "block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5";
  const inputClass = "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-white/30";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-900 bg-zinc-950 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={handleCancel} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>Profile Picture</label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img src={imagePreview} alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                    onError={() => console.error("Failed to load preview image:", imagePreview)}
                  />
                )}
                <Input type="file" accept="image/*" onChange={handleImageChange} className={inputClass} />
              </div>
              {error && error.includes('File is too large') && (
                <p className="mt-1.5 text-xs text-red-400">{error}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Bio</label>
              <Textarea name="bio" value={formData.bio || ''} onChange={handleInputChange}
                placeholder="Tell us about yourself" rows={4} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Maker Story</label>
              <Textarea name="makerStory" value={formData.makerStory || ''} onChange={handleInputChange}
                placeholder="Share your maker journey" rows={4} className={inputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>GitHub URL</label>
                <Input name="github" value={formData.github || ''} onChange={handleInputChange}
                  placeholder="https://github.com/username" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Twitter URL</label>
                <Input name="twitter" value={formData.twitter || ''} onChange={handleInputChange}
                  placeholder="https://twitter.com/username" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>LinkedIn URL</label>
                <Input name="linkedin" value={formData.linkedin || ''} onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website URL</label>
                <Input name="website" value={formData.website || ''} onChange={handleInputChange}
                  placeholder="https://username.dev" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Portfolio</label>
              {formData.portfolio?.map((project, index) => (
                <div key={index} className="border border-zinc-800 bg-zinc-950 p-4 rounded-xl mt-3 space-y-3">
                  <Input placeholder="Project Title" value={project.title}
                    onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)}
                    className={inputClass} />
                  <Input placeholder="Demo URL" value={project.demoUrl}
                    onChange={(e) => handlePortfolioChange(index, 'demoUrl', e.target.value)}
                    className={inputClass} />
                  {project.media.map((_, mediaIndex) => (
                    <div key={mediaIndex} className="flex items-center gap-3">
                      <Input type="file" accept="image/*" className={inputClass}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handlePortfolioMediaFileChange(index, mediaIndex, file);
                        }} />
                      {portfolioMediaFiles[index]?.[mediaIndex] && (
                        <img src={URL.createObjectURL(portfolioMediaFiles[index][mediaIndex])}
                          alt="Preview" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <button type="button" onClick={addPortfolioItem}
                className="mt-3 flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Add Portfolio Item
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
              <button type="button" onClick={handleCancel}
                className="px-5 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-5 py-2 text-sm font-semibold bg-white text-black hover:bg-zinc-200 rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}