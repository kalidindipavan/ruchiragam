import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const success = searchParams.get('success');

    if (token && success === 'true') {
      // Save token and verify
      localStorage.setItem('accessToken', token);
      checkAuth()
        .then(() => {
          toast.success('Successfully logged in with Google!');
          navigate('/', { replace: true });
        })
        .catch(() => {
          toast.error('Authentication failed. Please try again.');
          navigate('/auth/login', { replace: true });
        });
    } else {
      toast.error('OAuth login failed.');
      navigate('/auth/login', { replace: true });
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--saffron-500)] border-t-transparent shadow-[0_0_15px_rgba(245,137,10,0.5)]"></div>
        <p className="mt-4 text-lg font-medium text-[var(--saffron-400)]">Authenticating...</p>
      </div>
    </div>
  );
}
