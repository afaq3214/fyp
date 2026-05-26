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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <Sparkles className="w-5 h-5 mr-2 text-white" />
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
              <button
                type="button"
                onClick={generateAIPitch}
                disabled={isGeneratingPitch || !formData.title}
                className="flex items-center gap-1 text-xs border border-zinc-700 text-white hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {isGeneratingPitch ? 'Generating...' : 'AI Suggest'}
              </button>
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
              <span className="text-zinc-500">
                This will be your product's main tagline
              </span>
              <span className={pitchLimitExceeded ? 'text-red-500' : 'text-zinc-500'}>
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
            <Label className="text-zinc-300">Tags (max 5)</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => formData.tags.includes(tag) ? handleTagRemove(tag) : handleTagAdd(tag)}
                  disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                  className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-40 ${
                    formData.tags.includes(tag)
                      ? 'bg-white text-black'
                      : 'border border-zinc-700 text-white hover:text-white'
                  }`}
                >
                  <Tags className="w-3 h-3" />{tag}
                </button>
              ))}
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                <span className="text-xs text-zinc-500">Selected:</span>
                {formData.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleTagRemove(tag)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <Label className="text-zinc-300">Product Image/Demo</Label>
            <div className="border border-dashed border-zinc-700 rounded-xl p-6 text-center">
              <div className="flex justify-center gap-4 mb-4">
                <ImageIcon className="w-7 h-7 text-zinc-600" />
                <Video className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500 mb-4">Upload images, GIFs, or short demo videos (max 5MB)</p>
              <input type="file" accept="image/*,video/*" onChange={handleImageUpload} className="hidden" id="media-upload" />
              <button type="button" onClick={() => document.getElementById('media-upload')?.click()}
                className="flex items-center gap-2 mx-auto text-sm border border-zinc-700 text-white hover:text-white px-4 py-2 rounded-lg transition-colors">
                <Upload className="w-4 h-4" />Choose File
              </button>
              {formData.imageFile && (
                <p className="text-sm text-white mt-3">✓ {formData.imageFile.name} uploaded</p>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demoUrl">Demo URL</Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
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
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
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
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-white">Want instant visibility?</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Use Boost Tokens to feature your product on the trending page for 24 hours.
                Earn tokens by reviewing other products!
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="flex-1 border border-zinc-700 text-white hover:text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || pitchLimitExceeded}
              className="flex-1 bg-white text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Product'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}