import React, { useState, useEffect, useRef } from 'react';
import { Mail, Github, Eye, EyeOff, Sparkles, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { User } from '../App';

// Extend the Window interface to include 'google'
declare global {
  interface Window {
    google?: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup' | 'forgot-password';
  onToggleMode: (mode: 'login' | 'signup' | 'forgot-password') => void;
  onAuth: (user: User) => void;
}

export function AuthModal({ isOpen, onClose, mode, onToggleMode, onAuth }: AuthModalProps) {
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

  // ✅ Render Google Button reliably (works in both Sign In & Sign Up)
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
              onClose();
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
          width: "100%",
        });
      }
    };

    // Try immediately
    renderGoogleButton();
    // Try again after a short delay to ensure ref is ready
    const timeout = setTimeout(renderGoogleButton, 300);

    return () => clearTimeout(timeout);
  }, [mode, onAuth, onClose]);

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
          onToggleMode('login');
          resetForm();
        }
      } else {
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
        onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                {mode === 'forgot-password' ? (
                  <Key className="w-6 h-6 text-white" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </DialogTitle>
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join PeerRank' : 'Reset Password'}
        </DialogHeader>

        <div className="space-y-6">
          {mode !== 'forgot-password' && (
            <>
              <div className="space-y-3">
                <div ref={googleBtnRef} className="w-full flex justify-center"></div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Please wait...' : 'Send OTP'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      placeholder="Enter the 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      disabled={isLoading}
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked: any) => setAgreeToTerms(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="terms" className="text-sm">
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading || (mode === 'signup' && !agreeToTerms)}
                >
                  {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </>
            )}
          </form>

          <div className="text-center text-sm">
            {mode === 'forgot-password' ? (
              <button
                onClick={() => onToggleMode('login')}
                className="text-blue-600 hover:underline font-medium"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            ) : (
              <>
                <span className="text-muted-foreground">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                </span>{' '}
                <button
                  onClick={() => onToggleMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-blue-600 hover:underline font-medium"
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
                onClick={() => onToggleMode('forgot-password')}
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
