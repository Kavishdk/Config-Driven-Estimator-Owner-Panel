import React, { useEffect, useState } from 'react';
import { fetchAdminConfiguration, updateAdminConfiguration } from '../../services/estimatorApi';
import { EstimatorConfiguration, Question, QuestionOption } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CheckCircle2 } from 'lucide-react';

export default function ConfigEditor() {
  const [configuration, setConfiguration] = useState<EstimatorConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const data = await fetchAdminConfiguration();
      setConfiguration(data);
    } catch (err) {
      console.error('Failed to load admin configuration:', err);
      setErrorMessage('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!configuration) return;

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const updatedConfig = await updateAdminConfiguration(configuration);
      setConfiguration(updatedConfig);
      setSuccessMessage(`Configuration saved successfully. New estimates will use Version ${updatedConfig.version}.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const updateGlobalModifier = (key: keyof EstimatorConfiguration, value: number | string) => {
    if (!configuration) return;
    setConfiguration({ ...configuration, [key]: value });
  };

  const updateQuestionField = (questionIndex: number, key: keyof Question, value: any) => {
    if (!configuration) return;
    const updatedQuestions = [...configuration.questions];
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [key]: value };
    setConfiguration({ ...configuration, questions: updatedQuestions });
  };

  const updateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    key: keyof QuestionOption,
    value: any
  ) => {
    if (!configuration) return;
    const updatedQuestions = [...configuration.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [key]: value };
    updatedQuestions[questionIndex].options = updatedOptions;
    setConfiguration({ ...configuration, questions: updatedQuestions });
  };

  if (isLoading) return <div className="text-zinc-500">Loading configuration...</div>;
  if (!configuration) return <div className="text-red-500">No active configuration found.</div>;

  return (
    <form onSubmit={handleSaveConfiguration} className="space-y-8 pb-12 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-medium text-zinc-100 tracking-tight">Estimator Configuration</h2>
        <div className="text-xs font-bold font-mono tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full uppercase">
          Version {configuration.version}
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 text-emerald-400 p-5 rounded-[2rem] border border-emerald-500/20 flex items-start space-x-3 mb-8">
          <CheckCircle2 className="w-5 h-5 mt-0.5" />
          <p className="font-medium text-sm">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500/10 text-red-400 p-5 rounded-[2rem] border border-red-500/20 font-medium text-sm mb-8">
          {errorMessage}
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
            value={configuration.wasteFactor ?? 0.10}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGlobalModifier('wasteFactor', e.target.value)}
            required
          />
          <Input 
            label="Permit Flat Fee ($)" 
            type="number" min="0"
            value={configuration.permitFlatFee ?? 350}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGlobalModifier('permitFlatFee', e.target.value)}
            required
          />
          <Input 
            label="Range Spread Percentage (%)" 
            type="number" min="1" max="50"
            value={configuration.rangeSpreadPct ?? 12}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGlobalModifier('rangeSpreadPct', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Questions List */}
      <h3 className="text-xl font-medium text-zinc-100 mt-12 mb-6">Estimator Questions</h3>
      
      {configuration.questions.map((questionItem, qIndex) => (
        <div key={questionItem.id || qIndex} className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-lg font-medium text-zinc-100">{questionItem.label}</h4>
            <label className="flex items-center space-x-3 cursor-pointer bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors">
              <input 
                type="checkbox" 
                checked={questionItem.active}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestionField(qIndex, 'active', e.target.checked)}
                className="w-4 h-4 text-indigo-500 rounded border-zinc-600 focus:ring-indigo-500 bg-zinc-900/50"
              />
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-400 select-none">Active</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input 
              label="Question Label"
              value={questionItem.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestionField(qIndex, 'label', e.target.value)}
              required
            />
            {questionItem.type === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Min Value" type="number"
                  value={questionItem.min ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestionField(qIndex, 'min', e.target.value)}
                />
                <Input 
                  label="Max Value" type="number"
                  value={questionItem.max ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestionField(qIndex, 'max', e.target.value)}
                />
              </div>
            )}
          </div>

          {questionItem.options && questionItem.options.length > 0 && (
            <div className="mt-8 border border-zinc-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-widest uppercase text-[10px]">Option Label</th>
                    <th className="px-6 py-4 font-bold tracking-widest uppercase text-[10px] w-1/3">Pricing Configuration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/30">
                  {questionItem.options.map((optionItem, oIndex) => (
                    <tr key={optionItem.id || oIndex} className={questionItem.active ? "" : "opacity-50"}>
                      <td className="px-6 py-6 align-top">
                        <Input 
                          value={optionItem.label}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestionOption(qIndex, oIndex, 'label', e.target.value)}
                          required
                        />
                      </td>
                      <td className="px-6 py-6 align-top space-y-4">
                        {optionItem.ratePerSqft !== null && optionItem.ratePerSqft !== undefined && (
                          <Input 
                            label="Rate per sq ft ($)" type="number" step="0.01" min="0"
                            value={optionItem.ratePerSqft}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestionOption(qIndex, oIndex, 'ratePerSqft', e.target.value)}
                          />
                        )}
                        {optionItem.multiplier !== null && optionItem.multiplier !== undefined && (
                          <Input 
                            label="Multiplier" type="number" step="0.01" min="0"
                            value={optionItem.multiplier}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestionOption(qIndex, oIndex, 'multiplier', e.target.value)}
                          />
                        )}
                        {optionItem.tearOffPerSqft !== null && optionItem.tearOffPerSqft !== undefined && (
                          <Input 
                            label="Tear-off per sq ft ($)" type="number" step="0.01" min="0"
                            value={optionItem.tearOffPerSqft}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestionOption(qIndex, oIndex, 'tearOffPerSqft', e.target.value)}
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
        <Button type="submit" isLoading={isSaving} className="px-8">
          Save Configuration
        </Button>
      </div>
    </form>
  );
}
