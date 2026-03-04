import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles,
  Lightbulb,
  Search,
  HelpCircle,
  Minimize2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const apiUrl = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

interface AIChatbotProps {
  currentUser?: { name: string; profilePicture: string; id?: string } | null;
}

const quickActions = [
  { icon: Search, label: 'Find Products', query: 'Help me find AI tools for productivity' },
  { icon: Sparkles, label: 'Suggest for me', query: 'Suggest products for me' },
  { icon: Lightbulb, label: 'Sentiment insights', query: 'Show feedback sentiment' },
  { icon: HelpCircle, label: 'How PeerRank Works', query: 'How does PeerRank work?' },
];

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: "Hi! I'm your PeerRank AI assistant. I can help you discover products, write better pitches, understand how the platform works, or even brainstorm your next project idea. What would you like to explore?",
    timestamp: new Date(),
    suggestions: [
      "Find trending AI tools",
      "Help with product pitch",
      "Explain ranking system",
      "Suggest collaboration partners"
    ]
  }
];

export function AIChatbot({ currentUser }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponseSync = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('peerrank'))) {
      return "PeerRank is a community-driven platform where makers showcase their products without needing funding! 🚀 You can:\n\n• Submit your products with AI-powered pitch suggestions\n• Discover trending projects through our Trend Pulse\n• Give and receive peer reviews\n• Collaborate with other makers\n• Earn badges and build your reputation\n\nThe best part? Everything is based on community engagement, not paid promotions!";
    }
    
    if (lowerMessage.includes('find') || lowerMessage.includes('discover') || lowerMessage.includes('ai tool')) {
      return "Great! I can help you discover amazing products. Here are some trending categories:\n\n🤖 **AI Tools**: Writing assistants, code generators, design tools\n⚡ **Productivity**: Project management, automation, time tracking\n🎨 **Design**: UI kits, icon libraries, design systems\n💻 **Developer Tools**: APIs, frameworks, debugging tools\n\nWhat type of product interests you most? I can show you the latest submissions in any category!";
    }
    
    if (lowerMessage.includes('pitch') || lowerMessage.includes('write') || lowerMessage.includes('description')) {
      return "I'd love to help you craft a compelling pitch! ✨ Here are some tips:\n\n• **Start with the problem**: What specific pain point does your product solve?\n• **Show the solution**: How does your product fix this in a unique way?\n• **Keep it concise**: Aim for 280 characters max for micro-pitches\n• **Add personality**: Use active voice and power words\n\nWant to try writing one together? Tell me about your product and I'll help you refine it!";
    }
    
    if (lowerMessage.includes('idea') || lowerMessage.includes('project') || lowerMessage.includes('build')) {
      return "Exciting! 💡 Here are some trending project ideas based on what's popular on PeerRank:\n\n• **AI-powered productivity tools** (scheduling, note-taking, task management)\n• **No-code solutions** for common business problems\n• **Developer experience tools** (better debugging, code sharing)\n• **Remote work facilitators** (virtual collaboration, team building)\n• **Health & wellness apps** with gamification\n\nWhat's your area of expertise? I can suggest more specific ideas that match your skills!";
    }
    
    if (lowerMessage.includes('collaboration') || lowerMessage.includes('partner') || lowerMessage.includes('team')) {
      return "Collaboration is one of PeerRank's superpowers! 🤝 Here's how to find great partners:\n\n• **Check maker profiles** for complementary skills\n• **Look for active reviewers** - they're engaged community members\n• **Join collaboration quests** to meet like-minded makers\n• **Use the networking directory** to filter by skills\n\nI can help you identify potential collaborators based on your project needs. What kind of skills are you looking for?";
    }
    
    if (lowerMessage.includes('ranking') || lowerMessage.includes('algorithm') || lowerMessage.includes('trending')) {
      return "PeerRank uses a fair, community-driven ranking system! 📊 Here's how it works:\n\n• **Quality over popularity**: Detailed reviews count more than simple upvotes\n• **Fresh boost**: New products get temporary visibility\n• **Momentum engine**: Recent activity increases ranking\n• **Community input**: Peer reviews and engagement matter most\n• **No pay-to-win**: Organic growth only!\n\nYour product's ranking improves through genuine community engagement, not advertising spend.";
    }
    
    return "That's a great question! I'm here to help with anything related to PeerRank - from discovering cool products to improving your own submissions. Feel free to ask me about:\n\n• Finding specific types of products\n• Writing better pitches and descriptions\n• Understanding how the platform works\n• Getting ideas for new projects\n• Finding collaboration partners\n\nWhat would you like to explore? 🚀";
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const lower = message.toLowerCase();
    const token = localStorage.getItem('token');

    // AI Suggested products (logged-in)
    if ((lower.includes('suggest') || lower.includes('recommend') || lower.includes('for me')) && (lower.includes('product') || lower.includes('show') || lower.includes('me'))) {
      if (!token) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: "Please log in to get AI-suggested products based on your upvotes and interests.", timestamp: new Date() }]);
        setIsTyping(false);
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/api/recommendations/suggested?limit=5`, { headers: { Authorization: `Bearer ${token}` } });
        const data = res.ok ? await res.json() : [];
        const list = Array.isArray(data) ? data : [];
        const text = list.length
          ? "Here are products I suggest for you:\n\n" + list.map((p: { title?: string; _id?: string }) => "• " + (p.title || "Product") + " — view at /product/" + p._id).join("\n")
          : "Upvote or comment on products so I can suggest similar ones!";
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: text, timestamp: new Date() }]);
      } catch {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: "Could not load suggestions. Try again later.", timestamp: new Date() }]);
      }
      setIsTyping(false);
      return;
    }

    // Feedback sentiment insights
    if (lower.includes('sentiment') || lower.includes('feedback insight') || lower.includes('review sentiment')) {
      try {
        const res = await fetch(`${apiUrl}/api/recommendations/sentiment?limit=50`);
        const data = res.ok ? await res.json() : null;
        if (data && typeof data.total === 'number') {
          const d = data.distribution || {};
          const text = "Feedback sentiment insights:\n\n• Total comments analyzed: " + data.total + "\n• Average score: " + (data.averageScore ?? 0) + "\n• Positive: " + (d.positive ?? 0) + ", Neutral: " + (d.neutral ?? 0) + ", Negative: " + (d.negative ?? 0);
          setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: text, timestamp: new Date() }]);
        } else {
          setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: "No sentiment data yet. Comments are analyzed as they come in!", timestamp: new Date() }]);
        }
      } catch {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: "Could not load sentiment. Try again later.", timestamp: new Date() }]);
      }
      setIsTyping(false);
      return;
    }

    // Default: use sync responses
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponseSync(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className={`w-80 shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm ${isMinimized ? 'h-16' : 'h-96'} transition-all duration-300`}>
          <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">PeerRank AI</h3>
                  <p className="text-xs opacity-90">Your community assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-80">
              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.query)}
                        className="h-8 text-xs justify-start"
                      >
                        <action.icon className="w-3 h-3 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        {message.type === 'bot' ? (
                          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                        <AvatarFallback>{message.type === 'bot' ? 'AI' : 'U'}</AvatarFallback>
                      </Avatar>
                      <div className={`p-2 rounded-lg text-sm ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.suggestions && (
                          <div className="mt-2 space-y-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="h-6 text-xs justify-start w-full bg-white/10 hover:bg-white/20 text-left"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything about PeerRank..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim()}
                    size="sm"
                    className="h-9 w-9 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}