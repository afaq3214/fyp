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
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { User } from '../App';

interface ProductSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
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

export function ProductSubmissionModal({ isOpen, onClose, currentUser }: ProductSubmissionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    pitch: '',
    description: '',
    category: '',
    tags: [] as string[],
    demoUrl: '',
    githubUrl: '',
    imageFile: null as File | null
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
    
    // Simulate AI pitch generation
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
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

    // Simulate submission
    setTimeout(() => {
      toast.success('Product submitted successfully! 🎉');
      setIsSubmitting(false);
      setFormData({
        title: '',
        pitch: '',
        description: '',
        category: '',
        tags: [],
        demoUrl: '',
        githubUrl: '',
        imageFile: null
      });
      onClose();
    }, 2000);
  };

  const pitchCharacterCount = formData.pitch.length;
  const pitchLimitExceeded = pitchCharacterCount > 280;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            Submit Your Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Product Name *</Label>
            <Input
              id="title"
              placeholder="e.g., AI Writing Assistant"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          {/* AI-Powered Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pitch">Micro-Pitch (280 characters) *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIPitch}
                disabled={isGeneratingPitch || !formData.title}
                className="flex items-center"
              >
                <Wand2 className="w-4 h-4 mr-1" />
                {isGeneratingPitch ? 'Generating...' : 'AI Suggest'}
              </Button>
            </div>
            <Textarea
              id="pitch"
              placeholder="Describe your product in a compelling way..."
              value={formData.pitch}
              onChange={(e) => handleInputChange('pitch', e.target.value)}
              className={`resize-none ${pitchLimitExceeded ? 'border-red-500' : ''}`}
              rows={3}
              required
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                This will be your product's main tagline
              </span>
              <span className={pitchLimitExceeded ? 'text-red-500' : 'text-muted-foreground'}>
                {pitchCharacterCount}/280
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={formData.category} onValueChange={(value:any) => handleInputChange('category', value)}>
              <SelectTrigger>
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

          {/* Detailed Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your product, features, target audience, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags (max 5)</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map(tag => (
                <Button
                  key={tag}
                  type="button"
                  variant={formData.tags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => formData.tags.includes(tag) ? handleTagRemove(tag) : handleTagAdd(tag)}
                  disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                  className="h-7 text-xs"
                >
                  <Tags className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleTagRemove(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <Label>Product Image/Demo</Label>
            <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex justify-center space-x-4 mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload images, GIFs, or short demo videos (max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('media-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  {formData.imageFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {formData.imageFile.name} uploaded
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demoUrl">Demo URL</Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="demoUrl"
                  placeholder="https://your-demo.com"
                  value={formData.demoUrl}
                  onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="githubUrl"
                  placeholder="https://github.com/username/repo"
                  value={formData.githubUrl}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Boost Tokens Info */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">
                    Want instant visibility?
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Use Boost Tokens to feature your product on the trending page for 24 hours. 
                    Earn tokens by reviewing other products!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isSubmitting || pitchLimitExceeded}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}