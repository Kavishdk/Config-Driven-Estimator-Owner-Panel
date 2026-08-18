export interface QuestionOption {
  id: string;
  value: string;
  label: string;
  ratePerSqft?: number | null;
  multiplier?: number | null;
  tearOffPerSqft?: number | null;
}

export interface Question {
  id: string;
  key: string;
  label: string;
  type: 'number' | 'select' | string;
  unit?: string | null;
  required: boolean;
  min?: number | null;
  max?: number | null;
  active: boolean;
  order: number;
  options: QuestionOption[];
}

export interface EstimatorConfiguration {
  id: string;
  version: number;
  businessName: string;
  region: string;
  currency: string;
  wasteFactor?: number;
  permitFlatFee?: number;
  rangeSpreadPct?: number;
  questions: Question[];
}

export interface EstimateAnswers {
  [questionKey: string]: string | number | boolean;
}

export interface CustomerContact {
  name: string;
  phone: string;
  email: string;
}

export interface EstimateSubmission extends CustomerContact {
  answers: EstimateAnswers;
}

export interface EstimateResult {
  estimate_low: number;
  estimate_high: number;
  currency: string;
}

export interface CapturedLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  estimateLow: number;
  estimateHigh: number;
  capturedAt: string;
  configVersion?: {
    version: number;
  };
  answers: EstimateAnswers;
}
