import React from 'react';
import { UploadCloud, ShieldCheck, Cpu, FileText, Activity, ArrowRight, HeartPulse } from 'lucide-react';
import { uiTranslations } from '../utils/translations';

export function LandingPage({ onGetStarted, onSeedDemo, lang = 'en' }) {
  const t = uiTranslations[lang] || uiTranslations.en;

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 flex flex-col justify-center">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1.5 rounded-full text-teal-400 text-xs font-semibold mb-6 shadow-sm">
          <HeartPulse className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>Altrix Labs AI Health Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          AI-Powered Personal <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Health Copilot
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          Transform complex medical records, prescriptions, diagnostic reports, lab test values, and discharge summaries into structured, plain-language health intelligence while maintaining complete medical safety.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-base"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload Medical Record</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>

          <button
            onClick={onSeedDemo}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-6 py-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-base"
          >
            <Activity className="w-5 h-5 text-teal-400" />
            <span>Explore Demo Data</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privacy Guaranteed: Local OCR & Groq AI processing with strict patient confidentiality controls.</span>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4 text-teal-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Medical OCR & Intelligence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Extract medicines, dosages, test values, reference ranges, dates, and diagnoses from PDF or image reports.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Plain-Language Summaries</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Understand abnormal test values and clinical findings with cautious, non-diagnostic AI explanations.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. ABDM / FHIR Data Model</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Unified health profile and timeline built on FHIR standards with mock ABHA ID integration.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
