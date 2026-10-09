import React, { useState } from 'react';
import { ShieldCheck, User, Code, CheckCircle2, Link2, ExternalLink } from 'lucide-react';

export function AbhaModule({ abhaData }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('card');

  const profile = abhaData || {
    abha_id: '91-4820-1129-9384',
    name: 'Rahul Sharma',
    gender: 'Male',
    dob: '1992-06-15',
    mobile: '+91 9876543210',
    status: 'ABDM Verified (Mock)',
    fhir_resources: {
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "91-4820-1129-9384",
            name: [{ text: "Rahul Sharma" }],
            gender: "male",
            birthDate: "1992-06-15"
          }
        },
        {
          resource: {
            resourceType: "Observation",
            code: { text: "Hemoglobin [Mass/volume] in Blood" },
            valueQuantity: { value: 10.2, unit: "g/dL" },
            interpretation: [{ text: "Low" }]
          }
        }
      ]
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>ABDM / ABHA Health ID Readiness</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ayushman Bharat Digital Mission (ABDM) architecture integration & FHIR Resource Standard sandbox.
          </p>
        </div>

        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
          Demo / Mock Sandbox Mode
        </span>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('card')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'card' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mock ABHA ID Card
        </button>
        <button
          onClick={() => setActiveTab('fhir')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'fhir' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          FHIR Data Model (JSON)
        </button>
      </div>

      {/* Tab 1: Mock ABHA Card */}
      {activeTab === 'card' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
                🇮🇳
              </div>
              <div>
                <h3 className="font-bold text-white text-base">ABHA Health Card (Mock)</h3>
                <p className="text-xs text-slate-400">National Health Authority Sandbox</p>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold">
              {profile.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">ABHA Number</span>
              <p className="text-base font-mono font-extrabold text-teal-400">{profile.abha_id}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Full Name</span>
              <p className="text-sm font-bold text-white">{profile.name}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Gender / DOB</span>
              <p className="text-sm text-slate-200">{profile.gender} | {profile.dob}</p>
            </div>
            <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Mobile Link</span>
              <p className="text-sm font-mono text-slate-200">{profile.mobile}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">ABDM Health Information Exchange (HIE/CM) Simulator</span>
            <button
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Linked!' : 'Simulate ABHA Import'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Tab 2: FHIR Data Model JSON */}
      {activeTab === 'fhir' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>FHIR R4 Standard Healthcare Resource Payload</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">application/fhir+json</span>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-teal-300 overflow-x-auto max-h-96 leading-relaxed">
            {JSON.stringify(profile.fhir_resources, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
