import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CheckCircle2 } from 'lucide-react';

export default function ConfigEditor() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/admin/config');
      setConfig(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put('/admin/config', config);
      setConfig(res.data.data);
      setSuccess(`Configuration saved successfully. New estimator sessions will use Version ${res.data.data.version}.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateGlobal = (key: string, value: number | string) => {
    setConfig({ ...config, [key]: value });
  };

  const updateQuestion = (qIndex: number, key: string, value: any) => {
    const newQuestions = [...config.questions];
    newQuestions[qIndex] = { ...newQuestions[qIndex], [key]: value };
    setConfig({ ...config, questions: newQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, key: string, value: any) => {
    const newQuestions = [...config.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = { ...newOptions[oIndex], [key]: value };
    newQuestions[qIndex].options = newOptions;
    setConfig({ ...config, questions: newQuestions });
  };

  if (loading) return <div className="text-zinc-500">Loading configuration...</div>;
  if (!config) return <div className="text-red-500">No active configuration found.</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">Estimator Configuration</h2>
        <div className="text-xs font-bold font-mono tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full uppercase">
          Version {config.version}
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 text-emerald-400 p-5 rounded-[2rem] border border-emerald-500/20 flex items-start space-x-3 mb-8">
          <CheckCircle2 className="w-5 h-5 mt-0.5" />
          <p className="font-medium text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 text-red-400 p-5 rounded-[2rem] border border-red-500/20 font-medium text-sm mb-8">
          {error}
        </div>
      )}

      {/* Global Modifiers */}
      <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-medium text-zinc-100 mb-6 pb-4 border-b border-zinc-800 relative">Global Pricing Rules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          <Input 
            label="Waste Factor (e.g. 0.10 for 10%)" 
            type="number" step="0.01" min="0" max="1"
            value={config.wasteFactor}
            onChange={(e: any) => updateGlobal('wasteFactor', e.target.value)}
            required
          />
          <Input 
            label="Permit Flat Fee ($)" 
            type="number" min="0"
            value={config.permitFlatFee}
            onChange={(e: any) => updateGlobal('permitFlatFee', e.target.value)}
            required
          />
          <Input 
            label="Range Spread Percentage (%)" 
            type="number" min="1" max="50"
            value={config.rangeSpreadPct}
            onChange={(e: any) => updateGlobal('rangeSpreadPct', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Questions List */}
      <h3 className="text-xl font-medium text-zinc-100 mt-12 mb-6">Estimator Questions</h3>
      
      {config.questions.map((q: any, qIndex: number) => (
        <div key={qIndex} className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-lg font-medium text-zinc-100">{q.label}</h4>
            <label className="flex items-center space-x-3 cursor-pointer bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors">
              <input 
                type="checkbox" 
                checked={q.active}
                onChange={(e: any) => updateQuestion(qIndex, 'active', e.target.checked)}
                className="w-4 h-4 text-indigo-500 rounded border-zinc-600 focus:ring-indigo-500 bg-zinc-900/50"
              />
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-400 select-none">Active</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input 
              label="Question Label"
              value={q.label}
              onChange={(e: any) => updateQuestion(qIndex, 'label', e.target.value)}
              required
            />
            {q.type === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Min Value" type="number"
                  value={q.min || ''}
                  onChange={(e: any) => updateQuestion(qIndex, 'min', e.target.value)}
                />
                <Input 
                  label="Max Value" type="number"
                  value={q.max || ''}
                  onChange={(e: any) => updateQuestion(qIndex, 'max', e.target.value)}
                />
              </div>
            )}
          </div>

          {q.options && q.options.length > 0 && (
            <div className="mt-8 border border-zinc-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-widest uppercase text-[10px]">Option Label</th>
                    <th className="px-6 py-4 font-bold tracking-widest uppercase text-[10px] w-1/3">Pricing Configuration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/30">
                  {q.options.map((opt: any, oIndex: number) => (
                    <tr key={oIndex} className={q.active ? "" : "opacity-50"}>
                      <td className="px-6 py-6 align-top">
                        <Input 
                          value={opt.label}
                          onChange={(e: any) => updateOption(qIndex, oIndex, 'label', e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-6 py-6 align-top space-y-4">
                        {opt.ratePerSqft !== null && (
                          <Input 
                            label="Rate per sq ft ($)" type="number" step="0.01" min="0"
                            value={opt.ratePerSqft}
                            onChange={(e: any) => updateOption(qIndex, oIndex, 'ratePerSqft', e.target.value)}
                          />
                        )}
                        {opt.multiplier !== null && (
                          <Input 
                            label="Multiplier" type="number" step="0.01" min="0"
                            value={opt.multiplier}
                            onChange={(e: any) => updateOption(qIndex, oIndex, 'multiplier', e.target.value)}
                          />
                        )}
                        {opt.tearOffPerSqft !== null && (
                          <Input 
                            label="Tear-off per sq ft ($)" type="number" step="0.01" min="0"
                            value={opt.tearOffPerSqft}
                            onChange={(e: any) => updateOption(qIndex, oIndex, 'tearOffPerSqft', e.target.value)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <div className="sticky bottom-0 bg-[#09090B] pt-6 pb-6 border-t border-zinc-800 z-10 flex justify-end">
        <Button type="submit" isLoading={saving} className="px-8">
          Save Configuration
        </Button>
      </div>
    </form>
  );
}
