import { ConfigVersion, QuestionOption, Question } from '@prisma/client';

export type ExtendedConfig = ConfigVersion & {
  questions: (Question & { options: QuestionOption[] })[];
};

export function calculateEstimate(config: ExtendedConfig, answers: Record<string, any>) {
  // 1. Helper to find selected options easily
  const getSelectedOption = (questionKey: string): QuestionOption | null => {
    const question = config.questions.find(q => q.key === questionKey);
    if (!question || !question.options) return null;
    
    const selectedValue = answers[questionKey];
    return question.options.find(opt => opt.value === String(selectedValue)) || null;
  };

  // 2. Read base parameters
  const roofArea = Number(answers['roof_area'] || 0);
  
  // 3. Resolve selected business logic options
  const materialOption = getSelectedOption('material');
  const pitchOption = getSelectedOption('pitch');
  const layersOption = getSelectedOption('layers');
  const storiesOption = getSelectedOption('stories');

  // 4. Extract rates and multipliers
  const materialRate = Number(materialOption?.ratePerSqft || 0);
  const pitchMultiplier = Number(pitchOption?.multiplier || 1.0);
  const tearOffRate = Number(layersOption?.tearOffPerSqft || 0);
  const storiesMultiplier = Number(storiesOption?.multiplier || 1.0);

  // 5. Calculate sub-costs
  const materialCost = roofArea * materialRate * (1 + config.wasteFactor);
  const tearOffCost = roofArea * tearOffRate;

  // 6. Apply multipliers
  const adjustedSubtotal = (materialCost + tearOffCost) * pitchMultiplier * storiesMultiplier;

  // 7. Add permit fee
  const midpoint = adjustedSubtotal + config.permitFlatFee;

  // 8. Calculate range
  const spread = config.rangeSpreadPct / 100;
  const estimateLow = Math.round(midpoint * (1 - spread));
  const estimateHigh = Math.round(midpoint * (1 + spread));

  return {
    estimateLow,
    estimateHigh
  };
}
