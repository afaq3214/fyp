import React, { useState, useEffect, useRef } from 'react';
import { Mail, Eye, EyeOff, Sparkles, TrendingUp, Users, Award, ArrowLeft, Key } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { User } from '../App';
import { Link } from 'react-router-dom';
// Extend the Window interface to include 'google'
declare global {
  interface Window {
    google?: any;
  }
}

interface AuthPageProps {
  mode: 'login' | 'signup' | 'forgot-password';
  onAuth: (user: User) => void;
  onBackToDiscovery: () => void;
}

export function AuthPage({ mode: initialMode, onAuth, onBackToDiscovery }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp'>('email');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Render Google Button
  useEffect(() => {
    const renderGoogleButton = () => {
      if (mode !== 'forgot-password' && window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: "770104627723-hf0muapqiuktipev3kv9c8ct78q3m146.apps.googleusercontent.com",
          callback: async (response: any) => {
            setIsLoading(true);
            try {
              const res = await fetch("http://localhost:5000/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: response.credential }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Google sign-in failed");

              if (data.token) localStorage.setItem("token", data.token);

              onAuth({
                ...data.user,
                profilePicture: data.user.profilePicture || "",
                bio: data.user.bio || "",
                badges: data.user.badges || [],
                projects: data.user.portfolio?.length || 0,
                products: data.user.portfolio?.length || 0,
                collaborations: data.user.portfolio?.length || 0,
                role: data.user.role || "user",
                status: "active",
                joinDate: data.user.createdAt || new Date().toISOString(),
              });

              toast.success("Signed in with Google!");
              resetForm();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Google sign-in error");
            } finally {
              setIsLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: googleBtnRef.current.offsetWidth,
        });
      }
    };

    // Try immediately
    renderGoogleButton();
    // Try again after a short delay to ensure ref is ready
    const timeout = setTimeout(renderGoogleButton, 300);

    return () => clearTimeout(timeout);
  }, [mode, onAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'forgot-password') {
        if (forgotPasswordStep === 'email') {
          const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

          toast.success('OTP sent to your email!');
          setForgotPasswordStep('otp');
        } else {
          const response = await fetch('http://localhost:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to reset password');

          toast.success('Password reset successfully! Please log in.');
          setMode('login');
          resetForm();
        }
      } else {
        if (mode === 'signup' && !agreeToTerms) {
          toast.error('Please agree to the terms and conditions');
          setIsLoading(false);
          return;
        }

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            ...(mode === 'signup' && { name })
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Authentication failed');

        if (data.token) localStorage.setItem('token', data.token);

        onAuth({
          ...data.user,
          profilePicture: data.user.profilePicture || '',
          bio: data.user.bio || '',
          badges: data.user.badges || [],
          projects: data.user.portfolio?.length || 0,
          products: data.user.portfolio?.length || 0,
          collaborations: data.user.portfolio?.length || 0,
          role: data.user.role || 'user',
          status: 'active',
          joinDate: data.user.createdAt || new Date().toISOString(),
        });

        toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!');
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setOtp('');
    setNewPassword('');
    setAgreeToTerms(false);
    setShowPassword(false);
    setForgotPasswordStep('email');
  };

  const getTitle = () => {
    if (mode === 'forgot-password') return 'Reset Your Password';
    return mode === 'login' ? 'Welcome Back to PeerRank' : 'Join PeerRank Today';
  };

  const getSubtitle = () => {
    if (mode === 'forgot-password') return 'Enter your email to receive a password reset code';
    return mode === 'login' 
      ? 'Sign in to discover and showcase amazing projects' 
      : 'Create an account to start your journey';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button */}
          <Link to='/'>
          <button
      
      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discovery
          </button>
              </Link>

          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                {mode === 'forgot-password' ? (
                  <Key className="w-8 h-8 text-white" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <h2 className="mt-6 text-slate-900">
              {getTitle()}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {getSubtitle()}
            </p>
          </div>

          {/* Auth Form */}
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="space-y-6">
              {/* Social Authentication - Only show for login/signup */}
              {mode !== 'forgot-password' && (
                <>
                  <div className="space-y-3">
                    <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]"></div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'forgot-password' ? (
                  forgotPasswordStep === 'email' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Please wait...' : 'Send OTP'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp">OTP Code</Label>
                        <Input
                          id="otp"
                          placeholder="Enter the 6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          disabled={isLoading}
                          maxLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Please wait...' : 'Reset Password'}
                      </Button>
                    </>
                  )
                ) : (
                  <>
                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {mode === 'signup' && (
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={agreeToTerms}
                          onCheckedChange={(checked:any) => setAgreeToTerms(checked as boolean)}
                          disabled={isLoading}
                          className="mt-1"
                        />
                        <Label htmlFor="terms" className="text-sm leading-normal">
                          I agree to the{' '}
                          <a href="#" className="text-blue-600 hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </a>
                        </Label>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading || (mode === 'signup' && !agreeToTerms)}
                    >
                      {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>
                  </>
                )}
              </form>

              {/* Toggle Mode */}
              <div className="text-center text-sm">
                {mode === 'forgot-password' ? (
                  <button
                    onClick={() => {
                      setMode('login');
                      setForgotPasswordStep('email');
                    }}
                    className="text-blue-600 hover:underline"
                    disabled={isLoading}
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <>
                    <span className="text-gray-600">
                      {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                    </span>{' '}
                    <button
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-blue-600 hover:underline"
                      disabled={isLoading}
                    >
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </>
                )}
              </div>

              {mode === 'login' && (
                <div className="text-center">
                  <button 
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => {
                      setMode('forgot-password');
                      setForgotPasswordStep('email');
                    }}
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center px-12">
        <div className="max-w-lg space-y-8">
          <div>
            <h1 className="text-white text-4xl mb-4">
              Discover & Showcase Amazing Projects
            </h1>
            <p className="text-slate-300 text-lg">
              Join a vibrant community of students, indie makers, and entrepreneurs. 
              Share your work and discover innovative products without paid promotions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white mb-1">
                  Trend Pulse Dashboard
                </h3>
                <p className="text-slate-400 text-sm">
                  Stay on top of trending projects and discover what's gaining momentum in the community.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white mb-1">
                  Community-Driven Rankings
                </h3>
                <p className="text-slate-400 text-sm">
                  Fair and transparent ranking system based on genuine community engagement and feedback.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white mb-1">
                  Gamified Interactions
                </h3>
                <p className="text-slate-400 text-sm">
                  Earn badges, complete challenges, and build your reputation in the maker community.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800">
            <p className="text-slate-400 text-sm">
              Trusted by thousands of makers and entrepreneurs worldwide
            </p>
            <div className="flex items-center space-x-8 mt-4">
              <div>
                <div className="text-white text-2xl">10K+</div>
                <div className="text-slate-400 text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-white text-2xl">5K+</div>
                <div className="text-slate-400 text-sm">Projects</div>
              </div>
              <div>
                <div className="text-white text-2xl">50K+</div>
                <div className="text-slate-400 text-sm">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
