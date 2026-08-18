import { Request, Response } from 'express';
import { getAllLeads } from '../services/leadService';
import { getAdminConfiguration, createNewConfigurationVersion } from '../services/configService';

export async function getAdminConfig(req: Request, res: Response) {
  try {
    const configuration = await getAdminConfiguration();
    res.json({ data: configuration });
  } catch (error: any) {
    console.error('Error fetching admin configuration:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
}

export async function updateAdminConfig(req: Request, res: Response) {
  try {
    const newConfigurationData = req.body;
    const updatedConfiguration = await createNewConfigurationVersion(newConfigurationData);
    res.json({ data: updatedConfiguration });
  } catch (error: any) {
    console.error('Error updating configuration:', error);
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
