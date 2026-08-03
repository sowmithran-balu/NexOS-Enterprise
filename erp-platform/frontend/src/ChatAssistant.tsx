import React, { useState, useEffect, useRef } from 'react';

interface ChatAssistantProps {
  token: string | null;
  activeTab: string;
  voiceTriggerCount?: number;
  onVoiceListeningChange?: (listening: boolean) => void;
}

interface Conversation {
  id: number;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function ChatAssistant({ token, activeTab, voiceTriggerCount = 0, onVoiceListeningChange }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Secure Server Settings States
  const [activeAiProvider, setActiveAiProvider] = useState('local');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const [openrouterModel, setOpenrouterModel] = useState('google/gemini-2.5-flash');

  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  // Voice States
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const handleSendMessageRef = useRef<any>(null);

  const voiceActiveRef = useRef(isVoiceActive);
  useEffect(() => {
    voiceActiveRef.current = isVoiceActive;
  }, [isVoiceActive]);

  useEffect(() => {
    if (voiceTriggerCount > 0) {
      setIsOpen(true);
      if (!isVoiceActive) {
        setIsVoiceActive(true);
        speakResponse("Voice Assistant Activated. How can I help you?");
      } else {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {}
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }, 100);
        }
      }
    }
  }, [voiceTriggerCount]);

  useEffect(() => {
    if (onVoiceListeningChange) {
      onVoiceListeningChange(isListening || isSpeaking);
    }
  }, [isListening, isSpeaking, onVoiceListeningChange]);

  // Fetch secure settings from backend
  const fetchSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/chat/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAiProvider(data.activeAiProvider || 'local');
        setGeminiApiKey(data.geminiApiKey || '');
        setOpenrouterApiKey(data.openrouterApiKey || '');
        setOpenrouterModel(data.openrouterModel || 'google/gemini-2.5-flash');
      }
    } catch (e) {
      console.error('Error fetching settings', e);
    }
  };

  const handleSaveSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/chat/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activeAiProvider,
          geminiApiKey,
          openrouterApiKey,
          openrouterModel
        })
      });
      if (res.ok) {
        setShowSettings(false);
        fetchSettings();
      }
    } catch (e) {
      console.error('Error saving settings', e);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && activeConvId === null) {
          setActiveConvId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching conversations', e);
    }
  };

  // Fetch messages
  const fetchMessages = async (convId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/chat/conversations/${convId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Error fetching messages', e);
    }
  };

  useEffect(() => {
    if (token && isOpen) {
      fetchConversations();
      fetchSettings();
    }
  }, [token, isOpen]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        if (handleSendMessageRef.current) {
          handleSendMessageRef.current(text);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [activeConvId, activeTab]);

  // Siri-Style Voice Wave Animation
  useEffect(() => {
    if ((isListening || isSpeaking) && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let waveOffset = 0;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;

        const drawWave = (color: string, amplitude: number, frequency: number, offsetSpeed: number, opacity: number) => {
          ctx.strokeStyle = color;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let x = 0; x < width; x++) {
            const angle = x * frequency + waveOffset * offsetSpeed;
            const edgeDamping = Math.sin((x / width) * Math.PI);
            const y = midY + Math.sin(angle) * amplitude * edgeDamping;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        };

        const maxAmplitude = isSpeaking ? 14 : 7;

        drawWave('#3B82F6', maxAmplitude, 0.025, 0.8, 0.7);
        drawWave('#10B981', maxAmplitude * 0.7, 0.035, -1.2, 0.5);
        drawWave('#8B5CF6', maxAmplitude * 0.5, 0.015, 0.5, 0.4);

        waveOffset += 0.1;
        animationFrameIdRef.current = requestAnimationFrame(render);
      };
      render();
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isListening, isSpeaking]);

  const handleStartNewChat = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: `Analysis ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` })
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations(prev => [newConv, ...prev]);
        setActiveConvId(newConv.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const finalMsg = (textToSend || inputText).trim();
    if (!finalMsg || !token) return;

    let convId = activeConvId;
    if (!convId) {
      try {
        const res = await fetch('http://localhost:8080/api/chat/conversations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: finalMsg.substring(0, 25) })
        });
        if (res.ok) {
          const newConv = await res.json();
          setConversations(prev => [newConv, ...prev]);
          convId = newConv.id;
          setActiveConvId(newConv.id);
        } else {
          return;
        }
      } catch (e) {
        console.error(e);
        return;
      }
    }

    const tempUserMsg: Message = {
      id: Date.now(),
      conversationId: convId!,
      role: 'user',
      content: finalMsg,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInputText('');
    setIsLoading(true);

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const res = await fetch(`http://localhost:8080/api/chat/conversations/${convId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: finalMsg,
          activeTab: activeTab
        })
      });

      if (res.ok) {
        const assistantMsg = await res.json();
        setMessages(prev => [...prev, assistantMsg]);

        if (isVoiceActive) {
          speakResponse(assistantMsg.content);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  handleSendMessageRef.current = handleSendMessage;

  const speakResponse = (text: string) =>  {
    const cleanedText = text
      .replace(/\|/g, ' ')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`[^`]+`/g, ' ')
      .substring(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (voiceActiveRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('SpeechRecognition auto-start warning:', e);
        }
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (voiceActiveRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('SpeechRecognition auto-start error warning:', e);
        }
      }
    };

    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
    if (premiumVoice) utterance.voice = premiumVoice;

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceMode = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (recognitionRef.current) recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setIsVoiceActive(true);
      speakResponse("Voice Assistant Activated. How can I help you?");
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleTogglePin = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/chat/conversations/${id}/pin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConv = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConvId === id) {
          setActiveConvId(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartRename = (id: number, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(id);
    setEditTitleText(currentTitle);
  };

  const handleSaveRename = async (id: number) => {
    if (!token || !editTitleText.trim()) return;
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitleText } : c));
    setEditingConvId(null);
  };

  // Simple custom Markdown / Table renderer
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '--' || line === '---' || line === '- --' || line === '* --' || line === '• --') {
        continue;
      }

      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        if (line.replace(/[\s|-|:|]/g, '').length === 0) {
          continue;
        }

        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          tableRows = [];
        } else {
          tableRows.push(cells);
        }
        continue;
      }

      if (inTable && (!line.startsWith('|') || !line.endsWith('|'))) {
        inTable = false;
        elements.push(
          <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '14px 0', border: '1px solid var(--border-primary)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '450px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(180deg, var(--bg-sidebar) 0%, rgba(15,21,36,0.9) 100%)', borderBottom: '2px solid var(--border-primary)' }}>
                  {tableHeaders.map((h, hIdx) => (
                    <th key={hIdx} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>{h.replace(/\*\*/g, '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-primary)', background: rIdx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent', transition: 'background 0.2s' }}>
                    {row.map((cell, cIdx) => {
                      let cellContent: React.ReactNode = cell;
                      if (cell.includes('🟢')) cellContent = <span style={{ color: 'var(--success-text)', fontWeight: '600' }}>{cell}</span>;
                      else if (cell.includes('🔴')) cellContent = <span style={{ color: 'var(--danger-text)', fontWeight: '600' }}>{cell}</span>;
                      else if (cell.startsWith('**')) cellContent = <strong>{cell.replace(/\*\*/g, '')}</strong>;
                      return <td key={cIdx} style={{ padding: '12px 14px', color: 'var(--text-primary)', verticalAlign: 'middle' }}>{cellContent}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      if (line.startsWith('###')) {
        elements.push(<h4 key={i} style={{ marginTop: '18px', marginBottom: '8px', color: 'var(--info-text)', fontWeight: '600', fontSize: '1rem', borderBottom: '1px dashed var(--border-primary)', paddingBottom: '4px' }}>{line.replace('###', '').trim()}</h4>);
      } else if (line.startsWith('####')) {
        elements.push(<h5 key={i} style={{ marginTop: '14px', marginBottom: '6px', fontWeight: '600', color: 'var(--text-primary)' }}>{line.replace('####', '').trim()}</h5>);
      } else if (line.startsWith('-') || line.startsWith('*')) {
        const bulletText = line.substring(1).trim().replace(/\*\*/g, '');
        if (bulletText.length > 0) {
          elements.push(<li key={i} style={{ marginLeft: '16px', marginBottom: '6px', fontSize: '0.88rem', color: 'var(--text-primary)', listStyleType: 'square' }}>{bulletText}</li>);
        }
      } else if (line.trim().length > 0) {
        const parts = line.split('**');
        const formattedLine = parts.map((part, index) => index % 2 === 1 ? <strong key={index} style={{ color: 'var(--info-text)' }}>{part}</strong> : part);
        elements.push(<p key={i} style={{ marginBottom: '10px', fontSize: '0.88rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>{formattedLine}</p>);
      }
    }

    if (inTable) {
      elements.push(
        <div key="table-end" style={{ overflowX: 'auto', margin: '14px 0', border: '1px solid var(--border-primary)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '450px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(180deg, var(--bg-sidebar) 0%, rgba(15,21,36,0.9) 100%)', borderBottom: '2px solid var(--border-primary)' }}>
                {tableHeaders.map((h, hIdx) => (
                  <th key={hIdx} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>{h.replace(/\*\*/g, '')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-primary)', background: rIdx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent', transition: 'background 0.2s' }}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>{cell.replace(/\*\*/g, '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  const handleChipClick = (query: string) => {
    setInputText(query);
    handleSendMessage(query);
  };

  if (!token) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          backgroundColor: isOpen ? 'var(--danger)' : 'var(--info)',
          color: 'white',
          border: 'none',
          boxShadow: isOpen ? '0 8px 30px rgba(239, 68, 68, 0.4)' : '0 8px 30px rgba(59, 130, 246, 0.4)',
          cursor: 'pointer',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          outline: 'none',
        }}
        className="fab-pulse"
      >
        {isOpen ? (
          <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        ) : (
          <svg fill="none" height="26" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="26" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Main Glassmorphic Panel */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          bottom: '100px',
          right: isOpen ? '24px' : '-800px',
          width: isHistoryOpen ? '710px' : '460px',
          background: 'rgba(11, 18, 32, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg), var(--glow-shadow)',
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(11, 18, 32, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isVoiceActive ? 'var(--success)' : 'var(--info-text)',
                boxShadow: isVoiceActive ? '0 0 12px var(--success)' : '0 0 8px var(--info-text)',
                transition: 'all 0.3s',
              }}
            />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.01em', background: 'linear-gradient(90deg, #fff 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ERP Copilot
            </h3>
            <span className="badge badge-success" style={{ fontSize: '0.65rem', marginLeft: '6px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              {activeTab.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title="Toggle History Sidebar"
              style={{
                background: isHistoryOpen ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: '1px solid ' + (isHistoryOpen ? 'rgba(59, 130, 246, 0.3)' : 'transparent'),
                color: isHistoryOpen ? 'var(--info-text)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                transition: 'all 0.2s',
              }}
            >
              📂 History
            </button>
            <button
              onClick={toggleVoiceMode}
              title="Toggle Voice Mode"
              style={{
                background: isVoiceActive ? 'var(--success-bg)' : 'transparent',
                border: 'none',
                color: isVoiceActive ? 'var(--success)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                transition: 'all 0.2s',
              }}
            >
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
              style={{
                background: 'transparent',
                border: 'none',
                color: showSettings ? 'var(--info)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                transition: 'all 0.2s',
              }}
            >
              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dynamic Inner Workspace Panel */}
        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>

          {/* Settings Blur Overlay Modal */}
          {showSettings && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(9, 13, 22, 0.75)',
                backdropFilter: 'blur(12px)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                transition: 'all 0.3s',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '22px',
                  width: '100%',
                  maxWidth: '380px',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'white', fontWeight: 600 }}>Secure AI Configuration</h4>
                  <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                </div>

                {/* Active AI Provider selection */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 500 }}>Active AI Engine</label>
                  <select
                    value={activeAiProvider}
                    onChange={(e) => setActiveAiProvider(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'white', outline: 'none' }}
                  >
                    <option value="local">🤖 Local DB Intelligence Agent (No Key)</option>
                    <option value="gemini">✨ Google Gemini Direct (Database Saved)</option>
                    <option value="openrouter">🚀 OpenRouter Hub (Database Saved)</option>
                  </select>
                </div>

                {/* Conditional Gemini settings */}
                {activeAiProvider === 'gemini' && (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 500 }}>Gemini API Key</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder={geminiApiKey ? "••••••••" : "Paste Gemini API Key..."}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'white' }}
                    />
                  </div>
                )}

                {/* Conditional OpenRouter settings */}
                {activeAiProvider === 'openrouter' && (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 500 }}>OpenRouter API Key</label>
                      <input
                        className="form-input"
                        type="password"
                        placeholder={openrouterApiKey ? "••••••••" : "Paste OpenRouter API Key..."}
                        value={openrouterApiKey}
                        onChange={(e) => setOpenrouterApiKey(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'white' }}
                      />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 500 }}>OpenRouter Model</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="e.g. google/gemini-2.5-flash"
                        value={openrouterModel}
                        onChange={(e) => setOpenrouterModel(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'white' }}
                      />
                    </div>
                  </>
                )}

                <div style={{ color: 'var(--text-placeholder)', fontSize: '0.7rem', lineHeight: '1.4', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  🔒 **Safe Storage**: API keys are saved securely on the server's database and are never stored in client-side LocalStorage.
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button className="btn btn-secondary" onClick={() => { setShowSettings(false); fetchSettings(); }} style={{ flex: 1, padding: '8px 10px', fontSize: '0.85rem' }}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveSettings} style={{ flex: 2, padding: '8px 10px', fontSize: '0.85rem' }}>Save Config</button>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Left History Drawer */}
          <div
            style={{
              width: isHistoryOpen ? '250px' : '0px',
              opacity: isHistoryOpen ? 1 : 0,
              borderRight: isHistoryOpen ? '1px solid var(--border-primary)' : 'none',
              background: 'rgba(15, 21, 36, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ flexGrow: 1, padding: '16px 12px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-placeholder)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>Analysis History</div>
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: activeConvId === c.id ? 'var(--bg-card-elevated)' : 'transparent',
                    color: activeConvId === c.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    marginBottom: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    position: 'relative',
                    border: activeConvId === c.id ? '1px solid var(--border-primary)' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  className="history-item-hover"
                >
                  {editingConvId === c.id ? (
                    <input
                      type="text"
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      onBlur={() => handleSaveRename(c.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(c.id)}
                      autoFocus
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-focus)', color: 'white', fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px', width: '100%' }}
                    />
                  ) : (
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '22px' }}>
                      {c.pinned && <span style={{ marginRight: '6px' }}>📌</span>}
                      {c.title}
                    </div>
                  )}

                  <div className="history-actions" style={{ display: 'flex', gap: '6px', position: 'absolute', right: '8px', top: '10px' }}>
                    <button onClick={(e) => handleTogglePin(c.id, e)} title={c.pinned ? 'Unpin' : 'Pin'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}>📌</button>
                    <button onClick={(e) => handleStartRename(c.id, c.title, e)} title="Rename" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}>✏️</button>
                    <button onClick={(e) => handleDeleteConv(c.id, e)} title="Delete" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartNewChat}
              style={{
                margin: '12px',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--info-text)',
                border: '1px dashed var(--info)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              className="btn-new-chat"
            >
              <span>+ New Session</span>
            </button>
          </div>

          {/* Conversation Feed */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '460px' }}>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Contextual Suggestions Grid */}
              {messages.length === 0 && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '14px' }}>
                      <svg fill="none" height="32" stroke="var(--info-text)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', marginBottom: '6px' }}>ERP Cognitive Assistant</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.45' }}>
                      Ask questions in natural language to perform instant database queries, reports, or aggregates.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div
                      onClick={() => handleChipClick('Show all products in stock')}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                      className="suggest-card"
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--info-text)', marginBottom: '2px' }}>📦 Products</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>List items, selling prices, and details.</div>
                    </div>
                    <div
                      onClick={() => handleChipClick('Show ledger accounts and balances')}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                      className="suggest-card"
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#10b981', marginBottom: '2px' }}>📊 Ledgers</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verify active ledger balances.</div>
                    </div>
                    <div
                      onClick={() => handleChipClick('Summarize sales invoices')}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                      className="suggest-card"
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f59e0b', marginBottom: '2px' }}>🧾 Sales & billing</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Display recent billing invoices.</div>
                    </div>
                    <div
                      onClick={() => handleChipClick('List crm leads')}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                      className="suggest-card"
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#a855f7', marginBottom: '2px' }}>📈 CRM Pipeline</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Summary of won/quoted leads.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    background: m.role === 'user' ? 'var(--btn-primary-gradient)' : 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border-primary)',
                    transition: 'all 0.2s',
                  }}
                >
                  {m.role === 'user' ? (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.45' }}>{m.content}</p>
                  ) : (
                    <div>{renderMessageContent(m.content)}</div>
                  )}
                  <div style={{ fontSize: '0.65rem', color: m.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-placeholder)', marginTop: '6px', textAlign: 'right', fontWeight: 500 }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-card)', padding: '14px 18px', borderRadius: '16px 16px 16px 2px', display: 'flex', gap: '8px', border: '1px solid var(--border-primary)' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--info-text)', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--info-text)', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }} />
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--info-text)', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick chips bar */}
            {messages.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', padding: '4px 14px', overflowX: 'auto', background: 'rgba(9, 13, 22, 0.1)', scrollbarWidth: 'none' }}>
                <button onClick={() => handleChipClick('Show products')} style={{ flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '14px', padding: '4px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}>📦 Stocks</button>
                <button onClick={() => handleChipClick('Show active ledgers')} style={{ flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '14px', padding: '4px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}>📊 Accounts</button>
                <button onClick={() => handleChipClick('Show leads')} style={{ flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '14px', padding: '4px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}>📈 Leads</button>
                <button onClick={() => handleChipClick('Show recent vouchers')} style={{ flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '14px', padding: '4px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}>🧾 Sales</button>
              </div>
            )}

            {/* Audio wave feedback block */}
            {(isListening || isSpeaking) && (
              <div style={{ padding: '6px 20px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(11, 18, 32, 0.6)', borderTop: '1px solid var(--border-primary)', backdropFilter: 'blur(8px)' }}>
                <span style={{ fontSize: '0.72rem', color: isSpeaking ? 'var(--info-text)' : 'var(--success)', fontWeight: '600' }}>
                  {isSpeaking ? 'Speaking Response...' : 'Listening to voice input...'}
                </span>
                <canvas ref={canvasRef} width="160" height="24" style={{ height: '24px', width: '160px', borderRadius: '12px' }} />
                {isSpeaking && (
                  <button onClick={() => window.speechSynthesis.cancel()} style={{ marginLeft: 'auto', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                    Stop
                  </button>
                )}
              </div>
            )}

            {/* Input Bar */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: '10px', background: 'rgba(11, 18, 32, 0.5)' }}>
              {isVoiceActive && (
                <button
                  onClick={startListening}
                  style={{
                    backgroundColor: isListening ? 'var(--danger)' : 'var(--success)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s',
                  }}
                  title="Speak to Assistant"
                >
                  {isListening ? (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', display: 'block', animation: 'ping 1s infinite' }} />
                  ) : (
                    <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    </svg>
                  )}
                </button>
              )}
              <input
                type="text"
                placeholder={isListening ? "Listening to your voice..." : "Ask copilot about your business..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{
                  flexGrow: 1,
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                disabled={isListening}
              />
              <button
                onClick={() => handleSendMessage()}
                style={{
                  backgroundColor: 'var(--info)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s',
                }}
                disabled={isListening}
                className="btn-send-hover"
              >
                <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                  <line x1="22" x2="11" y1="2" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .suggest-card:hover {
          background-color: var(--bg-card-elevated) !important;
          border-color: var(--border-hover) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .table-row-hover:hover {
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
        .history-item-hover:hover .history-actions {
          opacity: 1 !important;
        }
        .history-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .history-actions button:hover {
          filter: brightness(1.3);
        }
        .btn-new-chat:hover {
          background-color: rgba(59, 130, 246, 0.22) !important;
          transform: scale(1.02);
        }
        .btn-send-hover:hover {
          background-color: var(--border-focus) !important;
          transform: scale(1.03);
        }
        .fab-pulse {
          animation: floatGlow 3s infinite ease-in-out;
        }
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0); box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4); }
          50% { transform: translateY(-5px); box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6); }
        }
      `}</style>
    </>
  );
}
export { useState, useEffect };
