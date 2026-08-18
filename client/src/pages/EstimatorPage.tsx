import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { QuestionField } from '../components/estimator/QuestionField';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ShieldCheck, HardHat, CheckCircle } from 'lucide-react';

export default function EstimatorPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    api.get('/config')
      .then(res => {
        setConfig(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load configuration. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-zinc-500 font-medium">Loading estimator...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-red-500 font-medium">{error}</div>;
  if (!config || !config.questions || config.questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-zinc-500">Estimator is currently unavailable.</div>;
  }

  const questions = config.questions;
  const isContactStep = step === questions.length;
  
  const handleNext = () => {
    setFieldError('');
    if (!isContactStep) {
      const q = questions[step];
      const val = answers[q.key];
      if (q.required && (val === undefined || val === '' || val === null)) {
        setFieldError('This field is required');
        return;
      }
      if (q.type === 'number') {
        const num = Number(val);
        if (isNaN(num)) {
          setFieldError('Must be a number');
          return;
        }
        if (q.min !== null && num < q.min) {
          setFieldError(`Minimum is ${q.min}`);
          return;
        }
        if (q.max !== null && num > q.max) {
          setFieldError(`Maximum is ${q.max}`);
          return;
        }
      }
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name || !contact.phone || !contact.email) {
      setFieldError('All contact fields are required');
      return;
    }
    setFieldError('');
    setSubmitting(true);
    try {
      const res = await api.post('/estimate', {
        ...contact,
        answers
      });
      setResult(res.data.data);
    } catch (err: any) {
      setFieldError(err.response?.data?.error || 'Failed to submit estimate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
        <div className="bg-zinc-900/40 rounded-[2.5rem] shadow-xl w-full max-w-lg p-10 text-center border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Your Estimated Roofing Cost</h2>
            <div className="text-4xl font-black font-mono text-indigo-400 my-8 tracking-tight">
              ${result.estimate_low.toLocaleString()} – ${result.estimate_high.toLocaleString()}
            </div>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              This is an initial estimate based on the information provided. A roofing professional will contact you shortly to provide a final quote after a physical inspection.
            </p>
            <Button variant="secondary" className="w-full h-12 rounded-full" onClick={() => window.location.reload()}>
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.round((step / (questions.length + 1)) * 100);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col font-sans text-zinc-100">
      <header className="flex justify-between items-center px-8 py-6 mb-4 shrink-0 border-b border-zinc-800/50">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 text-zinc-100 font-semibold text-xl tracking-tight">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <span>{config.businessName}</span>
          </div>
          <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Trusted Local Experts
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          <div className="mb-10">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
              <span>{isContactStep ? 'Final Step' : `Step ${step + 1} of ${questions.length}`}</span>
              <span className="text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          <div className="bg-zinc-900/40 rounded-[2.5rem] shadow-sm border border-zinc-800 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
            <div className="relative">
              {!isContactStep ? (
                <div className="space-y-8">
                  <QuestionField
                    question={questions[step]}
                    value={answers[questions[step].key]}
                    onChange={(val) => setAnswers(prev => ({ ...prev, [questions[step].key]: val }))}
                    error={fieldError}
                  />
                  
                  <div className="pt-8 flex items-center justify-between gap-4 border-t border-zinc-800/50">
                    <Button 
                      variant="secondary" 
                      onClick={() => { setStep(s => s - 1); setFieldError(''); }} 
                      disabled={step === 0}
                      className="w-1/3"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleNext}
                      className="w-2/3"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="text-left mb-8">
                    <span className="text-indigo-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Almost Done</span>
                    <h2 className="text-3xl font-medium text-zinc-100 leading-[1.1]">Where should we send your estimate?</h2>
                    <p className="text-zinc-500 mt-3 text-lg">We just need a few details to finalize your quote.</p>
                  </div>
                  
                  <div className="space-y-5">
                    <Input 
                      label="Full Name" 
                      value={contact.name}
                      onChange={(e: any) => setContact({ ...contact, name: e.target.value })}
                      required
                    />
                    <Input 
                      label="Phone Number"
                      type="tel" 
                      value={contact.phone}
                      onChange={(e: any) => setContact({ ...contact, phone: e.target.value })}
                      required
                    />
                    <Input 
                      label="Email Address"
                      type="email" 
                      value={contact.email}
                      onChange={(e: any) => setContact({ ...contact, email: e.target.value })}
                      required
                    />
                  </div>

                  {fieldError && <p className="text-sm text-red-500 font-medium">{fieldError}</p>}

                  <div className="pt-8 flex items-center justify-between gap-4 border-t border-zinc-800/50">
                    <Button 
                      variant="secondary" 
                      onClick={() => { setStep(s => s - 1); setFieldError(''); }} 
                      type="button"
                      className="w-1/3"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      isLoading={submitting}
                      className="w-2/3"
                    >
                      Calculate Estimate
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
