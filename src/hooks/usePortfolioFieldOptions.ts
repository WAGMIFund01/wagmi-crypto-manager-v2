'use client';

import { useState, useEffect } from 'react';

interface PortfolioFieldOptions {
  chains: string[];
  riskLevels: string[];
  locations: string[];
  coinTypes: string[];
}

export function usePortfolioFieldOptions() {
  const [options, setOptions] = useState<PortfolioFieldOptions>({
    chains: [],
    riskLevels: [],
    locations: [],
    coinTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/get-portfolio-field-options');
        const data = await response.json();
        
        if (data.success) {
          setOptions(data.data);
        } else {
          setError(data.error || 'Failed to fetch field options');
        }
      } catch (err) {
        console.error('Error fetching portfolio field options:', err);
        setError('Failed to fetch field options');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, loading, error };
}
