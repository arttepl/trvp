import type { Specialization } from './specialization'

export class Mentor {
    constructor(
        public fullname: string,
        public specialization: Specialization,
        public teams: number[],
        public readonly id: number
    ) {
    }
}
