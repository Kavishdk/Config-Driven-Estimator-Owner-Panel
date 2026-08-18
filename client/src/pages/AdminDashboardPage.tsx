import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/common/Button';
import { LogOut, LayoutDashboard, Settings, Users } from 'lucide-react';
import ConfigEditor from '../components/owner/ConfigEditor';
import LeadsViewer from '../components/owner/LeadsViewer';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'leads'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col md:flex-row font-sans text-zinc-100">
      <aside className="w-full md:w-64 bg-zinc-900/40 border-r border-zinc-800 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">N</div>
            <h1 className="text-xl font-medium tracking-tight">Northline Admin</h1>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Owner Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'config' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Configuration</span>
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'leads' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm">Leads</span>
          </button>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 transition-colors text-zinc-500 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'overview' && <OverviewPanel />}
          {activeTab === 'config' && <ConfigEditor />}
          {activeTab === 'leads' && <LeadsViewer />}
        </div>
      </main>
    </div>
  );
}

function OverviewPanel() {
  const [stats, setStats] = useState({ totalLeads: 0, activeVersion: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/leads'),
      api.get('/admin/config')
    ]).then(([leadsRes, configRes]) => {
      setStats({
        totalLeads: leadsRes.data.data.length,
        activeVersion: configRes.data.data?.version || 0
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-zinc-500 font-medium">Loading overview...</div>;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800/50 rounded-full border border-zinc-700 text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            System Online
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-4 relative">Total Leads Captured</span>
          <div className="text-6xl font-light tracking-tight font-mono text-indigo-400 relative">{stats.totalLeads}</div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center">
          <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-4">Active Config Version</span>
          <div className="text-6xl font-light tracking-tight font-mono text-zinc-100">v{stats.activeVersion}</div>
        </div>
      </div>
    </div>
  );
}
