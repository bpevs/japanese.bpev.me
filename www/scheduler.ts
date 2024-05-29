import { Scheduler } from 'jsr:@flashcard/core@0.0.3'

export interface ScheduleCache {
  repetition: number
}

type Quality = 0 | 1

export default new Scheduler<ScheduleCache, Quality>({
  name: 'infini-sched',

  // Ensure that repetition is an int
  init(s: ScheduleCache = { repetition: 0 }) {
    return { repetition: s.repetition || 0 }
  },

  // It's infinite.
  filter({ _repetition = 0 }: ScheduleCache) {
    return true
  },

  // Sort by least-repeated. If they are the same, then sort randomly!
  sort(sA: ScheduleCache, sB: Scheduler): number {
    return (sA.repetition - sB.repetition) || (Math.random() - 0.5)
  },

  // If answered correctly, increment the repetition
  update({ repetition }: ScheduleCache, quality: Quality) {
    return { repetition: quality ? repetition + 1 : repetition }
  },
})
