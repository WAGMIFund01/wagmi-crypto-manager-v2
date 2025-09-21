'use client';

import { useState } from 'react';
import WagmiButton from '@/components/ui/WagmiButton';
import WagmiInput from '@/components/ui/WagmiInput';
import WagmiCard from '@/components/ui/WagmiCard';
import StandardModal from '@/components/ui/StandardModal';
import { PortfolioAsset } from '@/lib/sheetsAdapter';

interface EditAssetFormProps {
  isOpen: boolean;
  asset: PortfolioAsset;
  onSave: (data: {
    symbol: string;
    quantity: number;
    riskLevel: string;
    location: string;
    coinType: string;
    thesis: string;
  }) => Promise<void>;
  onClose: () => void;
}

const RISK_LEVELS = ['Low', 'Medium', 'High'];

export default function EditAssetForm({ isOpen, asset, onSave, onClose }: EditAssetFormProps) {
  const [formData, setFormData] = useState({
    symbol: asset.symbol,
    quantity: asset.quantity.toString(),
    riskLevel: asset.riskLevel,
    location: asset.location,
    coinType: asset.coinType || 'Altcoin',
    thesis: asset.thesis || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== EditAssetForm: Form submitted ===');
    console.log('Form data:', formData);
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate quantity
      const quantity = parseFloat(formData.quantity);
      console.log('Parsed quantity:', quantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }

      const saveData = {
        symbol: formData.symbol,
        quantity: quantity,
        riskLevel: formData.riskLevel,
        location: formData.location,
        coinType: formData.coinType,
        thesis: formData.thesis
      };
      
      console.log('Calling onSave with data:', saveData);
      await onSave(saveData);
      console.log('onSave completed successfully');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
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
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${asset.assetName} (${asset.symbol})`}
      size="lg"
      theme="green"
    >
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
              <WagmiInput
                type="text"
                placeholder="e.g., Phantom, Exchange"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Coin Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coin Type
              </label>
              <WagmiInput
                type="text"
                placeholder="e.g., Altcoin, Memecoin, Major"
                value={formData.coinType}
                onChange={(e) => handleInputChange('coinType', e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
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
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </WagmiButton>
          <WagmiButton
            type="submit"
            theme="green"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Updating..." : "Update Asset"}
          </WagmiButton>
        </div>
      </form>
    </StandardModal>
  );
}
