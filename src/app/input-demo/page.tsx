'use client';

import React, { useState } from 'react';
import { WagmiInput } from '@/components/ui';

export default function InputDemo() {
  const [formData, setFormData] = useState({
    investorId: '',
    email: '',
    password: '',
    search: '',
    amount: '',
    comments: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.investorId) newErrors.investorId = 'Investor ID is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Form submitted successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          WagmiInput Component Demo
        </h1>
        
        {/* Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Input Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WagmiInput
              variant="default"
              label="Default Input"
              placeholder="Enter text here"
              value={formData.investorId}
              onChange={(e) => handleInputChange('investorId', e.target.value)}
            />
            
            <WagmiInput
              variant="search"
              label="Search Input"
              placeholder="Search investors..."
              value={formData.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
            />
            
            <WagmiInput
              variant="email"
              label="Email Input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            
            <WagmiInput
              variant="password"
              label="Password Input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              showPasswordToggle
            />
            
            <WagmiInput
              variant="number"
              label="Number Input"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>
        </section>

        {/* Themes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Theme Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <WagmiInput
              variant="default"
              theme="green"
              label="Green Theme"
              placeholder="WAGMI green"
            />
            
            <WagmiInput
              variant="default"
              theme="orange"
              label="Orange Theme"
              placeholder="Orange accent"
            />
            
            <WagmiInput
              variant="default"
              theme="blue"
              label="Blue Theme"
              placeholder="Blue accent"
            />
            
            <WagmiInput
              variant="default"
              theme="red"
              label="Red Theme"
              placeholder="Red accent"
            />
            
            <WagmiInput
              variant="default"
              theme="gray"
              label="Gray Theme"
              placeholder="Gray neutral"
            />
          </div>
        </section>

        {/* Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Input Sizes</h2>
          <div className="space-y-6">
            <WagmiInput
              variant="default"
              size="sm"
              label="Small Input"
              placeholder="Compact size"
            />
            
            <WagmiInput
              variant="default"
              size="md"
              label="Medium Input (Default)"
              placeholder="Standard size"
            />
            
            <WagmiInput
              variant="default"
              size="lg"
              label="Large Input"
              placeholder="Prominent size"
            />
          </div>
        </section>

        {/* States */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Input States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WagmiInput
              variant="default"
              label="Normal State"
              placeholder="Type here..."
            />
            
            <WagmiInput
              variant="default"
              label="Error State"
              placeholder="This has an error"
              error="This field is required"
            />
            
            <WagmiInput
              variant="default"
              label="With Helper Text"
              placeholder="This has helper text"
              helperText="This is helpful information"
            />
            
            <WagmiInput
              variant="default"
              label="Disabled State"
              placeholder="This is disabled"
              disabled
            />
          </div>
        </section>

        {/* Icons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Input with Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WagmiInput
              variant="default"
              label="Left Icon"
              placeholder="Search with icon"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              iconPosition="left"
            />
            
            <WagmiInput
              variant="default"
              label="Right Icon"
              placeholder="Input with right icon"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              iconPosition="right"
            />
            
            <WagmiInput
              variant="password"
              label="Password with Toggle"
              placeholder="Enter password"
              showPasswordToggle
            />
            
            <WagmiInput
              variant="search"
              label="Search Variant"
              placeholder="Search investors..."
            />
          </div>
        </section>

        {/* Real Usage Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Real Usage Examples</h2>
          
          {/* Investor Login Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Investor Login Form</h3>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <WagmiInput
                variant="default"
                label="Investor ID"
                placeholder="Enter your Investor ID"
                value={formData.investorId}
                onChange={(e) => handleInputChange('investorId', e.target.value.toUpperCase())}
                error={errors.investorId}
              />
              
              <WagmiInput
                variant="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
              />
              
              <WagmiInput
                variant="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                showPasswordToggle
              />
              
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Login
              </button>
            </form>
          </div>
          
          {/* Search and Filter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Investor Table Search</h3>
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              <WagmiInput
                variant="search"
                placeholder="Search investors by name or ID..."
                value={formData.search}
                onChange={(e) => handleInputChange('search', e.target.value)}
                className="flex-1 min-w-0"
              />
              
              <WagmiInput
                variant="number"
                placeholder="Min Investment"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full sm:w-32"
              />
            </div>
          </div>
        </section>

        {/* Interactive Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Interactive Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Focus States</h3>
              <WagmiInput
                variant="default"
                label="Focus to see green glow"
                placeholder="Click to focus"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Validation States</h3>
              <WagmiInput
                variant="default"
                label="Error with red styling"
                placeholder="This shows error state"
                error="Invalid input format"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
