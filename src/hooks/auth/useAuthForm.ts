// src/hooks/auth/useAuthForm.ts
import React, { useState } from 'react';
import axios from '../../Service/axios';

interface UseAuthFormOptions {
  onLoginSuccess?: () => void;
}

export const useAuthForm = ({ onLoginSuccess }: UseAuthFormOptions = {}) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `/auth/login`,
        { email, password }
      );

      if (response.data?.user) {
        resetForm();
        onLoginSuccess?.(); // ✅ trigger auth
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setError('');
    setLoading(true);

    try {
      await axios.post(
        `/auth/signup`,
        { name, email, password }
      );

      // Automatically Log in after signup
      await handleLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    isSignup ? await handleSignup() : await handleLogin();
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return {
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
  };
};
