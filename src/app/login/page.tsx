'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import type { Member } from '@/lib/member-data';

const USERNAME_KEY = 'tradeview_username';
const USER_EMAIL_KEY = 'tradeview_user_email';
const MEMBER_SINCE_KEY = 'tradeview_member_since';
const MEMBERS_KEY = 'tradeview_members';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Welcome Back!',
        });
        
        const username = data.user.email.split('@')[0];
        localStorage.setItem(USERNAME_KEY, username);
        localStorage.setItem(USER_EMAIL_KEY, data.user.email);
        
        // Ensure a member profile exists for the user
        const storedMembersRaw = localStorage.getItem(MEMBERS_KEY);
        let members: Member[] = storedMembersRaw ? JSON.parse(storedMembersRaw) : [];
        
        const userExistsAsMember = members.some(member => member.name === username);
        
        if (!userExistsAsMember) {
          const newUserMember: Member = {
            id: `user-${Date.now()}`, // Simple unique ID
            clubId: '', // No club initially
            name: username,
            role: 'Member',
            trophies: 0,
            avatar: 'https://asset.gaminvest.org/asset/social-trading/profile.png'
          };
          members.push(newUserMember);
          localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
        }

        router.push('/telegram-channels');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
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
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
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
                className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
           <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
