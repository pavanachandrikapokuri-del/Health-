import React from 'react';
import { GitFork, Pill, Activity, Heart, FileText } from 'lucide-react';

export function KnowledgeGraph({ medications, labResults, diagnoses }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
          <GitFork className="w-8 h-8 text-teal-600" />
          <span>Medical Knowledge Graph</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Interconnected relationship map between medical records, active medications, lab findings, and clinical notes.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6 py-8">
          
          {/* Node 1: Patient Record */}
          <div className="bg-[#072D29] text-white p-5 rounded-2xl shadow-md border border-[#134E48] w-48 text-center">
            <Heart className="w-6 h-6 text-[#2DD4BF] mx-auto mb-2" />
            <h4 className="font-bold text-sm">Rahul Sharma</h4>
            <span className="text-[10px] text-teal-300">Central Health Entity</span>
          </div>

          {/* Connection Arrow */}
          <span className="text-gray-300 text-xl font-bold font-mono">⇄</span>

          {/* Node 2: Lab Results */}
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-5 rounded-2xl shadow-sm w-48 text-center">
            <Activity className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-sm">Lab Observations</h4>
            <p className="text-[11px] text-emerald-700 mt-1">Hemoglobin (10.2), Vitamin D (14.0)</p>
          </div>

          {/* Connection Arrow */}
          <span className="text-gray-300 text-xl font-bold font-mono">⇄</span>

          {/* Node 3: Prescriptions */}
          <div className="bg-teal-50 border border-teal-200 text-teal-950 p-5 rounded-2xl shadow-sm w-48 text-center">
            <Pill className="w-6 h-6 text-teal-600 mx-auto mb-2" />
            <h4 className="font-bold text-sm">Medications</h4>
            <p className="text-[11px] text-teal-700 mt-1">Metformin (500mg), Vitamin D3</p>
          </div>

        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Knowledge graph links clinical extractions directly to source PDF documents and FHIR standard resources.
        </div>
      </div>
    </div>
  );
}
