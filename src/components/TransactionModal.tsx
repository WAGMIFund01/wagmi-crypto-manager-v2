'use client';

import { useState, useEffect, useCallback } from 'react';
import StandardModal from './ui/StandardModal';

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

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction History"
      size="2xl"
      theme="green"
    >
      <div className="space-y-4">
        {/* Investor Info */}
        <div className="text-center mb-6">
          <p style={{ color: '#A0A0A0', fontSize: '14px' }}>
            {investorName} (ID: {investorId})
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
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
    </StandardModal>
  );
}
