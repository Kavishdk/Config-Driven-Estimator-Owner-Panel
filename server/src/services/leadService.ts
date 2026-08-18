import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createLead(data: {
  configVersionId: string;
  name: string;
  phone: string;
  email: string;
  answers: Record<string, any>;
  estimateLow: number;
  estimateHigh: number;
}) {
  return await prisma.lead.create({
    data: {
      configVersionId: data.configVersionId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      answers: JSON.stringify(data.answers),
      estimateLow: data.estimateLow,
      estimateHigh: data.estimateHigh
    }
  });
}

export async function getAllLeads() {
  const leads = await prisma.lead.findMany({
    orderBy: { capturedAt: 'desc' },
    include: {
      configVersion: {
        select: { version: true }
      }
    }
  });

  return leads.map(lead => ({
    ...lead,
    answers: lead.answers ? JSON.parse(lead.answers as string) : {}
  }));
}
