import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { HardHat } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Username" 
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />
            
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            
            <Button type="submit" isLoading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
