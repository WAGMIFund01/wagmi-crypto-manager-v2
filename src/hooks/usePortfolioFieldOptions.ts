import { useState, useEffect } from 'react'

export interface UsePortfolioFieldOptionsReturn {
  options: {
    chains: string[]
    riskLevels: string[]
    locations: string[]
    coinTypes: string[]
  }
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch unique field options for portfolio forms
 * Used by SmartDropdown components to provide autocomplete suggestions
 */
export function usePortfolioFieldOptions(): UsePortfolioFieldOptionsReturn {
  const [options, setOptions] = useState({
    chains: [] as string[],
    riskLevels: [] as string[],
    locations: [] as string[],
    coinTypes: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all field options in parallel
        const [chainsRes, riskLevelsRes, locationsRes, coinTypesRes] = await Promise.all([
          fetch('/api/get-portfolio-field-options?field=chain'),
          fetch('/api/get-portfolio-field-options?field=riskLevel'),
          fetch('/api/get-portfolio-field-options?field=location'),
          fetch('/api/get-portfolio-field-options?field=coinType')
        ])

        const [chainsData, riskLevelsData, locationsData, coinTypesData] = await Promise.all([
          chainsRes.json(),
          riskLevelsRes.json(),
          locationsRes.json(),
          coinTypesRes.json()
        ])

        setOptions({
          chains: chainsData.success ? chainsData.data?.chains || [] : [],
          riskLevels: riskLevelsData.success ? riskLevelsData.data?.riskLevels || [] : [],
          locations: locationsData.success ? locationsData.data?.locations || [] : [],
          coinTypes: coinTypesData.success ? coinTypesData.data?.coinTypes || [] : []
        })
      } catch (err) {
        console.error('Error fetching field options:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Set default options on error
        setOptions({
          chains: ['Ethereum', 'Bitcoin', 'Solana', 'Polygon', 'Arbitrum'],
          riskLevels: ['Low', 'Medium', 'High'],
          locations: ['Hot Wallet', 'Cold Storage', 'Exchange', 'DeFi Protocol'],
          coinTypes: ['Major', 'Altcoin', 'Memecoin', 'DeFi Token']
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [])

  return {
    options,
    loading,
    error
  }
}