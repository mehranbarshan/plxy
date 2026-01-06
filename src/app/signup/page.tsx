'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const USERNAME_KEY = 'tradeview_username';
const MEMBER_SINCE_KEY = 'tradeview_member_since';

type PasswordStrength = {
    score: number;
    label: string;
    color: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength: PasswordStrength = useMemo(() => {
    let score = 0;
    let label = '';
    let color = '';

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length === 0) {
        score = 0;
    }

    switch (score) {
      case 0:
      case 1:
        label = 'Very Weak';
        color = 'bg-red-500';
        break;
      case 2:
        label = 'Weak';
        color = 'bg-red-500';
        break;
      case 3:
        label = 'Medium';
        color = 'bg-yellow-500';
        break;
      case 4:
        label = 'Strong';
        color = 'bg-green-500';
        break;
      case 5:
        label = 'Very Strong';
        color = 'bg-green-500';
        break;
      default:
        label = '';
        color = '';
    }
    
    return { score, label, color };
  }, [password]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordStrength.score < 3) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'Please choose a stronger password.',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Signup Successful!',
          description: 'Please log in with your new account.',
        });
        
        const memberSince = new Date(data.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        localStorage.setItem(MEMBER_SINCE_KEY, memberSince);

        router.push('/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'Signup Failed',
          description: data.message || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to the server.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                 <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
               {password.length > 0 && (
                <div className="mt-2 space-y-1">
                    <Progress value={passwordStrength.score * 20} className="h-2" indicatorClassName={passwordStrength.color} />
                    <p className={cn("text-xs font-semibold", 
                        passwordStrength.score < 3 ? 'text-red-500' : 
                        passwordStrength.score < 4 ? 'text-yellow-500' : 'text-green-500'
                    )}>
                        {passwordStrength.label}
                    </p>
                </div>
              )}
            </div>
             <div className="space-y-2 relative">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Log in
                </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
