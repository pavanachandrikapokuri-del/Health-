import React from 'react';
import { 
  FileText, 
  Pill, 
  AlertTriangle, 
  Bot, 
  UploadCloud, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  TrendingUp,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Activity,
  Layers
} from 'lucide-react';
import { uiTranslations } from '../utils/translations';

export function Dashboard({ 
  profileData, 
  documents = [], 
  medications = [], 
  labResults = [], 
  timeline = [], 
  copilotIntel,
  onNavigate, 
  onSeedDemo,
  onSelectDocument,
  lang = 'en' 
}) {
  const t = uiTranslations[lang] || uiTranslations.en;

  const docsCount = documents?.length || 0;
  const medsCount = medications?.length || 0;
  const abnormalCount = labResults?.filter(l => l.status && l.status !== 'Normal').length || 0;
  const testsCount = labResults?.length || 0;

  const intel = copilotIntel || {
    overall_summary: "Upload your medical records to generate AI Health Intelligence synthesis.",
    key_insights: [],
    abnormal_findings: [],
    multifactor_patterns: [],
    trends: [],
    medication_insights: [],
    questions_for_doctor: [
      "What could explain any abnormal test results?",
      "How should my medications be taken alongside my daily diet?",
      "Is follow-up laboratory testing recommended?"
    ],
    missing_information: [],
    verification_items: [],
    safety_note: "Altrix HealthCopilot provides informative analysis only and does not provide a medical diagnosis or treatment plan. Always consult a qualified healthcare professional."
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Health Copilot</h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Intelligence Active</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            From Medical Documents to Meaningful Decisions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onSeedDemo}
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-full border border-gray-300 shadow-sm text-xs transition-all flex items-center space-x-1.5"
          >
            <Bot className="w-4 h-4 text-teal-600" />
            <span>Load demo patient</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="bg-[#044E45] hover:bg-[#063C35] text-white font-bold px-5 py-2.5 rounded-full shadow-md text-xs transition-all flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Record</span>
          </button>
        </div>
      </div>

      {/* Safety Disclaimer Banner */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
        <div className="w-6 h-6 rounded-full bg-[#FEF3C7] border border-[#FCD34D] flex items-center justify-center text-[#B45309] font-bold text-xs flex-shrink-0 mt-0.5">
          !
        </div>
        <p className="text-xs text-[#92400E] leading-relaxed font-medium">
          {intel.safety_note || "Altrix HealthCopilot organizes and explains your medical records in simple language. It does not diagnose or prescribe. Always consult a qualified physician."}
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => onNavigate('documents')}
          className="bg-white border border-gray-200 rounded-3xl p-6 cursor-pointer hover:shadow-md transition-all flex items-center space-x-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{docsCount}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">Documents Analyzed</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('medications')}
          className="bg-white border border-gray-200 rounded-3xl p-6 cursor-pointer hover:shadow-md transition-all flex items-center space-x-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center flex-shrink-0">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{medsCount}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">Active Medications</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('lab-results')}
          className="bg-white border border-gray-200 rounded-3xl p-6 cursor-pointer hover:shadow-md transition-all flex items-center space-x-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <div className={`text-3xl font-extrabold ${abnormalCount > 0 ? 'text-[#DC2626]' : 'text-gray-900'}`}>{abnormalCount}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">Needs Attention</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('trends')}
          className="bg-white border border-gray-200 rounded-3xl p-6 cursor-pointer hover:shadow-md transition-all flex items-center space-x-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{intel.trends?.length || 0}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">Trends Tracked</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: AI HEALTH OVERVIEW */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 text-white rounded-3xl p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-6 h-6 text-teal-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">AI Health Overview</h2>
          </div>
          <span className="text-[11px] font-mono text-teal-300 bg-teal-950/80 border border-teal-800/80 px-3 py-1 rounded-full">
            Stage 2 Copilot Intelligence
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          {intel.overall_summary}
        </p>

        {/* Verification Warnings if low confidence */}
        {intel.verification_items?.length > 0 && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Verification Notice:</span>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                {intel.verification_items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MULTI-FACTOR REASONING / PATTERNS */}
      {intel.multifactor_patterns?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Multi-Factor Pattern Intelligence</span>
          </h3>

          <div className="space-y-4">
            {intel.multifactor_patterns.map((pat, idx) => (
              <div key={idx} className="bg-gradient-to-r from-indigo-50/90 to-blue-50/90 border border-indigo-200/80 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    <h4 className="font-bold text-indigo-950 text-base">{pat.pattern_name}</h4>
                  </div>
                  <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200">
                    Combined Findings
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {pat.findings_involved?.map((f, fidx) => (
                    <span key={fidx} className="bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs">
                      {f}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-indigo-950 leading-relaxed font-medium pt-1">
                  {pat.pattern_explanation}
                </p>

                <div className="bg-white/80 border border-indigo-200 p-3 rounded-xl text-[11px] text-indigo-900 italic">
                  <strong>Clinical Caution:</strong> {pat.clinical_caution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: PRIORITIZED ABNORMAL FINDINGS ("WHAT THIS MEANS") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>What Needs Attention & Priority Findings</span>
          </h3>
          <button
            onClick={() => onNavigate('lab-results')}
            className="text-xs text-teal-700 font-semibold hover:underline flex items-center"
          >
            <span>View All Lab Tests</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {intel.abnormal_findings?.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 text-center text-xs text-gray-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No abnormal findings detected across your uploaded reports.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {intel.abnormal_findings.map((abn, idx) => {
              const isHigh = abn.severity === 'high';
              return (
                <div 
                  key={idx} 
                  className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 transition-all hover:shadow-md ${
                    isHigh ? 'border-red-300 bg-red-50/20' : 'border-amber-300 bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-gray-900 text-base">{abn.test_name}</span>
                      <p className="text-xs font-mono font-semibold text-gray-700 mt-0.5">
                        Reported Value: {abn.what_report_says} | Ref: {abn.reference_range}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
                      isHigh ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <span>{isHigh ? '🔴 High Attention' : '🟡 Moderate Attention'}</span>
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-800 pt-1">
                    <div>
                      <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wider block text-teal-800">What this means</span>
                      <p className="mt-0.5 leading-relaxed">{abn.what_this_means}</p>
                    </div>

                    <div>
                      <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wider block text-amber-800">Why it can matter</span>
                      <p className="mt-0.5 leading-relaxed">{abn.why_it_can_matter}</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200/80 p-3 rounded-xl text-[11px] text-gray-600">
                      <strong>What this does NOT mean:</strong> {abn.what_this_does_not_mean}
                    </div>

                    <div className="bg-teal-50/80 border border-teal-200 p-3 rounded-xl text-[11px] text-teal-900 font-medium">
                      <strong>What to discuss:</strong> {abn.what_to_discuss}
                    </div>
                  </div>

                  {abn.source_document_id && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-mono">Source: {abn.source_filename || 'Uploaded Document'}</span>
                      {onSelectDocument && (
                        <button
                          onClick={() => onSelectDocument(parseInt(abn.source_document_id))}
                          className="text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-1"
                        >
                          <span>View Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: HISTORICAL TRENDS */}
      {intel.trends?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>What Changed & Historical Trends</span>
            </h3>
            <button
              onClick={() => onNavigate('trends')}
              className="text-xs text-teal-700 font-semibold hover:underline flex items-center"
            >
              <span>View Full Charts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {intel.trends.map((tr, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 text-base">{tr.test_name} Trend</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
                    tr.direction === 'improving' ? 'bg-emerald-100 text-emerald-800' :
                    tr.direction === 'decreasing' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <span>{tr.direction === 'improving' ? '↑ Improving' : tr.direction === 'decreasing' ? '↓ Decreasing' : '→ Stable'}</span>
                    <span className="font-mono ml-1">({tr.change})</span>
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200/80 p-3 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">Test Date History</div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {tr.history_points?.map((hp, hidx) => (
                      <div key={hidx} className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-mono">
                        <span className="text-gray-400 mr-1">{hp.date}:</span>
                        <span className="font-bold text-gray-900">{hp.value} {hp.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed pt-1">
                  {tr.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: MEDICATIONS & DOCTOR QUESTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Your Medications with Copilot Interpretations */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center space-x-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              <span>Prescriptions & Copilot Interpretation</span>
            </h3>
            <span className="text-xs font-semibold text-gray-500">{medsCount} Listed</span>
          </div>

          {intel.medication_insights?.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No prescribed medications recorded.</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {intel.medication_insights.map((med, idx) => (
                <div key={idx} className="bg-gray-50/90 border border-gray-200/80 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{med.medicine_name}</span>
                    <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {med.strength || 'Standard Dose'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-3">
                    <span>Schedule: <strong className="text-gray-800">{med.schedule}</strong></span>
                    <span>Instruction: <strong className="text-gray-800">{med.instruction}</strong></span>
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-xl text-xs text-gray-700 mt-2 leading-relaxed">
                    <strong className="text-teal-800 block text-[11px] uppercase tracking-wide">Copilot interpretation:</strong>
                    {med.copilot_interpretation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Questions to Discuss with Your Doctor */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>Questions to Discuss with Your Doctor</span>
            </h3>
            <button
              onClick={() => onNavigate('doctor-prep')}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center"
            >
              <span>Visit Prep Sheet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {intel.questions_for_doctor?.map((q, idx) => (
              <div key={idx} className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-2xl flex items-start space-x-3 text-xs text-indigo-950">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="font-medium leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 6: RECENT UPLOADED RECORDS */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-gray-900 text-base flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Source Documents & Uploaded Records ({docsCount})</span>
          </h3>
          <button
            onClick={() => onNavigate('documents')}
            className="text-xs text-teal-700 font-semibold hover:underline flex items-center"
          >
            <span>Manage All Documents</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {docsCount === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.slice(0, 6).map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                className="bg-gray-50 border border-gray-200/80 p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full uppercase">
                    {doc.document_type || 'Record'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 text-xs truncate">{doc.original_filename}</h4>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200/60">
                  <span className="text-gray-500">Extraction Confidence</span>
                  <span className="font-mono font-bold text-teal-700">{Math.round((doc.confidence || 0.88) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
