import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getActiveConfiguration() {
  const configuration = await prisma.configVersion.findFirst({
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

  if (!configuration) {
    throw new Error('Active configuration not found');
  }

  return configuration;
}

export async function getAdminConfiguration() {
  const configuration = await prisma.configVersion.findFirst({
    where: { isActive: true },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: true
        }
      }
    }
  });

  return configuration;
}

export async function createNewConfigurationVersion(newConfigData: any) {
  return await prisma.$transaction(async (tx) => {
    const currentActiveConfig = await tx.configVersion.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' }
    });
    
    const nextVersionNumber = (currentActiveConfig?.version || 0) + 1;
    
    if (currentActiveConfig) {
      await tx.configVersion.update({
        where: { id: currentActiveConfig.id },
        data: { isActive: false }
      });
    }
    
    return await tx.configVersion.create({
      data: {
        version: nextVersionNumber,
        businessName: newConfigData.businessName || 'Northline Roofing & Exteriors',
        region: newConfigData.region || 'Columbus, OH',
        currency: newConfigData.currency || 'USD',
        wasteFactor: Number(newConfigData.wasteFactor),
        permitFlatFee: Number(newConfigData.permitFlatFee),
        rangeSpreadPct: Number(newConfigData.rangeSpreadPct),
        isActive: true,
        questions: {
          create: newConfigData.questions.map((question: any) => ({
            key: question.key,
            label: question.label,
            type: question.type,
            unit: question.unit || null,
            required: Boolean(question.required),
            min: question.min !== undefined && question.min !== null ? Number(question.min) : null,
            max: question.max !== undefined && question.max !== null ? Number(question.max) : null,
            active: Boolean(question.active),
            order: Number(question.order),
            options: {
              create: (question.options || []).map((option: any) => ({
                value: option.value,
                label: option.label,
                ratePerSqft: option.ratePerSqft !== undefined && option.ratePerSqft !== null ? Number(option.ratePerSqft) : null,
                multiplier: option.multiplier !== undefined && option.multiplier !== null ? Number(option.multiplier) : null,
                tearOffPerSqft: option.tearOffPerSqft !== undefined && option.tearOffPerSqft !== null ? Number(option.tearOffPerSqft) : null,
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: true
          }
        }
      }
    });
  });
}

export function sanitizeConfigForPublic(configuration: any) {
  // Strip proprietary pricing rates, multipliers, and internal parameters before sending to client
  return {
    id: configuration.id,
    version: configuration.version,
    businessName: configuration.businessName,
    region: configuration.region,
    currency: configuration.currency,
    questions: configuration.questions.map((question: any) => ({
      id: question.id,
      key: question.key,
      label: question.label,
      type: question.type,
      unit: question.unit,
      required: question.required,
      min: question.min,
      max: question.max,
      options: question.options.map((option: any) => ({
        id: option.id,
        value: option.value,
        label: option.label
      }))
    }))
  };
}
