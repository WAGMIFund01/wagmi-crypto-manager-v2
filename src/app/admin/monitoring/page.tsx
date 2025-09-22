'use client';

import React, { useState, useEffect } from 'react';
import { SystemHealth, ErrorMetrics, PerformanceMetrics } from '@/lib/errorMonitor';

// This would be a protected admin route in production
export default function MonitoringDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const fetchSystemHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real application, this would call an API endpoint
      // For now, we'll simulate the data
      const mockHealth: SystemHealth = {
        status: 'healthy',
        uptime: Date.now() - (Math.random() * 86400000), // Random uptime up to 24 hours
        memoryUsage: {
          rss: Math.random() * 100000000, // Random memory usage
          heapTotal: 50000000,
          heapUsed: Math.random() * 50000000,
          external: Math.random() * 10000000,
          arrayBuffers: Math.random() * 1000000,
        },
        errorMetrics: {
          totalErrors: Math.floor(Math.random() * 100),
          errorsByType: {
            'DatabaseError': Math.floor(Math.random() * 20),
            'ValidationError': Math.floor(Math.random() * 15),
            'NetworkError': Math.floor(Math.random() * 10),
            'AuthenticationError': Math.floor(Math.random() * 5),
          },
          errorsByEndpoint: {
            '/api/get-portfolio-data': Math.floor(Math.random() * 30),
            '/api/add-asset': Math.floor(Math.random() * 20),
            '/api/edit-asset': Math.floor(Math.random() * 15),
            '/api/remove-asset': Math.floor(Math.random() * 10),
          },
          recentErrors: [],
          lastErrorTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        },
        performanceMetrics: {
          averageResponseTime: Math.random() * 2000 + 500,
          slowestEndpoints: [
            { endpoint: '/api/get-portfolio-data', averageTime: Math.random() * 3000 + 1000, requestCount: Math.floor(Math.random() * 1000) },
            { endpoint: '/api/add-asset', averageTime: Math.random() * 2000 + 800, requestCount: Math.floor(Math.random() * 500) },
            { endpoint: '/api/edit-asset', averageTime: Math.random() * 1500 + 600, requestCount: Math.floor(Math.random() * 300) },
          ],
          totalRequests: Math.floor(Math.random() * 10000),
          errorRate: Math.random() * 5,
        },
        lastHealthCheck: new Date().toISOString(),
      };

      setSystemHealth(mockHealth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system health');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSystemHealth, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-900/20 border-green-500';
      case 'degraded': return 'bg-yellow-900/20 border-yellow-500';
      case 'critical': return 'bg-red-900/20 border-red-500';
      default: return 'bg-gray-900/20 border-gray-500';
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading && !systemHealth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading monitoring data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!systemHealth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">No system health data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">System Monitoring Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-white text-sm">Auto-refresh:</label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-gray-800 text-white px-3 py-1 rounded"
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>
              <button
                onClick={fetchSystemHealth}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Refresh
              </button>
            </div>
          </div>
          <p className="text-gray-400 mt-2">
            Last updated: {new Date(systemHealth.lastHealthCheck).toLocaleString()}
          </p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${getStatusBgColor(systemHealth.status)}`}>
            <h2 className="text-xl font-semibold text-white mb-2">System Status</h2>
            <p className={`text-2xl font-bold ${getStatusColor(systemHealth.status)}`}>
              {systemHealth.status.toUpperCase()}
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Uptime</h2>
            <p className="text-2xl font-bold text-blue-400">
              {formatUptime(systemHealth.uptime)}
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Total Requests</h2>
            <p className="text-2xl font-bold text-green-400">
              {systemHealth.performanceMetrics.totalRequests.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Average Response Time:</span>
                <span className="text-white font-semibold">
                  {systemHealth.performanceMetrics.averageResponseTime.toFixed(2)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Error Rate:</span>
                <span className={`font-semibold ${
                  systemHealth.performanceMetrics.errorRate > 5 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {systemHealth.performanceMetrics.errorRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Memory Usage</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Heap Used:</span>
                <span className="text-white font-semibold">
                  {formatBytes(systemHealth.memoryUsage.heapUsed)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Heap Total:</span>
                <span className="text-white font-semibold">
                  {formatBytes(systemHealth.memoryUsage.heapTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">RSS:</span>
                <span className="text-white font-semibold">
                  {formatBytes(systemHealth.memoryUsage.rss)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Errors by Type</h2>
            <div className="space-y-2">
              {Object.entries(systemHealth.errorMetrics.errorsByType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-300">{type}:</span>
                  <span className="text-red-400 font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Errors by Endpoint</h2>
            <div className="space-y-2">
              {Object.entries(systemHealth.errorMetrics.errorsByEndpoint).map(([endpoint, count]) => (
                <div key={endpoint} className="flex justify-between">
                  <span className="text-gray-300 text-sm">{endpoint}:</span>
                  <span className="text-red-400 font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slowest Endpoints */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Slowest Endpoints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-300 py-2">Endpoint</th>
                  <th className="text-left text-gray-300 py-2">Average Time</th>
                  <th className="text-left text-gray-300 py-2">Request Count</th>
                </tr>
              </thead>
              <tbody>
                {systemHealth.performanceMetrics.slowestEndpoints.map((endpoint, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="text-white py-2">{endpoint.endpoint}</td>
                    <td className="text-yellow-400 py-2">{endpoint.averageTime.toFixed(2)}ms</td>
                    <td className="text-gray-300 py-2">{endpoint.requestCount}</td>
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

