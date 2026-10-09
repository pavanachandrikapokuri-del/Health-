import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react';

export function AICopilotChat({ lang = 'en' }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: lang === 'te'
        ? 'నమస్కారం! నేను మీ ఆల్ట్రిక్స్ AI హెల్త్ కోపైలట్. మీరు నాతో తెలుగు లేదా ఇంగ్లీషులో మాట్లాడవచ్చు! మీ ల్యాబ్ ఫలితాలు మరియు మందుల గురించి నన్ను అడగండి.'
        : 'Hello! I am your Altrix AI Health Copilot. You can talk to me via Chat or Voice in English or Telugu! Ask me anything about your uploaded medical records, prescriptions, or lab results.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const recognitionRef = useRef(null);

  // Stop voice synthesis
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIdx(null);
  };

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'te' ? 'te-IN' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('[SpeechRecognition] Error:', event.error);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser. Please try Google Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speakText = (text, idx = null) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    if (speakingIdx === idx) {
      setSpeakingIdx(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-US';
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API_BASE_URL}/api/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, lang })
      });
      const data = await res.json();
      const aiReply = data.reply || (lang === 'te' ? 'AI సమాధానం స్వీకరించబడింది.' : 'AI Copilot response received.');
      
      setMessages(prev => {
        const next = [...prev, { sender: 'bot', text: aiReply }];
        if (autoSpeak) {
          speakText(aiReply, next.length - 1);
        }
        return next;
      });
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: lang === 'te'
          ? 'క్షమించండి, సర్వర్ కనెక్షన్‌లో లోపం ఏర్పడింది.'
          : 'Failed to connect to the backend AI service. Please verify server status.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = lang === 'te' ? [
    "నా హేమోగ్లోబిన్ తక్కువగా ఉండటానికి కారణం ఏమిటి?",
    "మెట్‌ఫార్మిన్ మందు ఎలా వాడాలి?",
    "నా చివరి ల్యాబ్ ఫలితాల సారాంశం చెప్పండి",
    "నా డాక్టర్‌ను అడగవలసిన ప్రశ్నలు ఏవి?"
  ] : [
    "Explain my low Hemoglobin level in simple terms",
    "What are the dosage instructions for Metformin?",
    "Summarize my latest lab report findings",
    "What follow-up questions should I ask my doctor?"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Bot className="w-8 h-8 text-teal-400" />
            <span>{lang === 'te' ? 'AI ఆరోగ్య కోపైలట్ (వాయిస్ & చాట్)' : 'AI Health Copilot (Voice & Chat)'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {lang === 'te' 
              ? 'మీ వైద్య రికార్డులను విశ్లేషించే తెలుగు & ఇంగ్లీష్ AI వాయిస్ అసిస్టెంట్.'
              : 'Interactive voice & text assistant powered by Groq LLM analyzing your medical records.'}
          </p>
        </div>

        {/* Voice Controls: Auto-Read Toggle + Stop Reading Button */}
        <div className="flex items-center space-x-2">
          {speakingIdx !== null && (
            <button
              onClick={stopSpeaking}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold shadow-lg animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'te' ? 'చదవడం ఆపండి (Stop)' : 'Stop AI Reading'}</span>
            </button>
          )}

          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              autoSpeak 
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{autoSpeak ? (lang === 'te' ? 'వాయిస్ సదుపాయం: ఆన్' : 'Voice: ON') : (lang === 'te' ? 'వాయిస్ సదుపాయం: ఆఫ్' : 'Voice: OFF')}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(prompt);
            }}
            className="text-xs bg-slate-900 border border-slate-800 hover:border-teal-500 hover:text-teal-300 text-slate-300 px-3 py-1.5 rounded-full font-medium shadow-sm transition-all text-left"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Main Chat Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl h-[520px] flex flex-col shadow-sm overflow-hidden">
        
        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800 text-teal-400 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="relative group max-w-[80%]">
                <div
                  className={`p-4 rounded-3xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none font-medium'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Read Aloud / Stop Buttons for Bot Messages */}
                {msg.sender === 'bot' && (
                  <div className="mt-1 flex items-center space-x-3">
                    <button
                      onClick={() => speakText(msg.text, idx)}
                      className="text-[11px] text-teal-400 font-semibold hover:underline flex items-center space-x-1"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${speakingIdx === idx ? 'animate-bounce text-emerald-400' : ''}`} />
                      <span>{speakingIdx === idx ? (lang === 'te' ? 'చదువుతోంది...' : 'Speaking...') : (lang === 'te' ? 'బిగ్గరగా చదవండి' : 'Read Aloud')}</span>
                    </button>

                    {speakingIdx === idx && (
                      <button
                        onClick={stopSpeaking}
                        className="text-[11px] text-red-400 font-bold hover:underline flex items-center space-x-1"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>{lang === 'te' ? 'ఆపండి' : 'Stop Voice'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
              <span>{lang === 'te' ? 'ఆల్ట్రిక్స్ కోపైలట్ విశ్లేషిస్తోంది...' : 'Altrix Copilot is analyzing your records...'}</span>
            </div>
          )}

          {isListening && (
            <div className="flex items-center space-x-2 text-xs text-teal-300 font-bold bg-teal-500/10 p-3 rounded-2xl border border-teal-500/30 animate-pulse">
              <Mic className="w-4 h-4 text-teal-400" />
              <span>{lang === 'te' ? 'మీ వాయిస్ వింటోంది... మాట్లాడండి!' : 'Listening to your voice... Speak your question now!'}</span>
            </div>
          )}
        </div>

        {/* Input Form with Voice & Send Buttons */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-3">
          
          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-full shadow-md transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-ping' 
                : 'bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak Question by Voice'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === 'te' ? 'ప్రశ్నను టైప్ చేయండి లేదా మైక్ నొక్కండి...' : 'Type or click microphone to speak your question...'}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-inner font-medium"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 p-3 rounded-full shadow-md disabled:opacity-50 transition-all font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
