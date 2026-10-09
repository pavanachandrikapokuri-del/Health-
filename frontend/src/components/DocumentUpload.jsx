import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { uploadDocument, processDocument } from '../services/api';
import { uiTranslations } from '../utils/translations';

export function DocumentUpload({ currentUser, onUploadSuccess, lang = 'en' }) {
  const t = uiTranslations[lang] || uiTranslations.en;

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingState, setProcessingState] = useState(null); // Uploaded, Processing, OCR Completed, AI Analysis, Completed, Failed
  const [errorMsg, setErrorMsg] = useState(null);
  const [createdDoc, setCreatedDoc] = useState(null);

  const fileInputRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg(null);
    if (!selectedFile) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png'];

    if (!allowed.includes(selectedFile.type) && !validExts.includes(ext)) {
      setErrorMsg('Invalid file format. Please upload a PDF, JPG, JPEG, or PNG document.');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB limit. Please upload a smaller file.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg(null);
      setProcessingState('Uploaded');

      // Step 1: Upload
      const uploadedDoc = await uploadDocument(file, currentUser?.id);
      setCreatedDoc(uploadedDoc);

      // Step 2: OCR & Processing
      setProcessingState('Processing');
      await new Promise(r => setTimeout(r, 600));

      setProcessingState('OCR Completed');
      await new Promise(r => setTimeout(r, 600));

      setProcessingState('AI Analysis');
      const processedDoc = await processDocument(uploadedDoc.id);

      setProcessingState('Completed');
      setCreatedDoc(processedDoc);

      if (onUploadSuccess) {
        try {
          await onUploadSuccess(processedDoc);
        } catch (succErr) {
          console.error('[DocumentUpload] Error during post-upload refresh:', succErr);
        }
      }
    } catch (err) {
      console.error('[DocumentUpload] Upload/Process error:', err);
      setProcessingState('Failed');
      setErrorMsg(err.message || 'Failed to process medical document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Upload Medical Record</h2>
        <p className="text-sm text-slate-400">
          Upload prescriptions, lab reports, discharge summaries, or diagnostic records (PDF, PNG, JPG up to 15MB).
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-teal-400 bg-teal-500/10 scale-[1.01]' 
            : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {file ? file.name : 'Click to upload or drag & drop file'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {file 
            ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB | Type: ${file.type || 'Document'}` 
            : 'Supports PDF reports, scanned receipts, digital prescriptions & lab tests'}
        </p>
      </div>

      {/* Upload Action Button */}
      {file && !processingState && (
        <div className="flex justify-end">
          <button
            onClick={handleUploadAndProcess}
            disabled={uploading}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze & Extract Intelligence</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* Multi-Step Pipeline State Monitor */}
      {processingState && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Document Processing Pipeline</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            
            {/* Step 1: Uploaded */}
            <div className={`p-3 rounded-xl border text-xs ${
              ['Uploaded', 'Processing', 'OCR Completed', 'AI Analysis', 'Completed', 'Review Required'].includes(processingState)
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center space-x-2 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Uploaded</span>
              </div>
              <p className="text-[10px] opacity-80">File saved to storage</p>
            </div>

            {/* Step 2: OCR Extraction */}
            <div className={`p-3 rounded-xl border text-xs ${
              ['OCR Completed', 'AI Analysis', 'Completed', 'Review Required'].includes(processingState)
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                : processingState === 'Processing'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center space-x-2 font-semibold mb-1">
                {processingState === 'Processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>2. OCR Layer</span>
              </div>
              <p className="text-[10px] opacity-80">Extracted document text</p>
            </div>

            {/* Step 3: Groq AI Analysis */}
            <div className={`p-3 rounded-xl border text-xs ${
              ['Completed', 'Review Required'].includes(processingState)
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                : processingState === 'AI Analysis'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center space-x-2 font-semibold mb-1">
                {processingState === 'AI Analysis' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>3. Groq AI</span>
              </div>
              <p className="text-[10px] opacity-80">Entity & JSON extraction</p>
            </div>

            {/* Step 4: Verification / Complete */}
            <div className={`p-3 rounded-xl border text-xs ${
              ['Completed', 'Review Required'].includes(processingState)
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                : processingState === 'Failed'
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center space-x-2 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>4. Completed</span>
              </div>
              <p className="text-[10px] opacity-80">Ready for viewing</p>
            </div>

          </div>

          {['Completed', 'Review Required'].includes(processingState) && createdDoc && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-emerald-300 text-sm">Processing Completed!</p>
                <p className="text-xs text-slate-300 mt-0.5">Extracted medications, test values, diagnoses and health summary.</p>
              </div>
              <button
                onClick={() => onUploadSuccess(createdDoc)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
              >
                View Extracted Details & Review
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
