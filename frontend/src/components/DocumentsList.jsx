import React from 'react';
import { FileText, ChevronRight, UploadCloud, CheckCircle2, Clock } from 'lucide-react';

export function DocumentsList({ documents, onSelectDocument, onNavigateUpload }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-teal-400" />
            <span>Uploaded Medical Documents</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and inspect analyzed prescriptions, diagnostic reports, lab sheets, and discharge summaries.
          </p>
        </div>

        <button
          onClick={onNavigateUpload}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New</span>
        </button>
      </div>

      {(!documents || documents.length === 0) ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
          <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p>No documents uploaded yet. Click "Upload New" or seed synthetic demo data to explore.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc.id)}
              className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 p-5 rounded-2xl cursor-pointer transition-all shadow-sm space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  {doc.document_type}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  doc.processing_status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {doc.processing_status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base truncate group-hover:text-teal-300 transition-colors">
                  {doc.original_filename}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Uploaded: {new Date(doc.upload_date).toLocaleDateString()} | Type: {doc.file_type}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Extraction Confidence: <span className="text-teal-400 font-bold">{Math.round((doc.confidence || 0.85) * 100)}%</span>
                </span>
                <span className="text-teal-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
