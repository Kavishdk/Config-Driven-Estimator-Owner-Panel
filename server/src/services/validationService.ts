import { ExtendedConfig } from '../utils/calculator';

export function validateEstimateAnswers(config: ExtendedConfig, answers: Record<string, any>) {
  for (const question of config.questions) {
    const value = answers[question.key];
    
    // Validate required fields
    if (question.required && (value === undefined || value === null || value === '')) {
      throw new Error(`"${question.label}" is required.`);
    }

    if (value !== undefined && value !== null && value !== '') {
      if (question.type === 'number') {
        const numericValue = Number(value);
        if (isNaN(numericValue)) {
          throw new Error(`"${question.label}" must be a valid number.`);
        }
        if (question.min !== null && numericValue < question.min) {
          throw new Error(`"${question.label}" must be at least ${question.min} ${question.unit || ''}`.trim());
        }
        if (question.max !== null && numericValue > question.max) {
          throw new Error(`"${question.label}" cannot exceed ${question.max} ${question.unit || ''}`.trim());
        }
      } else if (question.type === 'select') {
        const isValidOption = question.options.some(opt => opt.value === String(value));
        if (!isValidOption) {
          throw new Error(`Please select a valid option for "${question.label}".`);
        }
      }
    }
  }
}
