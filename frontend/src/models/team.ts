import type { Specialization } from "./specialization";

export class Team {
    constructor(
        public readonly id: number,
        public project: string,
        public specialization: Specialization,
        public members: string[]
    ) {}
}
