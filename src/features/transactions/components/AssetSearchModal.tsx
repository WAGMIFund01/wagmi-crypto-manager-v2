'use client';

import React, { useState, useEffect } from 'react';
import StandardModal from '@/components/ui/StandardModal';
import { WagmiInput, WagmiButton, WagmiSpinner } from '@/components/ui';
import { AssetSearchResult } from '../services/AssetSearchService';

interface AssetSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSelect: (asset: AssetSearchResult) => void;
}

export default function AssetSearchModal({ isOpen, onClose, onAssetSelect }: AssetSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchAssets(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchAssets = async (query: string) => {
    if (!query || query.length < 2) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search-assets?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        setError(data.error || 'Failed to search for assets');
      }
    } catch (err) {
      console.error('Error searching assets:', err);
      setError('Failed to search for assets');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelect = (asset: AssetSearchResult) => {
    setSelectedAsset(asset);
  };

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onAssetSelect(selectedAsset);
      onClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedAsset(null);
    setError(null);
    onClose();
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Asset"
      size="2xl"
      theme="green"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <WagmiInput
            type="text"
            placeholder="Search for an asset (e.g., Bitcoin, ETH, Solana)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <WagmiSpinner size="md" />
              <span className="ml-2 text-gray-400">Searching assets...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleAssetSelect(asset)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAsset?.id === asset.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {asset.image && (
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <div className="font-medium text-white">{asset.name}</div>
                        <div className="text-sm text-gray-400">{asset.symbol}</div>
                      </div>
                    </div>
                    {asset.current_price && (
                      <div className="text-right">
                        <div className="font-medium text-white">
                          ${asset.current_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6
                          })}
                        </div>
                        {asset.price_change_percentage_24h && (
                          <div className={`text-sm ${
                            asset.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {asset.price_change_percentage_24h >= 0 ? '+' : ''}
                            {asset.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No assets found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Start typing to search for assets...</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
          <WagmiButton
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </WagmiButton>
          <WagmiButton
            variant="primary"
            onClick={handleConfirmSelection}
            disabled={!selectedAsset}
          >
            Select Asset
          </WagmiButton>
        </div>
      </div>
    </StandardModal>
  );
}
