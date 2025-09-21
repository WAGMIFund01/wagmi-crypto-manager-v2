'use client';

import { useState, useEffect } from 'react';
import WagmiButton from '@/components/ui/WagmiButton';
import WagmiInput from '@/components/ui/WagmiInput';
import WagmiCard from '@/components/ui/WagmiCard';
import WagmiSpinner from '@/components/ui/WagmiSpinner';
import { PortfolioAsset } from '@/lib/sheetsAdapter';

interface EditAssetFormProps {
  asset: PortfolioAsset;
  onSave: (data: {
    symbol: string;
    quantity: number;
    riskLevel: string;
    location: string;
    thesis: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const RISK_LEVELS = ['Low', 'Medium', 'High'];
const LOCATIONS = ['Exchange', 'Cold Storage', 'Hot Wallet', 'DeFi Protocol', 'Staking'];

export default function EditAssetForm({ asset, onSave, onCancel }: EditAssetFormProps) {
  const [formData, setFormData] = useState({
    symbol: asset.symbol,
    quantity: asset.quantity.toString(),
    riskLevel: asset.riskLevel,
    location: asset.location,
    thesis: asset.thesis || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate quantity
      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }

      await onSave({
        symbol: formData.symbol,
        quantity: quantity,
        riskLevel: formData.riskLevel,
        location: formData.location,
        thesis: formData.thesis
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <WagmiCard className="w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Edit {asset.assetName} ({asset.symbol})
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <WagmiInput
                type="number"
                step="0.000001"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="Enter quantity"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Risk Level
              </label>
              <select
                value={formData.riskLevel}
                onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                disabled={isSubmitting}
              >
                {RISK_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                disabled={isSubmitting}
              >
                {LOCATIONS.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Thesis */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Investment Thesis
              </label>
              <textarea
                value={formData.thesis}
                onChange={(e) => handleInputChange('thesis', e.target.value)}
                placeholder="Enter your investment thesis for this asset..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Current Info Display */}
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <div className="text-sm text-gray-400">Current Information:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Current Price:</span>
                  <div className="text-white font-medium">
                    ${asset.currentPrice.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Total Value:</span>
                  <div className="text-white font-medium">
                    ${(asset.quantity * asset.currentPrice).toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Chain:</span>
                  <div className="text-white font-medium">{asset.chain}</div>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <div className="text-white font-medium">{asset.coinType}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <WagmiButton
                type="button"
                theme="gray"
                text="Cancel"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              />
              <WagmiButton
                type="submit"
                theme="green"
                text={isSubmitting ? "Updating..." : "Update Asset"}
                disabled={isSubmitting}
                className="flex-1"
              />
            </div>
          </form>
        </div>
      </WagmiCard>
    </div>
  );
}
