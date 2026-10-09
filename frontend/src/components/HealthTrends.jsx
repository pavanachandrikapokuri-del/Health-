import React from 'react';
import { TrendingUp, Activity, AlertTriangle } from 'lucide-react';

export function HealthTrends({ labResults }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
          <TrendingUp className="w-8 h-8 text-teal-600" />
          <span>Health & Laboratory Parameter Trends</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Track changes in lab values (Hemoglobin, Vitamin D, Glucose) across historical reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Trend Card 1: Hemoglobin */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-base">Hemoglobin (Hb) Trend</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">10.2 g/dL (Low)</span>
          </div>

          <div className="h-40 bg-gray-50 rounded-2xl p-4 flex items-end justify-between border border-gray-100">
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-bold text-gray-400">Sep 15</span>
              <div className="w-10 bg-teal-300 rounded-t-lg h-24 flex items-center justify-center text-[10px] font-bold text-teal-900">11.8</div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-bold text-gray-400">Sep 28</span>
              <div className="w-10 bg-teal-400 rounded-t-lg h-20 flex items-center justify-center text-[10px] font-bold text-teal-900">10.9</div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-bold text-gray-400">Oct 08</span>
              <div className="w-10 bg-amber-500 rounded-t-lg h-16 flex items-center justify-center text-[10px] font-bold text-white">10.2</div>
            </div>
          </div>
          <p className="text-xs text-gray-500">Reference standard limit: 12.0 - 15.0 g/dL</p>
        </div>

        {/* Trend Card 2: Vitamin D */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-base">Vitamin D (25-OH) Trend</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">14.0 ng/mL (Low)</span>
          </div>

          <div className="h-40 bg-gray-50 rounded-2xl p-4 flex items-end justify-between border border-gray-100">
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-bold text-gray-400">Aug 10</span>
              <div className="w-10 bg-amber-400 rounded-t-lg h-12 flex items-center justify-center text-[10px] font-bold text-amber-950">12.0</div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-bold text-gray-400">Oct 08</span>
              <div className="w-10 bg-amber-500 rounded-t-lg h-16 flex items-center justify-center text-[10px] font-bold text-white">14.0</div>
            </div>
          </div>
          <p className="text-xs text-gray-500">Target optimal level: 30.0 - 100.0 ng/mL</p>
        </div>

      </div>
    </div>
  );
}
