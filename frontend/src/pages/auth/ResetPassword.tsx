import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
      message: 'Must include uppercase, lowercase, number, and special character',
    }),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('/auth/login');
    }
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-hero">
        <Card className="w-full max-w-md bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-saffron-lg text-center">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-display">Success!</CardTitle>
              <CardDescription>
                Your password has been successfully reset. 
                You will be redirected to the login page shortly.
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/auth/login')} className="w-full">
              Go to Login Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-hero">
      <Card className="w-full max-w-md bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-saffron-lg">
        <CardHeader className="space-y-1 text-center pb-8 border-b border-[var(--border-subtle)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5890a] to-[#e8b84b] shadow-lg shadow-[#f5890a]/40 text-[#1a1814]">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-display">Set New Password</CardTitle>
          <CardDescription className="text-sm">Please enter your new password below</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">New Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Confirm New Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            
            <Button type="submit" className="w-full py-6 text-base font-bold shadow-[0_0_15px_rgba(245,137,10,0.25)]" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
