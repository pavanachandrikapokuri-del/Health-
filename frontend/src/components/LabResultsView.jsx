import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export function LabResultsView({ labResults }) {
  const abnormalCount = labResults?.filter(l => l.status && l.status !== 'Normal').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Extracted Diagnostic Laboratory Results</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated diagnostic lab values extracted from uploaded laboratory test reports.
          </p>
        </div>

        {abnormalCount > 0 && (
          <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            <span>{abnormalCount} Abnormal Indicator(s)</span>
          </span>
        )}
      </div>

      {(!labResults || labResults.length === 0) ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
          <Activity className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p>No lab results extracted yet. Upload a diagnostic blood test or lab report to extract results.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Test Parameter</th>
                  <th className="p-4">Extracted Value</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4">Reference Range</th>
                  <th className="p-4">Test Date</th>
                  <th className="p-4">Clinical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {labResults.map((lab, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/60 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{lab.test_name}</td>
                    <td className="p-4 font-mono font-bold text-teal-300 text-sm">{lab.value}</td>
                    <td className="p-4 font-mono text-slate-400">{lab.unit || '-'}</td>
                    <td className="p-4 font-mono text-slate-400">{lab.reference_range || 'Reference range not provided in document'}</td>
                    <td className="p-4 font-mono text-slate-400">{lab.test_date || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        lab.status === 'Low' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        lab.status === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        lab.status === 'Critical' ? 'bg-red-600/30 text-red-200 border border-red-500' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {lab.status === 'Normal' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{lab.status || 'Normal'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
