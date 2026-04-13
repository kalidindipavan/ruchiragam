import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      toast.success('Reset code sent! Please check your email.');
      navigate(`/auth/reset?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-hero">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate('/auth/login')} className="text-[var(--text-muted)] hover:text-[var(--saffron-400)]">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
        </Button>
      </div>
      
      <Card className="w-full max-w-md bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-saffron-lg">
        <CardHeader className="space-y-1 text-center pb-8 border-b border-[var(--border-subtle)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5890a] to-[#e8b84b] shadow-lg shadow-[#f5890a]/40 text-[#1a1814]">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-display">Forgot Password?</CardTitle>
          <CardDescription className="text-sm">Enter your email and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            
            <Button type="submit" className="w-full py-6 text-base font-bold shadow-[0_0_15px_rgba(245,137,10,0.25)]" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Reset Link
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Link to="/auth/login" className="text-[var(--text-muted)] hover:text-[var(--saffron-400)] hover:underline">
              Return to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
