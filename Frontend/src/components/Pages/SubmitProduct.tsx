import React, { useState } from 'react';
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
  TrendingUp,
  Users,
  Award
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
import { User } from '@/App';

interface SubmitProductPageProps {
  currentUser: User | null;
  onBackToDiscovery: () => void;
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

export default function SubmitProduct() {
  const [formData, setFormData] = useState({
    title: '',
    pitch: '',
    description: '',
    category: '',
    tags: [] as string[],
    demoUrl: '',
    githubUrl: '',
    mediaFiles: [] as File[]
  });
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const generateAIPitch = async () => {
    if (!formData.title) {
      toast.error('Please enter a product title first');
      return;
    }

    setIsGeneratingPitch(true);
    
    setTimeout(() => {
      const aiPitches = [
        `Revolutionizing ${formData.title.toLowerCase()} with cutting-edge AI technology that automates complex workflows and delivers insights at lightning speed.`,
        `Transform your ${formData.title.toLowerCase()} experience with intelligent automation, seamless integration, and user-centric design principles.`,
        `The next-generation ${formData.title.toLowerCase()} platform that combines powerful features with intuitive design for maximum productivity.`,
        `Innovative ${formData.title.toLowerCase()} solution that leverages advanced algorithms to solve real-world problems efficiently and effectively.`
      ];
      
      const randomPitch = aiPitches[Math.floor(Math.random() * aiPitches.length)];
      setFormData(prev => ({ ...prev, pitch: randomPitch }));
      setIsGeneratingPitch(false);
      toast.success('AI pitch generated successfully!');
    }, 2000);
  };

  // Resize image to fixed dimensions
  const resizeImage = (file: File, maxWidth: number = 1200, maxHeight: number = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            'image/jpeg',
            0.9 // Quality
          );
        };
        
        img.onerror = () => reject(new Error('Image load failed'));
      };
      
      reader.onerror = () => reject(new Error('File read failed'));
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (formData.mediaFiles.length + files.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    const processedFiles: File[] = [];
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB`);
        continue;
      }
      
      // Resize images, keep videos as-is
      if (file.type.startsWith('image/')) {
        try {
          const resizedFile = await resizeImage(file);
          processedFiles.push(resizedFile);
          toast.success(`${file.name} resized successfully`);
        } catch (error) {
          toast.error(`Failed to resize ${file.name}`);
        }
      } else {
        processedFiles.push(file);
      }
    }

    setFormData(prev => ({ 
      ...prev, 
      mediaFiles: [...prev.mediaFiles, ...processedFiles] 
    }));
    e.target.value = '';
  };

  const handleRemoveMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.title || !formData.pitch || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.pitch.length > 280) {
      toast.error('Pitch must be 280 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      const data = new FormData();
      data.append('title', formData.title);
      data.append('pitch', formData.pitch);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('tags', JSON.stringify(formData.tags));
      data.append('aiPitchSuggestions', JSON.stringify([]));
      data.append('autoTags', JSON.stringify([]));
      data.append('collaborators', JSON.stringify([]));
      data.append('websiteUrl', formData.demoUrl);
      data.append('demoUrl', formData.demoUrl);
      data.append('repoUrl', formData.githubUrl);

      formData.mediaFiles.forEach((file) => {
        data.append('media', file);
      });

      const response = await fetch('http://localhost:5000/api/products/AddProduct', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('✅ Product submitted successfully!');
        setFormData({
          title: '',
          pitch: '',
          description: '',
          category: '',
          tags: [],
          demoUrl: '',
          githubUrl: '',
          mediaFiles: []
        });
      } else {
        toast.error(result.error || 'Failed to submit product');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pitchCharacterCount = formData.pitch.length;
  const pitchLimitExceeded = pitchCharacterCount > 280;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{padding:'90px'}}>
          <Button 
            variant="secondary"
           
            className="mb-6 bg-white hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discovery
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center" style={{width:'40px', height:'40px'}}>
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl">
              Submit Your Product
            </h1>
          </div>
          
          <p className="text-lg text-white/90 max-w-2xl">
            Share your amazing product with the PeerRank community. Get genuine feedback, 
            connect with makers, and grow your audience.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Average Views</span>
              </div>
              <div className="text-2xl">1.2K+</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Community</span>
              </div>
              <div className="text-2xl">10K+</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm">Success Rate</span>
              </div>
              <div className="text-2xl">95%</div>
            </div>
          </div>
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
                <p className="text-sm text-gray-500">
                  Choose a clear, memorable name for your product
                </p>
              </div>

              {/* AI Pitch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pitch" className="text-base">
                    Micro-Pitch (280 characters) <span className="text-red-500">*</span>
                  </Label>
                  {/* <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAIPitch}
                    disabled={isGeneratingPitch || !formData.title}
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isGeneratingPitch ? 'Generating...' : 'AI Suggest'}
                  </Button> */}
                </div>
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
                <p className="text-sm text-gray-500">
                  Tell the community what makes your product unique
                </p>
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

              {/* Media Upload */}
              <div className="space-y-3">
                <Label className="text-base">Product Media (Max 5)</Label>
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="flex justify-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Video className="w-8 h-8 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-base mb-2">
                        Upload images, GIFs, or short demo videos
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Max 10MB per file • {formData.mediaFiles.length}/5 uploaded
                      </p>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        className="hidden"
                        id="media-upload"
                        multiple
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('media-upload')?.click()}
                        disabled={formData.mediaFiles.length >= 5}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.mediaFiles.length === 0 ? 'Choose Files' : 'Add More'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Media Preview */}
                {formData.mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.mediaFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={URL.createObjectURL(file)}
                              className="w-full h-full object-cover"
                              controls
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
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
                  <Label htmlFor="githubUrl" className="text-base">GitHub URL</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/username/repo"
                      value={formData.githubUrl}
                          style={{paddingLeft:'40px'}}
                      onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                      className="pl-11 h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Boost Info */}
              {/* <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-blue-900 mb-1">
                        Want instant visibility?
                      </h4>
                      <p className="text-sm text-blue-700">
                        Use Boost Tokens to feature your product on the trending page for 24 hours. 
                        Earn tokens by reviewing other products and engaging with the community!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-base"
                  disabled={isSubmitting || pitchLimitExceeded}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h4 className="text-sm mb-1">Clear Pitch</h4>
                  <p className="text-xs text-gray-600">
                    Focus on the problem you solve and unique value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🎨</span>
                </div>
                <div>
                  <h4 className="text-sm mb-1">Great Visuals</h4>
                  <p className="text-xs text-gray-600">
                    Use high-quality images or demo videos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🚀</span>
                </div>
                <div>
                  <h4 className="text-sm mb-1">Engage Early</h4>
                  <p className="text-xs text-gray-600">
                    Respond to comments and feedback quickly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
