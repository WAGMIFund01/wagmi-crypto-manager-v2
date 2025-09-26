'use client';

import React, { useState, useEffect } from 'react';
import StandardModal from '@/components/ui/StandardModal';
import { WagmiInput, WagmiButton, WagmiSpinner, SmartDropdown, FormError } from '@/components/ui';
import { AssetSearchResult } from '../services/AssetSearchService';
import { detectChain } from '../utils/chainDetection';
import { usePortfolioFieldOptions } from '@/hooks/usePortfolioFieldOptions';
import { useFormValidation } from '@/hooks/useFormValidation';
import { getFormRules } from '@/shared/utils/validation';

interface AddAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: () => void;
  selectedAsset?: AssetSearchResult | null;
  dataSource?: 'wagmi-fund' | 'personal-portfolio';
}

export default function AddAssetForm({ isOpen, onClose, onAssetAdded, selectedAsset: propSelectedAsset, dataSource = 'wagmi-fund' }: AddAssetFormProps) {
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
    
    // Auto-detect chain when asset is selected (only if we find a valid match)
    if (propSelectedAsset) {
      const detectedChain = detectChain(propSelectedAsset.id, propSelectedAsset.symbol);
      // Only set chain if we found a valid match (not the default "Unknown Chain")
      if (detectedChain.name !== 'Unknown') {
        setFieldValue('chain', detectedChain.displayName);
      }
    }
  }, [propSelectedAsset, setFieldValue]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive numbers with up to 8 decimal places
    if (value === '' || /^\d*\.?\d{0,8}$/.test(value)) {
      setFieldValue('quantity', value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted:', { selectedAsset, formData, loading });
    console.log('Selected asset details:', selectedAsset ? {
      id: selectedAsset.id,
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      current_price: selectedAsset.current_price
    } : 'No selected asset');
    
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      console.log('Form validation failed:', validation.errors);
      return;
    }
    
    if (!selectedAsset) {
      setSubmitError('Please select an asset');
      return;
    }

    setLoading(true);
    setSubmitError(null);
    clearErrors();

    // If current_price is missing, try to fetch it
    let assetToUse = selectedAsset;
    if (!selectedAsset.current_price || selectedAsset.current_price <= 0) {
      try {
        console.log('Fetching current price for asset:', selectedAsset.id);
        const response = await fetch(`/api/get-asset-details?id=${encodeURIComponent(selectedAsset.id)}`);
        const data = await response.json();
        
        if (data.success && data.asset && data.asset.current_price > 0) {
          assetToUse = data.asset;
          console.log('Updated asset with current price:', assetToUse.current_price);
        } else {
          setSubmitError('Unable to fetch current price for this asset. Please try again.');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching current price:', error);
        setSubmitError('Unable to fetch current price for this asset. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      const requestData = {
        coinGeckoId: assetToUse.id,
        symbol: assetToUse.symbol,
        name: assetToUse.name,
        quantity: parseFloat(formData.quantity),
        currentPrice: assetToUse.current_price || 0,
        chain: formData.chain.trim(),
        riskLevel: formData.riskLevel,
        location: formData.location.trim(),
        coinType: formData.coinType,
        thesis: formData.thesis.trim(),
        dataSource: dataSource
      };
      
      console.log('Sending request data:', requestData);
      
      const response = await fetch('/api/add-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setSelectedAsset(null);
        resetForm();
        
        // Close modal and refresh data
        onClose();
        onAssetAdded();
      } else {
        setSubmitError(data.error || 'Failed to add asset');
      }
    } catch (err) {
      console.error('Error adding asset:', err);
      setSubmitError('Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setSelectedAsset(null);
    resetForm();
    setSubmitError(null);
    onClose();
  };

  const totalValue = selectedAsset && formData.quantity 
    ? (parseFloat(formData.quantity) * (selectedAsset.current_price || 0))
    : 0;

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Asset"
      size="lg"
      theme="green"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selected Asset Display */}
        {selectedAsset && (
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-3">
              {selectedAsset.image && (
                <img
                  src={selectedAsset.image}
                  alt={selectedAsset.name}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <div className="font-medium text-white">{selectedAsset.name}</div>
                <div className="text-sm text-gray-400">{selectedAsset.symbol}</div>
                {selectedAsset.current_price && (
                  <div className="text-sm text-green-400">
                    ${selectedAsset.current_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6
                    })}
                  </div>
                )}
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

        {/* Total Value Display */}
        {selectedAsset && formData.quantity && (
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="text-sm text-gray-400">Total Value</div>
            <div className="text-lg font-semibold text-green-400">
              ${totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
        )}

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SmartDropdown
              label="Chain"
              value={formData.chain}
              onChange={(value) => setFieldValue('chain', value)}
              placeholder="Select or type chain (e.g., Ethereum, Solana)"
              options={fieldOptions.chains}
              className="w-full"
            />
            {selectedAsset && formData.chain && (
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded mt-1 inline-block">
                Auto-detected
              </span>
            )}
            {errors.chain && (
              <div className="mt-1 text-sm text-red-400">{errors.chain}</div>
            )}
          </div>

          <div>
            <SmartDropdown
              label="Risk Level"
              value={formData.riskLevel}
              onChange={(value) => setFieldValue('riskLevel', value)}
              placeholder="Select or type risk level (e.g., Low, Medium, High)"
              options={fieldOptions.riskLevels}
              className="w-full"
            />
            {errors.riskLevel && (
              <div className="mt-1 text-sm text-red-400">{errors.riskLevel}</div>
            )}
          </div>

          <div>
            <SmartDropdown
              label="Location"
              value={formData.location}
              onChange={(value) => setFieldValue('location', value)}
              placeholder="Select or type location (e.g., Phantom, Exchange)"
              options={fieldOptions.locations}
              className="w-full"
            />
            {errors.location && (
              <div className="mt-1 text-sm text-red-400">{errors.location}</div>
            )}
          </div>

          <div>
            <SmartDropdown
              label="Coin Type"
              value={formData.coinType}
              onChange={(value) => setFieldValue('coinType', value)}
              placeholder="Select or type coin type (e.g., Altcoin, Memecoin, Major)"
              options={fieldOptions.coinTypes}
              className="w-full"
            />
            {errors.coinType && (
              <div className="mt-1 text-sm text-red-400">{errors.coinType}</div>
            )}
          </div>
        </div>

        {/* Thesis */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Investment Thesis
          </label>
          <textarea
            placeholder="Describe the investment rationale..."
            value={formData.thesis}
            onChange={(e) => setFieldValue('thesis', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 resize-none"
          />
          {errors.thesis && (
            <div className="mt-1 text-sm text-red-400">{errors.thesis}</div>
          )}
        </div>

        {/* Error Display */}
        {submitError && (
          <FormError error={submitError} />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
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
            disabled={!selectedAsset || !formData.quantity || loading || !isValid}
            onClick={() => console.log('Add Asset button clicked:', { selectedAsset, formData, loading })}
          >
            {loading ? (
              <>
                <WagmiSpinner size="sm" />
                Adding Asset...
              </>
            ) : (
              'Add Asset'
            )}
          </WagmiButton>
        </div>
      </form>
    </StandardModal>
  );
}
