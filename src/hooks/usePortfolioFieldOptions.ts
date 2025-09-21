import { useState, useEffect } from 'react'

export interface UsePortfolioFieldOptionsReturn {
  options: string[]
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch unique field options for portfolio forms
 * Used by SmartDropdown components to provide autocomplete suggestions
 */
export function usePortfolioFieldOptions(field: 'chain' | 'riskLevel' | 'location' | 'coinType'): UsePortfolioFieldOptionsReturn {
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/get-portfolio-field-options?field=${field}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${field} options`)
        }

        const data = await response.json()
        
        if (data.success) {
          setOptions(data.options || [])
        } else {
          throw new Error(data.error || `Failed to fetch ${field} options`)
        }
      } catch (err) {
        console.error(`Error fetching ${field} options:`, err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [field])

  return {
    options,
    loading,
    error
  }
}