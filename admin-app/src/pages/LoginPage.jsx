import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import useStore from '../stores/useStore';

export default function LoginPage() {
  const { authenticateAdmin, signIn, user, addToast } = useStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState('password');
  const [loading, setLoading] = useState(false);

  const handlePassword = (e) => {
    e.preventDefault();
    if (authenticateAdmin(password)) {
      setStep('auth');
    } else {
      addToast('Wrong password', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn();
      addToast('Welcome, Admin!', 'success');
      navigate('/');
    } catch (e) {
      addToast(e.message || 'Login failed', 'error');
    }
    setLoading(false);
  };

  if (step === 'password') {
    return (
      <div className="min-h-screen bg-darkBg bg-grid flex items-center justify-center p-6">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-red-600/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-sm flex flex-col items-center relative z-10">
          <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-black gradient-text mb-2 tracking-tight">ADMIN PANEL</h1>
          <p className="text-sm text-gray-500 mb-8 text-center">Enter admin password to continue</p>

          <form onSubmit={handlePassword} className="w-full max-w-[280px] space-y-3">
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full py-3.5 px-4 pr-12 rounded-[14px] bg-white/[0.05] border border-white/[0.08] text-white text-sm font-bold outline-none focus:border-violet-500/50 transition-colors"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" className="w-full py-3.5 rounded-[14px] gradient-btn text-white text-sm font-black">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg bg-grid flex items-center justify-center p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-3xl animate-pulse-slow" />

      <div className="w-full max-w-sm flex flex-col items-center relative z-10">
        <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30">
          <Shield className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-black gradient-text mb-2 tracking-tight">TASK EARN BD</h1>
        <p className="text-sm text-gray-500 mb-8 text-center">Sign in with your Google account</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full max-w-[280px] py-3.5 px-6 rounded-[14px] bg-white text-sm font-bold text-gray-800 flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl disabled:opacity-40"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <p className="text-[10px] text-gray-600 mt-6 text-center">
          Password verified. Google account must have admin role.
        </p>
      </div>
    </div>
  );
}
