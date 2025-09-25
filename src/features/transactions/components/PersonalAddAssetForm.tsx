'use client';

import React, { useState, useEffect } from 'react';
import StandardModal from '@/components/ui/StandardModal';
import { WagmiInput, WagmiButton, WagmiSpinner, SmartDropdown, FormError } from '@/components/ui';
import { AssetSearchResult } from '../services/AssetSearchService';
import { detectChain } from '../utils/chainDetection';
import { usePortfolioFieldOptions } from '@/hooks/usePortfolioFieldOptions';
import { useFormValidation } from '@/hooks/useFormValidation';
import { getFormRules } from '@/shared/utils/validation';

interface PersonalAddAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: () => void;
  selectedAsset?: AssetSearchResult | null;
}

export default function PersonalAddAssetForm({ isOpen, onClose, onAssetAdded, selectedAsset: propSelectedAsset }: PersonalAddAssetFormProps) {
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(propSelectedAsset || null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Fetch portfolio field options for smart dropdowns
  const { options: fieldOptions } = usePortfolioFieldOptions();
  
  // Form validation
  const {
    data: formData,
    errors,
    isValid,
    setFieldValue,
    validateForm,
    resetForm,
    clearErrors
  } = useFormValidation({
    rules: getFormRules('addAsset'),
    initialData: {
      quantity: '',
      chain: '',
      riskLevel: '',
      location: '',
      coinType: '',
      thesis: ''
    }
  });

  // Sync with prop changes and auto-detect chain
  useEffect(() => {
    setSelectedAsset(propSelectedAsset || null);
    
    if (propSelectedAsset) {
      // Auto-detect chain based on asset name/symbol
      const detectedChain = detectChain(propSelectedAsset.name, propSelectedAsset.symbol);
      if (detectedChain) {
        setFieldValue('chain', detectedChain);
      }
      
      // Set default values
      setFieldValue('riskLevel', 'Medium');
      setFieldValue('coinType', 'Altcoin');
      setFieldValue('location', 'Unknown');
    }
  }, [propSelectedAsset, setFieldValue]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive numbers with up to 8 decimal places
    if (value === '' || /^\d*\.?\d{0,8}$/.test(value)) {
      setFieldValue('quantity', value);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setSubmitError(null);
    }
  }, [isOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAsset) {
      setSubmitError('No asset selected');
      return;
    }

    // Validate form
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      setSubmitError('Please fix the form errors before submitting');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/add-personal-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coinGeckoId: selectedAsset.id,
          symbol: selectedAsset.symbol,
          name: selectedAsset.name,
          quantity: parseFloat(formData.quantity),
          currentPrice: selectedAsset.current_price,
          chain: formData.chain,
          riskLevel: formData.riskLevel,
          location: formData.location,
          coinType: formData.coinType,
          thesis: formData.thesis
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Asset added successfully to personal portfolio:', data);
        onAssetAdded();
        onClose();
      } else {
        console.error('Failed to add asset to personal portfolio:', data.error);
        setSubmitError(data.error || 'Failed to add asset to personal portfolio');
      }
    } catch (error) {
      console.error('Error adding asset to personal portfolio:', error);
      setSubmitError('Failed to add asset to personal portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Asset to Personal Portfolio"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selected Asset Display */}
        {selectedAsset && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Selected Asset</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="text-white ml-2">{selectedAsset.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Symbol:</span>
                <span className="text-white ml-2">{selectedAsset.symbol}</span>
              </div>
              <div>
                <span className="text-gray-400">Current Price:</span>
                <span className="text-white ml-2">${selectedAsset.current_price?.toFixed(2) || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Market Cap Rank:</span>
                <span className="text-white ml-2">{selectedAsset.market_cap ? `#${selectedAsset.market_cap}` : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quantity *
          </label>
          <WagmiInput
            type="text"
            placeholder="Enter quantity"
            value={formData.quantity}
            onChange={handleQuantityChange}
            error={errors.quantity}
            required
            className="w-full"
          />
          {errors.quantity && (
            <div className="mt-1 text-sm text-red-400">{errors.quantity}</div>
          )}
        </div>

        {/* Chain Selection */}
        <div>
            <SmartDropdown
              label="Chain"
              value={formData.chain}
              onChange={(value) => setFieldValue('chain', value)}
              options={fieldOptions.chains}
              placeholder="Select chain"
              required
            />
        </div>

        {/* Risk Level Selection */}
        <div>
            <SmartDropdown
              label="Risk Level"
              value={formData.riskLevel}
              onChange={(value) => setFieldValue('riskLevel', value)}
              options={fieldOptions.riskLevels}
              placeholder="Select risk level"
              required
            />
        </div>

        {/* Location Selection */}
        <div>
          <SmartDropdown
            label="Location"
            value={formData.location}
            onChange={(value) => setFieldValue('location', value)}
            options={fieldOptions.locations}
            placeholder="Select location"
            required
          />
        </div>

        {/* Coin Type Selection */}
        <div>
          <SmartDropdown
            label="Coin Type"
            value={formData.coinType}
            onChange={(value) => setFieldValue('coinType', value)}
            options={fieldOptions.coinTypes}
            placeholder="Select coin type"
            required
          />
        </div>

        {/* Thesis Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Investment Thesis
          </label>
          <textarea
            placeholder="Enter your investment thesis (optional)"
            value={formData.thesis}
            onChange={(e) => setFieldValue('thesis', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 resize-none"
          />
          {errors.thesis && (
            <p className="text-red-500 text-sm mt-1">{errors.thesis}</p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <FormError error={submitError} />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <WagmiButton
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </WagmiButton>
          <WagmiButton
            type="submit"
            variant="primary"
            disabled={!isValid || loading || !selectedAsset}
            loading={loading}
          >
            {loading ? 'Adding Asset...' : 'Add to Personal Portfolio'}
          </WagmiButton>
        </div>
      </form>
    </StandardModal>
  );
}
