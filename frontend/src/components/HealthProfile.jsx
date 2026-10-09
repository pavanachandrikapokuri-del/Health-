import React from 'react';
import { User, ShieldCheck, Mail, Calendar, Heart, FileText, Pill, Activity, AlertCircle } from 'lucide-react';

export function HealthProfile({ profileData, documents, medications, labResults, diagnoses }) {
  const user = profileData?.user || {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@altrixlabs.ai',
    abha_id: '91-4820-1129-9384',
    blood_group: 'O+',
    dob: '1992-06-15',
    gender: 'Male'
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-extrabold text-slate-950 text-3xl shadow-lg">
          {user.name.charAt(0)}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              Unified Profile
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start space-x-2">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>{user.email}</span>
            <span>•</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono">{user.abha_id}</span>
          </p>
        </div>
      </div>

      {/* Demographics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Blood Group</span>
          <span className="text-xl font-bold text-red-400">{user.blood_group}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Date of Birth</span>
          <span className="text-sm font-bold text-white">{user.dob}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Gender</span>
          <span className="text-sm font-bold text-white">{user.gender}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Documents Analyzed</span>
          <span className="text-xl font-bold text-teal-400">{documents?.length || 0}</span>
        </div>
      </div>

      {/* Diagnoses Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-400" />
          <span>Recorded Clinical Diagnoses ({diagnoses?.length || 0})</span>
        </h3>

        {(!diagnoses || diagnoses.length === 0) ? (
          <p className="text-xs text-slate-400">No explicit diagnoses recorded from source documents.</p>
        ) : (
          <div className="space-y-2">
            {diagnoses.map((diag, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-white">{diag.diagnosis_name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{diag.diagnosis_date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
