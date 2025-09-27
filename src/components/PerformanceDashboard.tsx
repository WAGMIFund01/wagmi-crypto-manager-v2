'use client';

import { useState, useEffect } from 'react';
import { PerformanceSummary } from '@/lib/performance-monitor';

interface PerformanceData {
  summary: PerformanceSummary;
  slowOperations: any[];
  allMetrics: any[];
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance-metrics');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const clearMetrics = async () => {
    try {
      const response = await fetch('/api/performance-metrics', { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        await fetchMetrics(); // Refresh data
      } else {
        setError(result.error || 'Failed to clear metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg">
        <h3 className="text-red-400 font-semibold mb-2">Error Loading Performance Data</h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg">
        <p className="text-gray-400">No performance data available</p>
      </div>
    );
  }

  const { summary, slowOperations } = data;

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Performance Monitor</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded text-sm ${
              autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </button>
          <button
            onClick={fetchMetrics}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            Refresh
          </button>
          <button
            onClick={clearMetrics}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400 mb-1">Total Operations</h3>
          <p className="text-2xl font-bold text-white">{summary.totalOperations}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400 mb-1">Average Duration</h3>
          <p className="text-2xl font-bold text-white">{summary.averageDuration.toFixed(2)}ms</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400 mb-1">Error Rate</h3>
          <p className="text-2xl font-bold text-white">{summary.errorRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400 mb-1">Slow Operations</h3>
          <p className="text-2xl font-bold text-white">{slowOperations.length}</p>
        </div>
      </div>

      {/* Slow Operations */}
      {slowOperations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Slow Operations (>1s)</h3>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Operation</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Duration</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Timestamp</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slowOperations.slice(0, 10).map((op, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="px-4 py-2 text-sm text-white">{op.operation}</td>
                      <td className="px-4 py-2 text-sm text-red-400 font-mono">{op.duration.toFixed(2)}ms</td>
                      <td className="px-4 py-2 text-sm text-gray-400">{new Date(op.timestamp).toLocaleTimeString()}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          op.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {op.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent Operations */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Recent Operations</h3>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Operation</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Duration</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Timestamp</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.operations.slice(-10).reverse().map((op, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="px-4 py-2 text-sm text-white">{op.operation}</td>
                    <td className={`px-4 py-2 text-sm font-mono ${
                      op.duration > 1000 ? 'text-red-400' : 
                      op.duration > 500 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {op.duration.toFixed(2)}ms
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-400">{new Date(op.timestamp).toLocaleTimeString()}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        op.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {op.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

