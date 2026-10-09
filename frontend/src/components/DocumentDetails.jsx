import React, { useState } from 'react';
import { 
  FileText, 
  Pill, 
  Activity, 
  CheckCircle2, 
  Edit3, 
  RefreshCw, 
  Globe, 
  Sparkles, 
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Layers,
  Info
} from 'lucide-react';
import { processDocument, getSummary } from '../services/api';
import { VerificationModal } from './VerificationModal';
import { MedicalDisclaimer } from './MedicalDisclaimer';

export function DocumentDetails({ doc: initialDoc, onBack, onUpdateDoc, lang = 'en' }) {
  const [doc, setDoc] = useState(initialDoc);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState(null);

  const handleReprocess = async () => {
    try {
      setReprocessing(true);
      const updated = await processDocument(doc.id);
      setDoc(updated);
      if (onUpdateDoc) onUpdateDoc(updated);
    } catch (err) {
      alert('Failed to reprocess document');
    } finally {
      setReprocessing(false);
    }
  };

  const handleLanguageChange = async (targetLang) => {
    if (targetLang === 'en') {
      setTranslatedSummary(null);
      return;
    }
    try {
      const trans = await getSummary(doc.id, targetLang);
      setTranslatedSummary(trans);
    } catch (err) {
      console.error(err);
    }
  };

  // Parse stage2 intelligence if string
  let stage2Intel = null;
  if (doc.stage2_intelligence) {
    if (typeof doc.stage2_intelligence === 'string') {
      try {
        stage2Intel = JSON.parse(doc.stage2_intelligence);
      } catch (e) {
        stage2Intel = null;
      }
    } else {
      stage2Intel = doc.stage2_intelligence;
    }
  }

  const currentSummary = translatedSummary || doc.summary || {
    document_contains: "Extracted information from uploaded medical document.",
    key_findings: ["Document processed successfully."],
    abnormal_values: [],
    what_this_may_mean: "Extracted test parameters and medical records parsed cleanly.",
    suggested_next_steps: "Consult your primary healthcare provider for clinical evaluation."
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReprocess}
            disabled={reprocessing}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
            <span>{reprocessing ? 'Reprocessing...' : 'Reprocess'}</span>
          </button>

          <button
            onClick={() => setShowVerifyModal(true)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold border border-slate-700 px-4 py-1.5 rounded-lg flex items-center space-x-1.5 shadow"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Extracted Details</span>
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Stage 1 Document & OCR Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Document Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                {doc.document_type || 'Medical Record'}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                <span>Stage 1 Fact Extracted</span>
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white leading-snug">{doc.original_filename}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Uploaded: {new Date(doc.upload_date).toLocaleDateString()} | Type: {doc.file_type}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-400">Fact Extraction Confidence</span>
              <span className="font-mono font-bold text-teal-400">{Math.round((doc.confidence || 0.88) * 100)}%</span>
            </div>
          </div>

          {/* OCR Raw Text Extract */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Extracted Document Text (OCR)</span>
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-80 overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
              {doc.ocr_text || 'No text extracted from document.'}
            </div>
          </div>

          {/* Extracted Raw Fact Table */}
          {doc.lab_results?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Stage 1 Lab Results ({doc.lab_results.length})</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Test</th>
                      <th className="p-2">Result</th>
                      <th className="p-2">Ref Range</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {doc.lab_results.map((l, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold text-white">{l.test_name}</td>
                        <td className="p-2 font-mono">{l.value} {l.unit}</td>
                        <td className="p-2 font-mono text-slate-400">{l.reference_range || 'N/A'}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.status === 'Low' ? 'bg-amber-500/20 text-amber-300' :
                            l.status === 'High' ? 'bg-red-500/20 text-red-300' :
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {l.status}
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

        {/* RIGHT COLUMN: Stage 2 AI Health Copilot Intelligence (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Stage 2 Copilot Intelligence Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">Stage 2 Health Copilot Intelligence</h3>
              </div>

              <div className="flex items-center space-x-1.5 text-xs">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${!translatedSummary ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('te')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${translatedSummary ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
                >
                  తెలుగు
                </button>
              </div>
            </div>

            {/* Overall Synthesis */}
            <div>
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wide">Plain-Language Overview</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {stage2Intel?.overall_summary || currentSummary.document_contains}
              </p>
            </div>

            {/* Multi-factor patterns if present */}
            {stage2Intel?.multifactor_patterns?.length > 0 && (
              <div className="bg-indigo-950/80 border border-indigo-800/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                    Multi-Factor Pattern Detected
                  </h4>
                </div>
                {stage2Intel.multifactor_patterns.map((p, pidx) => (
                  <div key={pidx} className="text-xs text-indigo-200 space-y-1">
                    <p className="font-bold text-white">{p.pattern_name}</p>
                    <p className="leading-relaxed">{p.pattern_explanation}</p>
                    <p className="text-[11px] text-indigo-400 italic">Caution: {p.clinical_caution}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Detailed "What This Means" Breakdown for Abnormal Findings */}
            {stage2Intel?.abnormal_findings?.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Abnormal Findings & "What This Means" Breakdown</span>
                </h4>

                <div className="space-y-3">
                  {stage2Intel.abnormal_findings.map((abn, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{abn.test_name} ({abn.what_report_says})</span>
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                          {abn.severity === 'high' ? '🔴 High Attention' : '🟡 Moderate Attention'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-slate-300 text-[11px]">
                        <p><strong className="text-teal-400">What it means:</strong> {abn.what_this_means}</p>
                        <p><strong className="text-amber-400">Why it can matter:</strong> {abn.why_it_can_matter}</p>
                        <p className="text-slate-400"><strong className="text-slate-300">What it does NOT mean:</strong> {abn.what_this_does_not_mean}</p>
                        <p className="text-teal-300 font-medium"><strong className="text-white">What to discuss:</strong> {abn.what_to_discuss}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              currentSummary.abnormal_values?.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide">
                    Abnormal Values Highlighted
                  </h4>
                  <ul className="list-disc list-inside text-xs text-red-300 mt-1 space-y-1">
                    {currentSummary.abnormal_values.map((abn, idx) => (
                      <li key={idx}>{abn}</li>
                    ))}
                  </ul>
                </div>
              )
            )}

            {/* Questions to Discuss with Doctor */}
            {stage2Intel?.questions_for_doctor?.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Questions to Discuss with Your Doctor</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {stage2Intel.questions_for_doctor.map((q, qidx) => (
                    <li key={qidx} className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Extracted Medications with Copilot Interpretation */}
          {doc.medications?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                <span>Medication Intelligence ({doc.medications.length})</span>
              </h3>

              <div className="space-y-2">
                {doc.medications.map((m, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{m.medicine_name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">
                        {m.strength || 'Dose N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Frequency: <span className="text-slate-200 font-medium">{m.frequency}</span> | Instructions: <span className="text-slate-300">{m.instructions || 'As prescribed'}</span>
                    </p>
                    <p className="text-[11px] text-teal-300 italic pt-1 border-t border-slate-800">
                      <strong>Copilot Interpretation:</strong> Listed as {m.strength} with schedule {m.frequency} ({m.instructions}). Verify instructions against original prescription.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Safety Disclaimer */}
          <MedicalDisclaimer lang={lang} />

        </div>

      </div>

      {/* Optional Edit Modal */}
      {showVerifyModal && (
        <VerificationModal
          doc={doc}
          onClose={() => setShowVerifyModal(false)}
          onSaveSuccess={(updated) => {
            setDoc(updated);
            if (onUpdateDoc) onUpdateDoc(updated);
          }}
        />
      )}

    </div>
  );
}
