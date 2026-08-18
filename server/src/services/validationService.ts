import { ExtendedConfig } from '../utils/calculator';

export function validateEstimateAnswers(config: ExtendedConfig, answers: Record<string, any>) {
  for (const question of config.questions) {
    const value = answers[question.key];
    
    // Check required fields
    if (question.required && (value === undefined || value === null || value === '')) {
      throw new Error(`Missing required field: ${question.key}`);
    }

    if (value !== undefined && value !== null && value !== '') {
      if (question.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`${question.key} must be a valid number`);
        }
        if (question.min !== null && num < question.min) {
          throw new Error(`${question.key} must be at least ${question.min}`);
        }
        if (question.max !== null && num > question.max) {
          throw new Error(`${question.key} must be at most ${question.max}`);
        }
      } else if (question.type === 'select') {
        const isValidOption = question.options.some(opt => opt.value === String(value));
        if (!isValidOption) {
          throw new Error(`Invalid option selected for ${question.key}`);
        }
      }
    }
  }
}
