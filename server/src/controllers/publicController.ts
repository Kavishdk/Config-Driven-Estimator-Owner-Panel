import { Request, Response } from 'express';
import { z } from 'zod';
import { getActiveConfiguration, sanitizeConfigForPublic } from '../services/configService';
import { calculateEstimate } from '../utils/calculator';
import { createLead } from '../services/leadService';
import { validateEstimateAnswers } from '../services/validationService';

export async function getPublicConfig(req: Request, res: Response) {
  try {
    const config = await getActiveConfiguration();
    const safeConfig = sanitizeConfigForPublic(config);
    res.json({ data: safeConfig });
  } catch (error: any) {
    console.error('Error fetching public config:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
}

const estimateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  answers: z.record(z.any())
});

export async function submitEstimate(req: Request, res: Response) {
  try {
    const validationResult = estimateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: validationResult.error.errors 
      });
    }

    const { name, phone, email, answers } = validationResult.data;

    const config = await getActiveConfiguration();

    try {
      validateEstimateAnswers(config, answers);
    } catch (validationError: any) {
      return res.status(400).json({ error: validationError.message });
    }

    const { estimateLow, estimateHigh } = calculateEstimate(config, answers);

    await createLead({
      configVersionId: config.id,
      name,
      phone,
      email,
      answers,
      estimateLow,
      estimateHigh
    });

    res.json({
      data: {
        estimate_low: estimateLow,
        estimate_high: estimateHigh,
        currency: config.currency
      }
    });
  } catch (error: any) {
    console.error('Error processing estimate:', error);
    res.status(500).json({ error: 'Internal server error while calculating estimate' });
  }
}
