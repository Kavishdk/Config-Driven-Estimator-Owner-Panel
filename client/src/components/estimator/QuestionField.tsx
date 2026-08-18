import React from 'react';
import { Input } from '../common/Input';
import { cn } from '../common/Button';

interface Option {
  id: string;
  value: string;
  label: string;
}

interface Question {
  id: string;
  key: string;
  label: string;
  type: string;
  unit?: string | null;
  min?: number | null;
  max?: number | null;
  options: Option[];
}

interface QuestionFieldProps {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

export function QuestionField({ question, value, onChange, error }: QuestionFieldProps) {
  if (question.type === 'number') {
    return (
      <div className="w-full">
        <label className="block text-xl font-medium text-zinc-100 mb-4">{question.label}</label>
        <div className="relative">
          <Input 
            type="number"
            min={question.min || undefined}
            max={question.max || undefined}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg py-6"
            placeholder={`e.g. ${question.min || 2000}`}
          />
          {question.unit && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold tracking-widest uppercase text-xs">
              {question.unit}
            </span>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
      </div>
    );
  }

  if (question.type === 'select') {
    return (
      <div className="w-full">
        <label className="block text-xl font-medium text-zinc-100 mb-4">{question.label}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {question.options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "flex items-center justify-between p-5 border rounded-2xl transition-all duration-200 text-left",
                  isSelected 
                    ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/80"
                )}
              >
                <span className={cn("font-medium", isSelected ? "text-indigo-400" : "text-zinc-300")}>
                  {opt.label}
                </span>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-indigo-400 bg-indigo-500" : "border-zinc-700 bg-zinc-800"
                )}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
        {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
      </div>
    );
  }

  return null;
}
