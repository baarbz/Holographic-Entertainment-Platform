import { describe, it, expect, beforeEach } from 'vitest'

// Mock contract state
let contentMap = new Map()
let contentRightsMap = new Map()
let contentCount = 0

// Mock contract functions
const createContent = (title: string, description: string, contentHash: string, contentType: string, duration: number) => {
  contentCount++
  const contentId = contentCount
  contentMap.set(contentId, {
    creator: 'tx-sender',
    title,
    description,
    contentHash,
    creationDate: Date.now(),
    contentType,
    duration,
    isPublished: false
  })
  contentRightsMap.set(contentId, {
    owner: 'tx-sender',
    licenseType: 'exclusive',
    royaltyPercentage: 0,
    expirationDate: null
  })
  return { ok: contentId }
}

const publishContent = (contentId: number) => {
  const content = contentMap.get(contentId)
  if (!content) return { error: 404 }
  if (content.creator !== 'tx-sender') return { error: 403 }
  content.isPublished = true
  contentMap.set(contentId, content)
  return { ok: true }
}

const transferRights = (contentId: number, newOwner: string, licenseType: string, royaltyPercentage: number, expirationDate: number | null) => {
  const rights = contentRightsMap.get(contentId)
  if (!rights) return { error: 404 }
  if (rights.owner !== 'tx-sender') return { error: 403 }
  rights.owner = newOwner
  rights.licenseType = licenseType
  rights.royaltyPercentage = royaltyPercentage
  rights.expirationDate = expirationDate
  contentRightsMap.set(contentId, rights)
  return { ok: true }
}

const getContent = (contentId: number) => {
  const content = contentMap.get(contentId)
  return content ? { ok: content } : { error: 404 }
}

const getContentRights = (contentId: number) => {
  const rights = contentRightsMap.get(contentId)
  return rights ? { ok: rights } : { error: 404 }
}

describe('Holographic Content Contract', () => {
  beforeEach(() => {
    contentMap.clear()
    contentRightsMap.clear()
    contentCount = 0
  })
  
  it('should create content successfully', () => {
    const result = createContent('Test Content', 'Description', 'hash123', 'performance', 300)
    expect(result).toEqual({ ok: 1 })
    expect(contentMap.size).toBe(1)
    expect(contentRightsMap.size).toBe(1)
  })
  
  it('should publish content successfully', () => {
    createContent('Test Content', 'Description', 'hash123', 'performance', 300)
    const result = publishContent(1)
    expect(result).toEqual({ ok: true })
    const content = contentMap.get(1)
    expect(content.isPublished).toBe(true)
  })
  
  it('should fail to publish non-existent content', () => {
    const result = publishContent(999)
    expect(result).toEqual({ error: 404 })
  })
  
  it('should transfer rights successfully', () => {
    createContent('Test Content', 'Description', 'hash123', 'performance', 300)
    const result = transferRights(1, 'new-owner', 'non-exclusive', 10, null)
    expect(result).toEqual({ ok: true })
    const rights = contentRightsMap.get(1)
    expect(rights.owner).toBe('new-owner')
    expect(rights.licenseType).toBe('non-exclusive')
    expect(rights.royaltyPercentage).toBe(10)
  })
  
  it('should get content successfully', () => {
    createContent('Test Content', 'Description', 'hash123', 'performance', 300)
    const result = getContent(1)
    expect(result.ok).toBeDefined()
    expect(result.ok.title).toBe('Test Content')
  })
  
  it('should get content rights successfully', () => {
    createContent('Test Content', 'Description', 'hash123', 'performance', 300)
    const result = getContentRights(1)
    expect(result.ok).toBeDefined()
    expect(result.ok.owner).toBe('tx-sender')
    expect(result.ok.licenseType).toBe('exclusive')
  })
})

