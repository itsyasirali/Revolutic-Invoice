import React from 'react';
import { useAuthForm } from '../../hooks/auth/useAuthForm';
import Input from '../common/Input';
import Button from '../common/Button';
import {
  User,
  Mail,
  Lock,
} from 'lucide-react';

interface LoginSignupFormProps {
  onLoginSuccess?: () => void;
}

const LoginSignupForm: React.FC<LoginSignupFormProps> = ({ onLoginSuccess }) => {
  const {
    isSignup,
    name,
    email,
    password,
    confirmPassword,
    error,
    loading,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSubmit,
    toggleMode,
    handleKeyPress,
  } = useAuthForm({ onLoginSuccess });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[800px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-reveal">

        {/* Overlay Side */}
        <div className={`md:absolute md:top-0 md:bottom-0 w-full md:w-1/2 transition-all duration-700 ease-[cubic-bezier(0.645,0.045,0.355,1)] z-20 ${isSignup ? 'md:translate-x-0' : 'md:translate-x-full'}`}>
          <div className="h-full bg-gradient-to-br from-primary to-primary/80 text-white flex flex-col items-center justify-center p-8 md:p-12 py-20 text-center space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              {isSignup ? 'Welcome Back!' : 'Hello, Friend!'}
            </h2>
            <div className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-[0.2em] border-y border-white/20 py-1">
              Revolutic Invoice
            </div>
            <p className="text-xs md:text-sm font-medium opacity-90 max-w-[280px] leading-relaxed">
              {isSignup
                ? 'Manage your business finances with Revolutic Invoice'
                : 'Join Revolutic Invoice for professional invoicing and seamless billing'}
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="!bg-transparent !text-white !outline-none !border-primary !rounded-full !px-12 !py-2.5 !text-xs !font-bold hover:!bg-white/10 transition-all uppercase tracking-widest cursor-pointer !ring-0 !ring-offset-0 !shadow-none focus:!ring-0 focus:!ring-offset-0 focus:!shadow-none active:!ring-0 active:!ring-offset-0 active:!shadow-none"
              onClick={toggleMode}
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full h-full relative flex flex-col md:flex-row">
          <div className={`w-full md:w-1/2 p-8 md:p-10 flex flex-col items-center justify-center space-y-4 md:space-y-6 bg-white transition-all duration-700 ease-[cubic-bezier(0.645,0.045,0.355,1)] ${isSignup ? 'md:translate-x-full' : 'md:translate-x-0'}`}>
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-800">
                {isSignup ? 'Create Account' : 'Sign In'}
              </h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Revolutic Invoice</p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              {['f', 'g+', 'in'].map((social) => (
                <button
                  key={social}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {social === 'g+' ? 'G+' : social.toUpperCase()}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              {isSignup ? 'or register for Revolutic Invoice' : 'or use your Revolutic account'}
            </p>

            <div className="w-full max-w-[300px] space-y-3">
              {isSignup && (
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  className="!bg-slate-100 border-none rounded-lg !py-3 !px-4 text-sm animate-fade-in"
                  showLabel={false}
                  rightIcon={User}
                />
              )}

              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                className="!bg-slate-100 border-none rounded-lg !py-3 !px-4 text-sm"
                showLabel={false}
                rightIcon={Mail}
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                className="!bg-slate-100 border-none rounded-lg !py-3 !px-4 text-sm"
                showLabel={false}
                rightIcon={Lock}
              />

              {isSignup && (
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  className="!bg-slate-100 border-none rounded-lg !py-3 !px-4 text-sm animate-fade-in"
                  showLabel={false}
                  rightIcon={Lock}
                />
              )}

              {error && (
                <div className="text-red-500 text-xs text-center mt-2 animate-pulse">
                  {error}
                </div>
              )}

              {!isSignup && (
                <div className="text-center pt-2">
                  <button className="text-xs text-slate-800 font-medium hover:underline">Forgot password?</button>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  onClick={handleSubmit}
                  className="!bg-gradient-to-r !from-primary !to-primary/90 !text-white !rounded-full !py-3 !text-xs !font-bold uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-lg"
                >
                  {isSignup ? 'Sign Up' : 'Sign In'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupForm;
