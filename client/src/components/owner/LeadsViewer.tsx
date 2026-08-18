import React, { useEffect, useState } from 'react';
import { fetchCapturedLeads } from '../../services/estimatorApi';
import { CapturedLead } from '../../types';

export default function LeadsViewer() {
  const [leads, setLeads] = useState<CapturedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  useEffect(() => {
    fetchCapturedLeads()
      .then((loadedLeads) => {
        setLeads(loadedLeads);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load leads:', error);
        setErrorMessage('Failed to load leads');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="text-zinc-500 font-medium">Loading leads...</div>;
  if (errorMessage) return <div className="text-red-500 font-medium">{errorMessage}</div>;

  return (
    <div className="space-y-6 font-sans">
      <h2 className="text-3xl font-medium text-zinc-100 mb-8 tracking-tight">Captured Leads</h2>
      
      {leads.length === 0 ? (
        <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-zinc-800 text-center text-zinc-500 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
          No leads captured yet.
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map(lead => (
            <div key={lead.id} className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 overflow-hidden relative">
              <div 
                className="p-6 sm:p-8 cursor-pointer hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
              >
                <div>
                  <h3 className="text-xl font-medium text-zinc-100">{lead.name}</h3>
                  <div className="text-sm text-zinc-500 space-x-3 mt-2 font-mono">
                    <span>{lead.phone}</span>
                    <span className="text-zinc-700">•</span>
                    <span>{lead.email}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end">
                  <div className="font-light tracking-tight font-mono text-indigo-400 text-2xl">
                    ${lead.estimateLow.toLocaleString()} <span className="text-zinc-600">–</span> ${lead.estimateHigh.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold tracking-widest text-zinc-600 mt-2 uppercase">
                    {new Date(lead.capturedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {expandedLeadId === lead.id && (
                <div className="p-6 sm:p-8 bg-zinc-900/80 border-t border-zinc-800">
                  <h4 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-[0.2em]">Estimate Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-sm"><span className="text-zinc-500">Config Version:</span> <span className="font-mono text-zinc-100 bg-zinc-800 px-2 py-1 rounded ml-2">v{lead.configVersion?.version || '?'}</span></p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold tracking-widest text-zinc-600 mb-4 uppercase">Customer Answers</p>
                      {Object.entries(lead.answers || {}).map(([key, val]) => (
                        <div key={key} className="text-sm flex justify-between bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                          <span className="text-zinc-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium text-zinc-100">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
