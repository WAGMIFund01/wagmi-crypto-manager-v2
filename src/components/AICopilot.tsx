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

export default function AICopilot({ onReportGenerated }: AICopilotProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportDraft, setReportDraft] = useState<string>('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  // Removed provider selection - using Gemini only
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Removed provider fetching - using Gemini only

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
          provider: 'gemini'
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
          provider: 'gemini'
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
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-700 bg-gray-900/50 gap-3">
        <div className="flex items-center space-x-2 min-w-0">
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-white truncate">AI Report Assistant</h2>
          <span className="hidden sm:inline text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded whitespace-nowrap">Powered by Gemini</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center space-x-1 px-2 sm:px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm flex-1 sm:flex-initial"
          >
            <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Upload Report</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="flex items-center justify-center space-x-1 px-2 sm:px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm flex-1 sm:flex-initial"
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Generate Report</span>
            <span className="sm:hidden">Generate</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-6 sm:py-8 px-4">
            <Bot className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-base sm:text-lg font-medium">Welcome to AI Copilot</p>
            <p className="text-xs sm:text-sm mt-1">I can help you generate investor reports and answer questions about your portfolio.</p>
            <p className="text-xs sm:text-sm mt-2">Try asking me about your portfolio performance or click &quot;Generate&quot; to get started.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[85%] sm:max-w-xs lg:max-w-md ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-green-400'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </div>
              <div
                className={`px-3 py-2 sm:px-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p className="text-[10px] sm:text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
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
        <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-white">Uploaded Reports:</h3>
            <div className="text-[10px] sm:text-xs text-gray-400 bg-blue-900/20 px-2 py-1 rounded self-start">
              ℹ️ Reports are summarized
            </div>
          </div>
          <div className="space-y-2">
            {uploadedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">{report.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    {report.date} • ~{Math.round(report.content.length / 4)} tokens
                  </p>
                </div>
                <button
                  onClick={() => removeUploadedReport(report.id)}
                  className="p-1.5 text-red-600 hover:text-red-800 flex-shrink-0"
                  aria-label="Remove report"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            ))}
          </div>
          {uploadedReports.some(r => r.content.length > 8000) && (
            <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700 rounded text-[10px] sm:text-xs text-yellow-300">
              ⚠️ Large reports will be auto-summarized
            </div>
          )}
        </div>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && (
        <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-900">
          <h3 className="text-xs sm:text-sm font-medium text-white mb-2">Follow-up Questions:</h3>
          <div className="space-y-1">
            {followUpQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleFollowUpQuestion(question)}
                className="block w-full text-left text-xs sm:text-sm text-blue-600 hover:text-blue-300 hover:bg-blue-900/20 p-2 rounded transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Draft */}
      {reportDraft && (
        <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-white">Report Draft:</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyDraft}
                className="flex items-center space-x-1 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                aria-label="Copy draft"
              >
                {copiedToClipboard ? (
                  <>
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    <span className="hidden sm:inline text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadDraft}
                className="flex items-center space-x-1 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                aria-label="Download draft"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 sm:p-3 max-h-32 sm:max-h-40 overflow-y-auto">
              <pre className="text-xs sm:text-sm text-gray-200 whitespace-pre-wrap">{reportDraft}</pre>
            </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">Upload Report</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Select a report file (TXT, PDF, DOC, DOCX)
              </label>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="block w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-900/20 file:text-blue-400 hover:file:bg-blue-900/30 file:cursor-pointer"
              />
            </div>

            {uploadFile && (
              <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
                <p className="text-xs sm:text-sm text-gray-300">
                  Selected: <span className="font-medium text-white">{uploadFile.name}</span>
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                  Size: {(uploadFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadReport}
                disabled={!uploadFile}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
