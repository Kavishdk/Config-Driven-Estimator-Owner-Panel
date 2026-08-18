import React, { useEffect, useState } from 'react';
import { fetchPublicConfiguration, calculateEstimate } from '../services/estimatorApi';
import { EstimatorConfiguration, EstimateAnswers, CustomerContact, EstimateResult } from '../types';
import { QuestionField } from '../components/estimator/QuestionField';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ShieldCheck, HardHat, CheckCircle } from 'lucide-react';

export default function EstimatorPage() {
  const [configuration, setConfiguration] = useState<EstimatorConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<EstimateAnswers>({});
  const [contact, setContact] = useState<CustomerContact>({ name: '', phone: '', email: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    fetchPublicConfiguration()
      .then((loadedConfiguration) => {
        setConfiguration(loadedConfiguration);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load estimator configuration:', error);
        setErrorMessage('Could not load configuration. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-zinc-500 font-medium">
        Loading estimator...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-red-500 font-medium">
        {errorMessage}
      </div>
    );
  }

  if (!configuration || !configuration.questions || configuration.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-zinc-500">
        Estimator is currently unavailable.
      </div>
    );
  }

  const questions = configuration.questions;
  const isContactStep = currentStepIndex === questions.length;
  
  const handleNextStep = () => {
    setFieldError('');
    if (!isContactStep) {
      const currentQuestion = questions[currentStepIndex];
      const answerValue = answers[currentQuestion.key];

      if (currentQuestion.required && (answerValue === undefined || answerValue === '' || answerValue === null)) {
        setFieldError('This field is required');
        return;
      }

      if (currentQuestion.type === 'number') {
        const numericValue = Number(answerValue);
        if (isNaN(numericValue)) {
          setFieldError('Must be a valid number');
          return;
        }
        if (currentQuestion.min !== null && currentQuestion.min !== undefined && numericValue < currentQuestion.min) {
          setFieldError(`Minimum is ${currentQuestion.min} ${currentQuestion.unit || ''}`.trim());
          return;
        }
        if (currentQuestion.max !== null && currentQuestion.max !== undefined && numericValue > currentQuestion.max) {
          setFieldError(`Maximum is ${currentQuestion.max} ${currentQuestion.unit || ''}`.trim());
          return;
        }
      }

      setCurrentStepIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleEstimateSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contact.name.trim() || !contact.phone.trim() || !contact.email.trim()) {
      setFieldError('All contact fields are required');
      return;
    }

    setFieldError('');
    setIsSubmitting(true);
    try {
      const result = await calculateEstimate({
        ...contact,
        answers
      });
      setEstimateResult(result);
    } catch (err: any) {
      setFieldError(err.response?.data?.error || 'Failed to calculate estimate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (estimateResult) {
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
              ${estimateResult.estimate_low.toLocaleString()} – ${estimateResult.estimate_high.toLocaleString()}
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

  const completionPercentage = Math.round((currentStepIndex / (questions.length + 1)) * 100);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col font-sans text-zinc-100">
      <header className="flex justify-between items-center px-8 py-6 mb-4 shrink-0 border-b border-zinc-800/50">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 text-zinc-100 font-semibold text-xl tracking-tight">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <span>{configuration.businessName}</span>
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
              <span>{isContactStep ? 'Final Step' : `Step ${currentStepIndex + 1} of ${questions.length}`}</span>
              <span className="text-indigo-400">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
          </div>

          <div className="bg-zinc-900/40 rounded-[2.5rem] shadow-sm border border-zinc-800 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
            <div className="relative">
              {!isContactStep ? (
                <div className="space-y-8">
                  <QuestionField
                    question={questions[currentStepIndex]}
                    value={answers[questions[currentStepIndex].key]}
                    onChange={(answerValue) =>
                      setAnswers((prevAnswers) => ({
                        ...prevAnswers,
                        [questions[currentStepIndex].key]: answerValue
                      }))
                    }
                    error={fieldError}
                  />
                  
                  <div className="pt-8 flex items-center justify-between gap-4 border-t border-zinc-800/50">
                    <Button 
                      variant="secondary" 
                      onClick={() => { setCurrentStepIndex((prev) => prev - 1); setFieldError(''); }} 
                      disabled={currentStepIndex === 0}
                      className="w-1/3"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      className="w-2/3"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEstimateSubmission} className="space-y-8">
                  <div className="text-left mb-8">
                    <span className="text-indigo-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Almost Done</span>
                    <h2 className="text-3xl font-medium text-zinc-100 leading-[1.1]">Where should we send your estimate?</h2>
                    <p className="text-zinc-500 mt-3 text-lg">We just need a few details to finalize your quote.</p>
                  </div>
                  
                  <div className="space-y-5">
                    <Input 
                      label="Full Name" 
                      value={contact.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContact({ ...contact, name: e.target.value })}
                      required
                    />
                    <Input 
                      label="Phone Number"
                      type="tel" 
                      value={contact.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContact({ ...contact, phone: e.target.value })}
                      required
                    />
                    <Input 
                      label="Email Address"
                      type="email" 
                      value={contact.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContact({ ...contact, email: e.target.value })}
                      required
                    />
                  </div>

                  {fieldError && <p className="text-sm text-red-500 font-medium">{fieldError}</p>}

                  <div className="pt-8 flex items-center justify-between gap-4 border-t border-zinc-800/50">
                    <Button 
                      variant="secondary" 
                      onClick={() => { setCurrentStepIndex((prev) => prev - 1); setFieldError(''); }} 
                      type="button"
                      className="w-1/3"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      isLoading={isSubmitting}
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
