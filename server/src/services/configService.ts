import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getActiveConfiguration() {
  const config = await prisma.configVersion.findFirst({
    where: { isActive: true },
    include: {
      questions: {
        where: { active: true },
        orderBy: { order: 'asc' },
        include: {
          options: true
        }
      }
    }
  });

  if (!config) {
    throw new Error('Active configuration not found');
  }

  return config;
}

export function sanitizeConfigForPublic(config: any) {
  // Strip sensitive internal data and pricing rates from frontend
  return {
    id: config.id,
    version: config.version,
    businessName: config.businessName,
    region: config.region,
    currency: config.currency,
    questions: config.questions.map((q: any) => ({
      id: q.id,
      key: q.key,
      label: q.label,
      type: q.type,
      unit: q.unit,
      required: q.required,
      min: q.min,
      max: q.max,
      options: q.options.map((o: any) => ({
        id: o.id,
        value: o.value,
        label: o.label
      }))
    }))
  };
}
