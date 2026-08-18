import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAllLeads } from '../services/leadService';
import { getActiveConfiguration } from '../services/configService';

const prisma = new PrismaClient();

export async function getAdminConfig(req: Request, res: Response) {
  try {
    const config = await prisma.configVersion.findFirst({
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
    res.json({ data: config });
  } catch (error: any) {
    console.error('Error fetching admin config:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
}

export async function updateAdminConfig(req: Request, res: Response) {
  try {
    const newConfigData = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.configVersion.findFirst({
        where: { isActive: true },
        orderBy: { version: 'desc' }
      });
      
      const nextVersion = (current?.version || 0) + 1;
      
      if (current) {
        await tx.configVersion.update({
          where: { id: current.id },
          data: { isActive: false }
        });
      }
      
      return await tx.configVersion.create({
        data: {
          version: nextVersion,
          businessName: newConfigData.businessName || 'Northline Roofing & Exteriors',
          region: newConfigData.region || 'Columbus, OH',
          currency: newConfigData.currency || 'USD',
          wasteFactor: Number(newConfigData.wasteFactor),
          permitFlatFee: Number(newConfigData.permitFlatFee),
          rangeSpreadPct: Number(newConfigData.rangeSpreadPct),
          isActive: true,
          questions: {
            create: newConfigData.questions.map((q: any) => ({
              key: q.key,
              label: q.label,
              type: q.type,
              unit: q.unit || null,
              required: Boolean(q.required),
              min: q.min !== undefined && q.min !== null ? Number(q.min) : null,
              max: q.max !== undefined && q.max !== null ? Number(q.max) : null,
              active: Boolean(q.active),
              order: Number(q.order),
              options: {
                create: (q.options || []).map((o: any) => ({
                  value: o.value,
                  label: o.label,
                  ratePerSqft: o.ratePerSqft !== undefined && o.ratePerSqft !== null ? Number(o.ratePerSqft) : null,
                  multiplier: o.multiplier !== undefined && o.multiplier !== null ? Number(o.multiplier) : null,
                  tearOffPerSqft: o.tearOffPerSqft !== undefined && o.tearOffPerSqft !== null ? Number(o.tearOffPerSqft) : null,
                }))
              }
            }))
          }
        }
      });
    });
    
    res.json({ data: result });
  } catch (error: any) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
}

export async function getLeads(req: Request, res: Response) {
  try {
    const leads = await getAllLeads();
    res.json({ data: leads });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
}
