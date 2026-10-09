import React from 'react';
import { Stethoscope, CheckCircle2, FileText, HelpCircle } from 'lucide-react';

export function DoctorVisitPrep({ labResults, medications }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
          <Stethoscope className="w-8 h-8 text-teal-600" />
          <span>Doctor Visit Preparation Summary</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          AI-generated summary sheet to share with your physician during upcoming clinical consultations.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Clinical Visit Readiness Sheet</h3>
            <p className="text-xs text-gray-500">Patient: Rahul Sharma | Generated on: Oct 08, 2026</p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-full border border-gray-300"
          >
            Print / Save Summary
          </button>
        </div>

        <div className="space-y-4 text-xs text-gray-700">
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-2">Key Topics for Discussion</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Low Hemoglobin (10.2 g/dL) detected in recent Complete Blood Count report.</li>
              <li>Vitamin D (25-OH) concentration is 14.0 ng/mL (Below reference range 30-100 ng/mL).</li>
              <li>Review active prescription for Metformin 500mg and weekly Vitamin D3.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-2">Suggested Questions to Ask Your Doctor</h4>
            <div className="bg-teal-50/60 border border-teal-200/70 p-4 rounded-2xl space-y-2 text-teal-950 font-medium">
              <p>1. What clinical factors might be contributing to my low hemoglobin levels?</p>
              <p>2. Are dietary changes or specific iron supplements recommended alongside Vitamin D3?</p>
              <p>3. When should I repeat blood testing to monitor my hemoglobin and vitamin levels?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
