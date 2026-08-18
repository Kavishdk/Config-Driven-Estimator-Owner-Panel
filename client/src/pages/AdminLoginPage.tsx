import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/estimatorApi';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { HardHat } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const { token } = await adminLogin({ username, password });
      localStorage.setItem('adminToken', token);
      navigate('/admin');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 font-sans text-zinc-100">
      <div className="bg-zinc-900/40 rounded-[2.5rem] shadow-xl w-full max-w-md p-10 border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <HardHat className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-medium text-zinc-100 mb-2">Owner Login</h2>
            <p className="text-zinc-500 mt-2 font-mono text-xs uppercase tracking-widest">Manage your estimator</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Username" 
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            
            {errorMessage && <p className="text-sm text-red-500 font-medium">{errorMessage}</p>}
            
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
