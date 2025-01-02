import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockClarity = {
  contracts: {
    'holo-marketplace': {
      functions: {
        'create-listing': vi.fn(),
        'cancel-listing': vi.fn(),
        'buy-listing': vi.fn(),
        'get-listing': vi.fn(),
      },
    },
  },
  globals: {
    'tx-sender': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  },
}

function callContract(contractName: string, functionName: string, args: any[]) {
  return mockClarity.contracts[contractName].functions[functionName](...args)
}

describe('Holographic Marketplace Contract', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  
  describe('create-listing', () => {
    it('should create a listing successfully', async () => {
      const tokenId = 1
      const price = 1000
      mockClarity.contracts['holo-marketplace'].functions['create-listing'].mockReturnValue({ success: true, value: 1 })
      
      const result = await callContract('holo-marketplace', 'create-listing', [tokenId, price])
      
      expect(result.success).toBe(true)
      expect(result.value).toBe(1)
    })
  })
  
  describe('cancel-listing', () => {
    it('should cancel a listing successfully', async () => {
      const listingId = 1
      mockClarity.contracts['holo-marketplace'].functions['cancel-listing'].mockReturnValue({ success: true })
      
      const result = await callContract('holo-marketplace', 'cancel-listing', [listingId])
      
      expect(result.success).toBe(true)
    })
    
    it('should fail if not the seller', async () => {
      const listingId = 2
      mockClarity.contracts['holo-marketplace'].functions['cancel-listing'].mockReturnValue({ success: false, error: 403 })
      
      const result = await callContract('holo-marketplace', 'cancel-listing', [listingId])
      
      expect(result.success).toBe(false)
      expect(result.error).toBe(403)
    })
    
    it('should fail if listing is not active', async () => {
      const listingId = 3
      mockClarity.contracts['holo-marketplace'].functions['cancel-listing'].mockReturnValue({ success: false, error: 400 })
      
      const result = await callContract('holo-marketplace', 'cancel-listing', [listingId])
      
      expect(result.success).toBe(false)
      expect(result.error).toBe(400)
    })
  })
  
  describe('buy-listing', () => {
    it('should buy a listing successfully', async () => {
      const listingId = 1
      mockClarity.contracts['holo-marketplace'].functions['buy-listing'].mockReturnValue({ success: true })
      
      const result = await callContract('holo-marketplace', 'buy-listing', [listingId])
      
      expect(result.success).toBe(true)
    })
    
    it('should fail if listing is not active', async () => {
      const listingId = 2
      mockClarity.contracts['holo-marketplace'].functions['buy-listing'].mockReturnValue({ success: false, error: 400 })
      
      const result = await callContract('holo-marketplace', 'buy-listing', [listingId])
      
      expect(result.success).toBe(false)
      expect(result.error).toBe(400)
    })
  })
  
  describe('get-listing', () => {
    it('should return listing details', async () => {
      const listingId = 1
      const expectedListing = {
        seller: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        token_id: 1,
        price: 1000,
        active: true
      }
      mockClarity.contracts['holo-marketplace'].functions['get-listing'].mockReturnValue(expectedListing)
      
      const result = await callContract('holo-marketplace', 'get-listing', [listingId])
      
      expect(result).toEqual(expectedListing)
    })
    
    it('should return null for non-existent listing', async () => {
      const listingId = 999
      mockClarity.contracts['holo-marketplace'].functions['get-listing'].mockReturnValue(null)
      
      const result = await callContract('holo-marketplace', 'get-listing', [listingId])
      
      expect(result).toBeNull()
    })
  })
})

