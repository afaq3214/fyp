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
  const [otp, setOtp] = useState<number>();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp'>('email');
  const [verificationStep, setVerificationStep] = useState<'none' | 'pending' | 'verifying'>('none');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);
const url = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";
  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // ✅ Render Google Button reliably (works in both Sign In & Sign Up)
  useEffect(() => {
    const renderGoogleButton = () => {
      if (mode !== 'forgot-password' && window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: "770104627723-hf0muapqiuktipev3kv9c8ct78q3m146.apps.googleusercontent.com",
          callback: async (response: any) => {
            setIsLoading(true);
            try {
              const res = await fetch(`${url}/api/auth/google`, {
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
    
    // Skip password validation for login and email step of forgot password
    if (mode === 'signup' || (mode === 'forgot-password' && forgotPasswordStep === 'otp')) {
      if (!validatePassword(mode === 'signup' ? password : newPassword)) {
        return;
      }
    }
    
    setIsLoading(true);

    try {
      if (mode === 'forgot-password') {
        if (forgotPasswordStep === 'email') {
          const response = await fetch('${url}/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

          toast.success('OTP sent to your email!');
          setForgotPasswordStep('otp');
          console.log("otp",otp)
        } else {
          const response = await fetch(`${url}/api/auth/reset-password`, {
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
        const response = await fetch(`${url}/${endpoint}`, {
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

        // If email verification is required
        if (data.message && data.message.includes('Verification code sent')) {
          setVerificationStep('pending');
          setPendingEmail(email);
          toast.success('Verification code sent to your email!');
          return;
        }

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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${url}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code: verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed');

      toast.success('Email verified! You can now log in.');
      setVerificationStep('none');
      setVerificationCode('');
      setPendingEmail('');
      onToggleMode('login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setOtp(undefined);
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

          {verificationStep !== 'pending' && (
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
                        type='number'
                        placeholder="Enter the 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value ? Number(e.target.value) : undefined)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newPassword">New Password</Label>
                        {newPassword && (
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className={`w-2 h-2 rounded-full ${/\d/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your new password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            validatePassword(e.target.value);
                          }}
                          required
                          disabled={isLoading}
                          className={passwordError ? 'border-red-500' : ''}
                        />
                        {passwordError && (
                          <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                        )}
                        <div className="text-xs text-gray-500 space-y-1 mt-1">
                          <p className={newPassword.length >= 8 ? 'text-green-500' : ''}>• At least 8 characters</p>
                          <p className={/[A-Z]/.test(newPassword) ? 'text-green-500' : ''}>• At least one uppercase letter</p>
                          <p className={/\d/.test(newPassword) ? 'text-green-500' : ''}>• At least one number</p>
                        </div>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {password && mode === 'signup' && (
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (mode === 'signup') {
                            validatePassword(e.target.value);
                          }
                        }}
                        required
                        disabled={isLoading}
                        className={passwordError ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && mode === 'signup' && (
                      <p className="text-xs text-red-500">{passwordError}</p>
                    )}
                    {mode === 'signup' && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className={password.length >= 8 ? 'text-green-500' : ''}>• At least 8 characters</p>
                        <p className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>• At least one uppercase letter</p>
                        <p className={/\d/.test(password) ? 'text-green-500' : ''}>• At least one number</p>
                      </div>
                    )}
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
          )}

          {verificationStep === 'pending' &&  (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="Enter the code sent to your email"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
          )}

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
