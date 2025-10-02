'use client';

import React, { useState } from 'react';
import AICopilot from '@/components/AICopilot';
import { FileText, Bot, TrendingUp, BarChart3 } from 'lucide-react';

export default function AICopilotPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Copilot</h1>
              <p className="text-gray-600">Streamline your investor reporting with AI assistance</p>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Report Generation</h3>
              </div>
              <p className="text-sm text-gray-600">Generate professional investor reports based on your portfolio data and market insights.</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Performance Analysis</h3>
              </div>
              <p className="text-sm text-gray-600">Get AI-powered insights on portfolio performance and market trends.</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Smart Recommendations</h3>
              </div>
              <p className="text-sm text-gray-600">Receive intelligent suggestions for improving your investment strategy.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-[600px]">
              <AICopilot />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Generate Monthly Report</p>
                      <p className="text-sm text-gray-600">Create a comprehensive monthly investor report</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Performance Summary</p>
                      <p className="text-sm text-gray-600">Get a quick performance overview</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Risk Analysis</p>
                      <p className="text-sm text-gray-600">Analyze portfolio risk factors</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-900">Q4 2024 Report</p>
                  <p className="text-sm text-gray-600">Generated 2 days ago</p>
                </div>
                
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-900">November Update</p>
                  <p className="text-sm text-gray-600">Generated 1 week ago</p>
                </div>
                
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-900">Market Analysis</p>
                  <p className="text-sm text-gray-600">Generated 2 weeks ago</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips for Better Reports</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Provide specific performance metrics</li>
                <li>• Include market context and analysis</li>
                <li>• Mention any strategic changes</li>
                <li>• Be transparent about risks and challenges</li>
                <li>• Ask for clarification when needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
