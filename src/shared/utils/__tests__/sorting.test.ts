import { describe, it, expect, vi } from 'vitest'
import { sortData, createSortHandler, SortConfig } from '../sorting'

describe('sortData', () => {
  const testData = [
    { name: 'Alice', age: 30, score: 85.5, active: true },
    { name: 'Bob', age: 25, score: 92.0, active: false },
    { name: 'Charlie', age: 35, score: 78.5, active: true },
    { name: 'David', age: 28, score: 95.0, active: false },
  ]

  it('should return original data when no sort direction', () => {
    const sortConfig: SortConfig = { key: 'name', direction: null }
    const result = sortData(testData, sortConfig)
    expect(result).toEqual(testData)
  })

  it('should sort strings ascending', () => {
    const sortConfig: SortConfig = { key: 'name', direction: 'asc' }
    const result = sortData(testData, sortConfig)
    expect(result[0].name).toBe('Alice')
    expect(result[1].name).toBe('Bob')
    expect(result[2].name).toBe('Charlie')
    expect(result[3].name).toBe('David')
  })

  it('should sort strings descending', () => {
    const sortConfig: SortConfig = { key: 'name', direction: 'desc' }
    const result = sortData(testData, sortConfig)
    expect(result[0].name).toBe('David')
    expect(result[1].name).toBe('Charlie')
    expect(result[2].name).toBe('Bob')
    expect(result[3].name).toBe('Alice')
  })

  it('should sort numbers ascending', () => {
    const sortConfig: SortConfig = { key: 'age', direction: 'asc' }
    const result = sortData(testData, sortConfig)
    expect(result[0].age).toBe(25)
    expect(result[1].age).toBe(28)
    expect(result[2].age).toBe(30)
    expect(result[3].age).toBe(35)
  })

  it('should sort numbers descending', () => {
    const sortConfig: SortConfig = { key: 'age', direction: 'desc' }
    const result = sortData(testData, sortConfig)
    expect(result[0].age).toBe(35)
    expect(result[1].age).toBe(30)
    expect(result[2].age).toBe(28)
    expect(result[3].age).toBe(25)
  })

  it('should sort floats correctly', () => {
    const sortConfig: SortConfig = { key: 'score', direction: 'asc' }
    const result = sortData(testData, sortConfig)
    expect(result[0].score).toBe(78.5)
    expect(result[1].score).toBe(85.5)
    expect(result[2].score).toBe(92.0)
    expect(result[3].score).toBe(95.0)
  })

  it('should handle nested properties', () => {
    const nestedData = [
      { user: { name: 'Alice' }, value: 100 },
      { user: { name: 'Bob' }, value: 200 },
    ]
    const sortConfig: SortConfig = { key: 'user.name', direction: 'asc' }
    const result = sortData(nestedData, sortConfig)
    expect(result[0].user.name).toBe('Alice')
    expect(result[1].user.name).toBe('Bob')
  })

  it('should handle null and undefined values', () => {
    const dataWithNulls = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: null },
      { name: 'Charlie', age: undefined },
      { name: 'David', age: 25 },
    ]
    const sortConfig: SortConfig = { key: 'age', direction: 'asc' }
    const result = sortData(dataWithNulls, sortConfig)
    expect(result[0].name).toBe('David') // 25
    expect(result[1].name).toBe('Alice') // 30
    expect(result[2].name).toBe('Bob') // null
    expect(result[3].name).toBe('Charlie') // undefined
  })

  it('should not mutate original data', () => {
    const originalData = [...testData]
    const sortConfig: SortConfig = { key: 'name', direction: 'asc' }
    sortData(testData, sortConfig)
    expect(testData).toEqual(originalData)
  })

  it('should handle case-insensitive string sorting', () => {
    const caseData = [
      { name: 'alice' },
      { name: 'BOB' },
      { name: 'Charlie' },
      { name: 'david' },
    ]
    const sortConfig: SortConfig = { key: 'name', direction: 'asc' }
    const result = sortData(caseData, sortConfig)
    expect(result[0].name).toBe('alice')
    expect(result[1].name).toBe('BOB')
    expect(result[2].name).toBe('Charlie')
    expect(result[3].name).toBe('david')
  })
})

describe('createSortHandler', () => {
  it('should cycle through sort states correctly', () => {
    const setSort = vi.fn()
    const currentSort: SortConfig = { key: 'name', direction: null }
    const handler = createSortHandler(currentSort, setSort)

    // First click: asc
    handler('name')
    expect(setSort).toHaveBeenCalledWith({ key: 'name', direction: 'asc' })

    // Second click: desc
    const ascSort: SortConfig = { key: 'name', direction: 'asc' }
    const handler2 = createSortHandler(ascSort, setSort)
    handler2('name')
    expect(setSort).toHaveBeenCalledWith({ key: 'name', direction: 'desc' })

    // Third click: null
    const descSort: SortConfig = { key: 'name', direction: 'desc' }
    const handler3 = createSortHandler(descSort, setSort)
    handler3('name')
    expect(setSort).toHaveBeenCalledWith({ key: 'name', direction: null })

    // Fourth click: asc again
    const nullSort: SortConfig = { key: 'name', direction: null }
    const handler4 = createSortHandler(nullSort, setSort)
    handler4('name')
    expect(setSort).toHaveBeenCalledWith({ key: 'name', direction: 'asc' })
  })

  it('should reset to asc when clicking different key', () => {
    const setSort = vi.fn()
    const currentSort: SortConfig = { key: 'name', direction: 'desc' }
    const handler = createSortHandler(currentSort, setSort)

    handler('age')
    expect(setSort).toHaveBeenCalledWith({ key: 'age', direction: 'asc' })
  })
})
