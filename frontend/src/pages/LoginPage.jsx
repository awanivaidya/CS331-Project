import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await authAPI.login({ email, password });
      login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        login(email, password);
        navigate('/dashboard');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await authAPI.register({ username, email, password });
      setSuccess('Account created successfully! Please sign in.');
      setActiveTab('signin');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-400 mb-2">Customer Analytics</h1>
          <p className="text-gray-400">
            {activeTab === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-dark-bg rounded-lg p-1">
          <button
            onClick={() => switchTab('signin')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'signin'
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'register'
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder="johndoe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Create Account
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          {activeTab === 'signin' 
            ? "Don't have an account? Click Register above" 
            : 'Already have an account? Click Sign In above'}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
