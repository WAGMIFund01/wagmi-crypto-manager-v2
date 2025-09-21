'use client';

import React, { useState, useEffect } from 'react';
import StandardModal from '@/components/ui/StandardModal';
import { WagmiInput, WagmiButton, WagmiSpinner, SmartDropdown } from '@/components/ui';
import { AssetSearchResult } from '../services/AssetSearchService';
import { detectChain } from '../utils/chainDetection';
import { usePortfolioFieldOptions } from '@/hooks/usePortfolioFieldOptions';

interface AddAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: () => void;
  selectedAsset?: AssetSearchResult | null;
}

export default function AddAssetForm({ isOpen, onClose, onAssetAdded, selectedAsset: propSelectedAsset }: AddAssetFormProps) {
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(propSelectedAsset || null);
  const [quantity, setQuantity] = useState('');
  const [chain, setChain] = useState('');
  const [riskLevel, setRiskLevel] = useState('Medium');
  const [location, setLocation] = useState('');
  const [coinType, setCoinType] = useState('Altcoin');
  const [thesis, setThesis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch portfolio field options for smart dropdowns
  const { options: fieldOptions, loading: optionsLoading } = usePortfolioFieldOptions();

  // Sync with prop changes and auto-detect chain
  useEffect(() => {
    setSelectedAsset(propSelectedAsset || null);
    
    // Auto-detect chain when asset is selected
    if (propSelectedAsset) {
      const detectedChain = detectChain(propSelectedAsset.id, propSelectedAsset.symbol);
      setChain(detectedChain.displayName);
    }
  }, [propSelectedAsset]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive numbers with up to 8 decimal places
    if (value === '' || /^\d*\.?\d{0,8}$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted:', { selectedAsset, quantity, loading });
    console.log('Selected asset details:', selectedAsset ? {
      id: selectedAsset.id,
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      current_price: selectedAsset.current_price
    } : 'No selected asset');
    
    if (!selectedAsset) {
      setError('Please select an asset');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    setError(null);

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
          setError('Unable to fetch current price for this asset. Please try again.');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching current price:', error);
        setError('Unable to fetch current price for this asset. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      const requestData = {
        coinGeckoId: assetToUse.id,
        symbol: assetToUse.symbol,
        name: assetToUse.name,
        quantity: parseFloat(quantity),
        currentPrice: assetToUse.current_price || 0,
        chain: chain.trim(),
        riskLevel: riskLevel,
        location: location.trim(),
        coinType: coinType,
        thesis: thesis.trim()
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
        setQuantity('');
        setChain('');
        setRiskLevel('Medium');
        setLocation('');
        setCoinType('Altcoin');
        setThesis('');
        
        // Close modal and refresh data
        onClose();
        onAssetAdded();
      } else {
        setError(data.error || 'Failed to add asset');
      }
    } catch (err) {
      console.error('Error adding asset:', err);
      setError('Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setSelectedAsset(null);
    setQuantity('');
    setChain('');
    setRiskLevel('Medium');
    setLocation('');
    setCoinType('Altcoin');
    setThesis('');
    setError(null);
    onClose();
  };

  const totalValue = selectedAsset && quantity 
    ? (parseFloat(quantity) * (selectedAsset.current_price || 0))
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
            value={quantity}
            onChange={handleQuantityChange}
            required
            className="w-full"
          />
        </div>

        {/* Total Value Display */}
        {selectedAsset && quantity && (
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chain
              {selectedAsset && chain && (
                <span className="ml-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                  Auto-detected
                </span>
              )}
            </label>
            <WagmiInput
              type="text"
              placeholder="e.g., Ethereum, Solana"
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Risk Level
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <SmartDropdown
              label="Location"
              value={location}
              onChange={setLocation}
              placeholder="e.g., Phantom, Exchange"
              options={fieldOptions.locations}
              className="w-full"
            />
          </div>

          <div>
            <SmartDropdown
              label="Coin Type"
              value={coinType}
              onChange={setCoinType}
              placeholder="e.g., Altcoin, Memecoin, Major"
              options={fieldOptions.coinTypes}
              className="w-full"
            />
          </div>
        </div>

        {/* Thesis */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Investment Thesis
          </label>
          <textarea
            placeholder="Describe the investment rationale..."
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 resize-none"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
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
            disabled={!selectedAsset || !quantity || loading}
            onClick={() => console.log('Add Asset button clicked:', { selectedAsset, quantity, loading })}
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
