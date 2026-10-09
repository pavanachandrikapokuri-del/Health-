import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentsList } from './components/DocumentsList';
import { DocumentDetails } from './components/DocumentDetails';
import { MedicationsView } from './components/MedicationsView';
import { LabResultsView } from './components/LabResultsView';
import { TimelineView } from './components/TimelineView';
import { AbhaModule } from './components/AbhaModule';
import { HealthProfile } from './components/HealthProfile';
import { HealthTrends } from './components/HealthTrends';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { AICopilotChat } from './components/AICopilotChat';
import { DoctorVisitPrep } from './components/DoctorVisitPrep';
import { PrivacySafety } from './components/PrivacySafety';
import { AuthModal } from './components/AuthModal';

import { 
  getDocuments, 
  getHealthProfile, 
  getMedications, 
  getLabResults, 
  getDiagnoses, 
  getTimeline, 
  getAbhaProfile, 
  seedDemoData, 
  getDocumentById,
  resetAllData,
  getCopilotIntelligence
} from './services/api';

export default function App() {
  const [lang, setLang] = useState('en');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // User Auth State - Nullable until explicitly logged in
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('altrix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(!currentUser);

  // App Data States (Filtered per logged in user)
  const [documents, setDocuments] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [medications, setMedications] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [abhaData, setAbhaData] = useState(null);
  const [copilotIntel, setCopilotIntel] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Load user-specific health data from backend API
  const refreshAllData = async (user = currentUser) => {
    if (!user || !user.id) {
      setDocuments([]);
      setProfileData(null);
      setMedications([]);
      setLabResults([]);
      setDiagnoses([]);
      setTimeline([]);
      setAbhaData(null);
      setCopilotIntel(null);
      return;
    }

    try {
      setLoading(true);
      const userId = user.id;
      const [docs, profile, meds, labs, diags, tl, abha, intel] = await Promise.all([
        getDocuments(userId).catch(() => []),
        getHealthProfile(userId).catch(() => null),
        getMedications(userId).catch(() => []),
        getLabResults(userId).catch(() => []),
        getDiagnoses(userId).catch(() => []),
        getTimeline(userId).catch(() => []),
        getAbhaProfile(userId).catch(() => null),
        getCopilotIntelligence(userId).catch(() => null)
      ]);

      setDocuments(docs);
      setProfileData(profile);
      setMedications(meds);
      setLabResults(labs);
      setDiagnoses(diags);
      setTimeline(tl);
      setAbhaData(abha);
      setCopilotIntel(intel);
    } catch (err) {
      console.error('[App] Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshAllData(currentUser);
    } else {
      setShowAuthModal(true);
    }
  }, [currentUser?.id]);

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('altrix_user', JSON.stringify(userObj));
    setShowAuthModal(false);
    refreshAllData(userObj);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('altrix_user');
    setDocuments([]);
    setProfileData(null);
    setMedications([]);
    setLabResults([]);
    setDiagnoses([]);
    setTimeline([]);
    setAbhaData(null);
    setShowAuthModal(true);
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to delete all uploaded records and reset the system to a clean state?')) {
      return;
    }

    try {
      setLoading(true);
      await resetAllData();
      await refreshAllData(currentUser);
      setCurrentView('dashboard');
      alert('All database records have been deleted. System is now clean.');
    } catch (err) {
      alert('Failed to reset data');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setLoadingDemo(true);
      await seedDemoData();
      await refreshAllData(currentUser);
      setCurrentView('dashboard');
    } catch (err) {
      alert('Failed to seed demo data. Please check backend connection.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleSelectDocument = async (docId) => {
    try {
      setLoading(true);
      setSelectedDocId(docId);
      const doc = await getDocumentById(docId);
      setSelectedDoc(doc);
      setCurrentView('document-details');
    } catch (err) {
      alert('Failed to load document details');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (newDoc) => {
    await refreshAllData(currentUser);
    if (newDoc && newDoc.id) {
      handleSelectDocument(newDoc.id);
    } else {
      setCurrentView('documents');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF7] text-gray-900 flex flex-col font-sans antialiased">
      
      {/* Top Header */}
      <Navbar
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onResetData={handleResetData}
      />

      <div className="flex flex-1 min-h-[calc(100vh-3.5rem)]">
        
        {/* Dark Forest Green Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          lang={lang}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#FBFBF7]">
          
          {currentView === 'dashboard' && (
            <Dashboard
              profileData={profileData}
              documents={documents}
              medications={medications}
              labResults={labResults}
              timeline={timeline}
              copilotIntel={copilotIntel}
              onNavigate={setCurrentView}
              onSeedDemo={handleSeedDemo}
              onSelectDocument={handleSelectDocument}
              lang={lang}
            />
          )}

          {currentView === 'upload' && (
            <DocumentUpload
              currentUser={currentUser}
              onUploadSuccess={handleUploadSuccess}
              lang={lang}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsList
              documents={documents}
              onSelectDocument={handleSelectDocument}
              onNavigateUpload={() => setCurrentView('upload')}
            />
          )}

          {currentView === 'document-details' && selectedDoc && (
            <DocumentDetails
              doc={selectedDoc}
              onBack={() => setCurrentView('documents')}
              onUpdateDoc={(updated) => {
                setSelectedDoc(updated);
                refreshAllData(currentUser);
              }}
              lang={lang}
            />
          )}

          {currentView === 'summary' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-3xl font-extrabold text-gray-900">Health Summaries</h1>
              {documents.length === 0 ? (
                <div className="bg-white border border-gray-200 p-8 rounded-3xl text-center text-gray-400 text-xs">
                  No medical summaries generated yet. Upload a document or click "Load demo patient" on the Dashboard.
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map(doc => (
                    <div key={doc.id} onClick={() => handleSelectDocument(doc.id)} className="bg-white border border-gray-200 p-5 rounded-3xl cursor-pointer hover:shadow-md transition-all">
                      <h3 className="font-bold text-gray-900">{doc.original_filename}</h3>
                      <p className="text-xs text-gray-500 mt-1">{doc.summary?.document_contains || 'Medical report processed.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'medications' && (
            <MedicationsView medications={medications} />
          )}

          {currentView === 'lab-results' && (
            <LabResultsView labResults={labResults} />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              timeline={timeline}
              onSelectDocument={handleSelectDocument}
            />
          )}

          {currentView === 'trends' && (
            <HealthTrends labResults={labResults} />
          )}

          {currentView === 'knowledge-graph' && (
            <KnowledgeGraph medications={medications} labResults={labResults} diagnoses={diagnoses} />
          )}

          {currentView === 'ai-copilot' && (
            <AICopilotChat />
          )}

          {currentView === 'doctor-prep' && (
            <DoctorVisitPrep labResults={labResults} medications={medications} />
          )}

          {currentView === 'profile' && (
            <HealthProfile
              profileData={profileData}
              documents={documents}
              medications={medications}
              labResults={labResults}
              diagnoses={diagnoses}
            />
          )}

          {currentView === 'privacy' && (
            <PrivacySafety />
          )}

          {currentView === 'abha' && (
            <AbhaModule abhaData={abhaData} />
          )}

        </main>
      </div>

      {/* User Login & Credentials Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          if (currentUser) {
            setShowAuthModal(false);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

    </div>
  );
}
