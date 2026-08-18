import { describe, it, expect } from 'vitest';
import { calculateEstimate, ExtendedConfig } from './calculator';

const mockConfig: ExtendedConfig = {
  id: "c1",
  version: 1,
  businessName: "Test",
  region: "Test",
  currency: "USD",
  wasteFactor: 0.10,
  permitFlatFee: 350,
  rangeSpreadPct: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [
    {
      id: "q1", configVersionId: "c1", key: "roof_area", label: "Area", type: "number",
      unit: "sq ft", required: true, min: null, max: null, active: true, order: 1,
      options: []
    },
    {
      id: "q2", configVersionId: "c1", key: "material", label: "Mat", type: "select",
      unit: null, required: true, min: null, max: null, active: true, order: 2,
      options: [
        { id: "o1", questionId: "q2", value: "asphalt", label: "Asphalt", ratePerSqft: 5.0, multiplier: null, tearOffPerSqft: null }
      ]
    },
    {
      id: "q3", configVersionId: "c1", key: "pitch", label: "Pitch", type: "select",
      unit: null, required: true, min: null, max: null, active: true, order: 3,
      options: [
        { id: "o2", questionId: "q3", value: "steep", label: "Steep", ratePerSqft: null, multiplier: 1.2, tearOffPerSqft: null }
      ]
    },
    {
      id: "q4", configVersionId: "c1", key: "layers", label: "Layers", type: "select",
      unit: null, required: true, min: null, max: null, active: true, order: 4,
      options: [
        { id: "o3", questionId: "q4", value: "one", label: "One", ratePerSqft: null, multiplier: null, tearOffPerSqft: 1.5 }
      ]
    }
  ]
};

describe('calculateEstimate', () => {
  it('calculates a basic asphalt roofing estimate', () => {
    const answers = {
      roof_area: 1000,
      material: "asphalt",
      pitch: "steep",
      layers: "one"
    };

    // Material Cost: 1000 * 5.0 * 1.10 = 5500
    // Tear off: 1000 * 1.5 = 1500
    // Subtotal: (5500 + 1500) * 1.2 * 1.0 = 7000 * 1.2 = 8400
    // Midpoint: 8400 + 350 = 8750
    // Low (10% less): 8750 * 0.9 = 7875
    // High (10% more): 8750 * 1.1 = 9625
    
    const { estimateLow, estimateHigh } = calculateEstimate(mockConfig, answers);
    
    expect(estimateLow).toBe(7875);
    expect(estimateHigh).toBe(9625);
  });
});
