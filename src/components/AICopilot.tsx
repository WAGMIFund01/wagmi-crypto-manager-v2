'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Download, Upload, X, Copy, Check } from 'lucide-react';
import { reportContextService } from '@/lib/reportContextService';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICopilotProps {
  onReportGenerated?: (draft: string) => void;
}

interface UploadedReport {
  id: string;
  name: string;
  content: string;
  date: string;
}

interface AIProvider {
  id: string;
  name: string;
  available: boolean;
  isFree: boolean;
}

export default function AICopilot({ onReportGenerated }: AICopilotProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportDraft, setReportDraft] = useState<string>('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch available AI providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/ai-copilot/providers');
        const data = await response.json();
        if (data.success) {
          setAvailableProviders(data.providers);
          // Set default provider to first available one
          const firstAvailable = data.providers.find((p: AIProvider) => p.available);
          if (firstAvailable) {
            setSelectedProvider(firstAvailable.id);
          }
        }
      } catch (error) {
        console.error('Error fetching AI providers:', error);
      }
    };
    fetchProviders();
  }, []);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Get current portfolio context
      const context = await reportContextService.prepareReportContext();
      
      const response = await fetch('/api/ai-copilot/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          context,
          provider: selectedProvider
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('assistant', data.draft || 'I need more information to help you.');
      } else {
        // Handle quota exceeded errors with helpful messaging
        if (data.error?.includes('quota exceeded')) {
          addMessage('assistant', `🚫 OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/usage or try again later.`);
        } else {
          addMessage('assistant', `Error: ${data.error}`);
        }
      }
    } catch (error) {
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadReport = async () => {
    if (!uploadFile) return;

    try {
      const content = await uploadFile.text();
      const newReport: UploadedReport = {
        id: Date.now().toString(),
        name: uploadFile.name,
        content,
        date: new Date().toISOString().split('T')[0]
      };

      setUploadedReports(prev => [...prev, newReport]);
      setUploadFile(null);
      setShowUploadModal(false);
      addMessage('assistant', `I've uploaded "${uploadFile.name}" and will use it as context for future report generation.`);
    } catch (error) {
      addMessage('assistant', 'Sorry, I couldn\'t read the file. Please try again.');
    }
  };

  const removeUploadedReport = (id: string) => {
    setUploadedReports(prev => prev.filter(report => report.id !== id));
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    addMessage('user', 'Generate a new investor report');

    try {
      // Get current portfolio context
      const context = await reportContextService.prepareReportContext();
      
      // Add uploaded reports to context
      const enhancedContext = {
        ...context,
        previousReports: [
          ...context.previousReports,
          ...uploadedReports.map(report => `${report.name} (${report.date})\n${report.content}`)
        ]
      };
      
      const response = await fetch('/api/ai-copilot/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: enhancedContext,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          newDetails: inputValue,
          provider: selectedProvider
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.draft) {
          setReportDraft(data.draft);
          addMessage('assistant', 'I\'ve generated a draft report for you. You can review and edit it below.');
          onReportGenerated?.(data.draft);
        }
        
        if (data.followUpQuestions && data.followUpQuestions.length > 0) {
          setFollowUpQuestions(data.followUpQuestions);
          addMessage('assistant', `I have some follow-up questions to help improve the report:\n\n${data.followUpQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`);
        }
      } else {
        // Handle quota exceeded errors with helpful messaging
        if (data.error?.includes('quota exceeded')) {
          addMessage('assistant', `🚫 OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/usage or try again later.`);
        } else {
          addMessage('assistant', `Error: ${data.error}`);
        }
      }
    } catch (error) {
      addMessage('assistant', 'Sorry, I encountered an error while generating the report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleDownloadDraft = () => {
    if (!reportDraft) return;
    
    const blob = new Blob([reportDraft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investor-report-draft-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyDraft = async () => {
    if (!reportDraft) return;
    
    try {
      await navigator.clipboard.writeText(reportDraft);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Copilot</h2>
          </div>
          
          {/* AI Provider Selector */}
          {availableProviders.length > 0 && (
            <div className="flex items-center space-x-2">
              <label htmlFor="ai-provider" className="text-sm text-gray-600">AI Model:</label>
              <select
                id="ai-provider"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableProviders.map((provider) => (
                  <option 
                    key={provider.id} 
                    value={provider.id}
                    disabled={!provider.available}
                  >
                    {provider.name} {provider.isFree && '(Free)'} {!provider.available && '(Not configured)'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Report</span>
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FileText className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Welcome to AI Copilot</p>
            <p className="text-sm">I can help you generate investor reports and answer questions about your portfolio.</p>
            <p className="text-sm mt-2">Try asking me about your portfolio performance or click &quot;Generate Report&quot; to get started.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-2 rounded-lg bg-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Reports Section */}
      {uploadedReports.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Uploaded Reports:</h3>
            <div className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
              ℹ️ Reports are summarized to save tokens
            </div>
          </div>
          <div className="space-y-2">
            {uploadedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{report.name}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded: {report.date} • ~{Math.round(report.content.length / 4)} tokens
                  </p>
                </div>
                <button
                  onClick={() => removeUploadedReport(report.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {uploadedReports.some(r => r.content.length > 8000) && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ Some reports are large. They&apos;ll be automatically summarized to avoid token limits.
            </div>
          )}
        </div>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Follow-up Questions:</h3>
          <div className="space-y-1">
            {followUpQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleFollowUpQuestion(question)}
                className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Draft */}
      {reportDraft && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Report Draft:</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyDraft}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {copiedToClipboard ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadDraft}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-3 max-h-40 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{reportDraft}</pre>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your portfolio or reporting..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Previous Report</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a report file (TXT, PDF, DOC, DOCX)
              </label>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {uploadFile && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">
                  Selected: <span className="font-medium">{uploadFile.name}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(uploadFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadReport}
                disabled={!uploadFile}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
