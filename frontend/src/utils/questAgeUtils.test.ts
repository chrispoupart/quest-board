import { getQuestAgeReference, getQuestAgeDots } from './questAgeUtils'
import { Quest } from '../types'

describe('getQuestAgeReference', () => {
  it('returns createdAt for non-repeatable quests', () => {
    const quest: Quest = { id: 1, createdAt: '2024-01-01T00:00:00Z', isRepeatable: false } as any
    expect(getQuestAgeReference(quest)).toBe('2024-01-01T00:00:00Z')
  })
  it('returns lastCompletedAt for repeatable quests if present', () => {
    const quest: Quest = { id: 2, createdAt: '2024-01-01T00:00:00Z', lastCompletedAt: '2024-02-01T00:00:00Z', isRepeatable: true } as any
    expect(getQuestAgeReference(quest)).toBe('2024-02-01T00:00:00Z')
  })
  it('returns createdAt for repeatable quests if lastCompletedAt is missing', () => {
    const quest: Quest = { id: 3, createdAt: '2024-01-01T00:00:00Z', isRepeatable: true } as any
    expect(getQuestAgeReference(quest)).toBe('2024-01-01T00:00:00Z')
  })
})

describe('getQuestAgeDots', () => {
  const now = new Date('2024-07-10T00:00:00Z')
  const makeQuest = (daysAgo: number): Quest => ({
    id: daysAgo,
    createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    isRepeatable: false,
  } as any)

  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(now)
  })
  afterAll(() => {
    vi.useRealTimers()
  })

  it('returns 0 dots for 0-3 days', () => {
    expect(getQuestAgeDots(makeQuest(0))).toBe(0)
    expect(getQuestAgeDots(makeQuest(1))).toBe(0)
    expect(getQuestAgeDots(makeQuest(3))).toBe(0)
  })
  it('returns 1 dot for >3 and <=7 days', () => {
    expect(getQuestAgeDots(makeQuest(4))).toBe(1)
    expect(getQuestAgeDots(makeQuest(7))).toBe(1)
  })
  it('returns 2 dots for >7 and <=10 days', () => {
    expect(getQuestAgeDots(makeQuest(8))).toBe(2)
    expect(getQuestAgeDots(makeQuest(10))).toBe(2)
  })
  it('returns 3 dots for >10 and <=14 days', () => {
    expect(getQuestAgeDots(makeQuest(11))).toBe(3)
    expect(getQuestAgeDots(makeQuest(14))).toBe(3)
  })
  it('returns 4 dots for >14 days', () => {
    expect(getQuestAgeDots(makeQuest(15))).toBe(4)
    expect(getQuestAgeDots(makeQuest(30))).toBe(4)
  })
})
