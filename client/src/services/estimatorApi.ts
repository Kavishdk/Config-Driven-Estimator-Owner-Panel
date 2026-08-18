import api from './api';
import {
  EstimatorConfiguration,
  EstimateSubmission,
  EstimateResult,
  CapturedLead
} from '../types';

export async function fetchPublicConfiguration(): Promise<EstimatorConfiguration> {
  const response = await api.get('/config');
  return response.data.data;
}

export async function calculateEstimate(
  submission: EstimateSubmission
): Promise<EstimateResult> {
  const response = await api.post('/estimate', submission);
  return response.data.data;
}

export async function fetchAdminConfiguration(): Promise<EstimatorConfiguration> {
  const response = await api.get('/admin/config');
  return response.data.data;
}

export async function updateAdminConfiguration(
  configuration: EstimatorConfiguration
): Promise<EstimatorConfiguration> {
  const response = await api.put('/admin/config', configuration);
  return response.data.data;
}

export async function fetchCapturedLeads(): Promise<CapturedLead[]> {
  const response = await api.get('/admin/leads');
  return response.data.data;
}

export async function adminLogin(
  credentials: { username: string; password: string }
): Promise<{ token: string }> {
  const response = await api.post('/admin/login', credentials);
  return response.data;
}
