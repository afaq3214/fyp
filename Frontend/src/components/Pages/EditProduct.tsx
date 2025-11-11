import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Github, 
  ExternalLink,
  Wand2,
  Tags,
  X,
  ArrowLeft,
  Save
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';

interface Product {
  _id: string;
  title: string;
  pitch: string;
  description: string;
  category: string;
  tags: string[];
  media: string[];
  websiteUrl: string;
  demoUrl: string;
  repoUrl: string;
}

const categories = [
  'AI Tools',
  'Productivity',
  'Developer Tools',
  'Design',
  'SaaS',
  'Mobile Apps',
  'Web Apps',
  'E-commerce',
  'Education',
  'Health & Fitness'
];

const suggestedTags = [
  'AI', 'Machine Learning', 'Productivity', 'Design', 'Development',
  'SaaS', 'Mobile', 'Web', 'API', 'No-Code', 'Open Source',
  'Blockchain', 'AR/VR', 'IoT', 'Security', 'Analytics'
];

export default function EditProduct() {
   const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Product>({
    _id: '',
    title: '',
    pitch: '',
    description: '',
    category: '',
    tags: [],
    media: [],
    websiteUrl: '',
    demoUrl: '',
    repoUrl: ''
  });
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          navigate('/');
          return;
        }

        const response = await fetch(`${url}/api/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setFormData({
          _id: data._id,
          title: data.title,
          pitch: data.pitch,
          description: data.description || '',
          category: data.category,
          tags: data.tags || [],
          media: data.media || [],
          websiteUrl: data.websiteUrl || '',
          demoUrl: data.demoUrl || '',
          repoUrl: data.repoUrl || ''
        });
      } catch (error) {
        toast.error('Failed to load product');
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagAdd = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each file
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is larger than 5MB`);
        return false;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`File ${file.name} is not an image or video`);
        return false;
      }
      return true;
    });

    // Limit total number of files
    if (validFiles.length + formData.media.length > 5) {
      toast.error('Maximum 5 media files allowed');
      return;
    }

    setNewMediaFiles(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.pitch || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('pitch', formData.pitch);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('tags', JSON.stringify(formData.tags));
      data.append('websiteUrl', formData.websiteUrl);
      data.append('demoUrl', formData.demoUrl);
      data.append('repoUrl', formData.repoUrl);

      // Append all new media files
      newMediaFiles.forEach(file => {
        data.append('media', file);
      });

      // Add existing media that should be kept
      data.append('existingMedia', JSON.stringify(formData.media));

      const response = await fetch(`${url}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('✅ Product updated successfully!');
        navigate(-1);
      } else {
        toast.error(result.error || 'Failed to update product');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pitchCharacterCount = formData.pitch.length;
  const pitchLimitExceeded = pitchCharacterCount > 280;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{padding:'90px'}}>
          <Button 
            variant="secondary"
            onClick={() => navigate('/')}
            className="mb-6 bg-white hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center" style={{width:'40px', height:'40px'}}>
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl">
              Edit Your Product
            </h1>
          </div>
          
          <p className="text-lg text-white/90 max-w-2xl">
            Update your product details and keep your submission fresh.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{padding:'90px'}}>
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., AI Writing Assistant"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="text-lg h-12"
                  required
                />
              </div>

              {/* Pitch */}
              <div className="space-y-2">
                <Label htmlFor="pitch" className="text-base">
                  Micro-Pitch (280 characters) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="pitch"
                  placeholder="Describe your product in a compelling way..."
                  value={formData.pitch}
                  onChange={(e) => handleInputChange('pitch', e.target.value)}
                  className={`resize-none text-base ${pitchLimitExceeded ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  rows={3}
                  required
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    This will be your product's main tagline
                  </span>
                  <span className={pitchLimitExceeded ? 'text-red-500' : 'text-gray-500'}>
                    {pitchCharacterCount}/280
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-base">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Detailed Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about your product, features, target audience, use cases, etc."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="text-base"
                  rows={6}
                />
              </div>

              {/* Tags */}
              {/* <div className="space-y-3">
                <Label className="text-base">Tags (max 5)</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => formData.tags.includes(tag) ? handleTagRemove(tag) : handleTagAdd(tag)}
                      disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                      className="h-8"
                    >
                      <Tags className="w-3 h-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <span className="text-sm text-gray-600">Selected:</span>
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-600" 
                          onClick={() => handleTagRemove(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div> */}

              {/* Media Preview Section */}
              <div className="space-y-3">
                <Label className="text-base">Media Files (max 5)</Label>
                
                {/* Existing Media */}
                {formData.media.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {formData.media.map((mediaUrl, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={mediaUrl} 
                          alt={`Product media ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              media: prev.media.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Media Preview */}
                {newMediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {newMediaFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`New media ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setNewMediaFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {(formData.media.length + newMediaFiles.length) < 5 && (
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleMediaUpload}
                          className="hidden"
                          id="media-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('media-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Add Media Files
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          Maximum 5 files, 5MB each
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="demoUrl" className="text-base">Demo URL</Label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="demoUrl"
                      placeholder="https://your-demo.com"
                      value={formData.demoUrl}
                      style={{paddingLeft:'40px'}}
                      onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                      className="pl-11 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repoUrl" className="text-base">GitHub URL</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="repoUrl"
                      placeholder="https://github.com/username/repo"
                      value={formData.repoUrl}
                      style={{paddingLeft:'40px'}}
                      onChange={(e) => handleInputChange('repoUrl', e.target.value)}
                      className="pl-11 h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-base"
                  disabled={isSubmitting || pitchLimitExceeded}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}