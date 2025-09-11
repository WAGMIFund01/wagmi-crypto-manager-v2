'use client';

import { useState, useEffect, useCallback } from 'react';

interface Transaction {
  transactionId: string;
  investorId: string;
  type: string;
  amount: number;
  date: string;
  note: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  investorId: string;
  investorName: string;
}

export default function TransactionModal({ isOpen, onClose, investorId, investorName }: TransactionModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/get-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ investorId }),
      });

      const data = await response.json();
      
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
      } else {
        setError(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Network error while fetching transactions');
    } finally {
      setLoading(false);
    }
  }, [investorId]);

  // Fetch transactions when modal opens
  useEffect(() => {
    if (isOpen && investorId) {
      fetchTransactions();
    }
  }, [isOpen, investorId, fetchTransactions]);

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: '#1A1F1A',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#333' }}>
          <div>
            <h2 
              className="text-xl font-semibold"
              style={{ 
                color: '#00FF95',
                textShadow: '0 0 20px rgba(0, 255, 149, 0.5), 0 0 40px rgba(0, 255, 149, 0.3)'
              }}
            >
              Transaction History
            </h2>
            <p style={{ color: '#A0A0A0', fontSize: '14px', margin: '4px 0 0 0' }}>
              {investorName} (ID: {investorId})
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #333',
              color: '#A0A0A0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = '#00FF95';
              e.currentTarget.style.color = '#00FF95';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.color = '#A0A0A0';
            }}
            title="Close"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#00FF95' }}></div>
                <p style={{ color: '#E0E0E0' }}>Loading transactions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg 
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: '#FF4D4D' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
              <p style={{ color: '#FF4D4D' }}>Error: {error}</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div 
                  key={transaction.transactionId || index}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: '#0B0B0B',
                    borderColor: '#333',
                    borderRadius: '12px'
                  }}
                >
                  {/* Top Row - Date + Type + Amount */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Date */}
                      <span style={{ color: '#E0E0E0', fontSize: '14px', fontWeight: '500' }}>
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      
                      {/* Type Tag */}
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block"
                        style={{
                          backgroundColor: '#00FF95',
                          color: '#1A1A1A',
                          minWidth: 'fit-content',
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          lineHeight: '1.2'
                        }}
                      >
                        {transaction.type}
                      </span>
                    </div>
                    
                    {/* Amount */}
                    <span 
                      className="font-semibold text-sm"
                      style={{ 
                        color: transaction.amount >= 0 ? '#00FF95' : '#FF4444' 
                      }}
                    >
                      {(transaction.amount >= 0 ? '+' : '') + formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  
                  {/* Description */}
                  {transaction.note && (
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: '#A0A0A0', margin: 0 }}
                    >
                      {transaction.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg 
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: '#E0E0E0' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <p style={{ color: '#E0E0E0' }}>No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
