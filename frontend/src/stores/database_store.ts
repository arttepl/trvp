import { type Ref, ref } from 'vue'
import { Mentor } from '../models/mentor'
import { use_notification } from './notification_store'
import { Team } from '../models/team'
import type { Specialization } from '../models/specialization'
import { create, delete_, read, update } from '../utils'

const mentors_db: Ref<Set<number>> = ref(new Set())

const { show } = use_notification()

async function reload_store() {
    mentors_db.value.clear()
    await read<number[]>('/api/mentor/')
        .then(it => mentors_db.value = new Set(it))
        .catch(e => show(`Невозможно подключиться к серверу: ${e}`, true))
}

reload_store().then()

export function use_database() {
    return {
        mentors: mentors_db,

        async add_mentor(fullname: string, specialization: Specialization) {
            const { id } = await create('/api/mentor/', { fullname, specialization })
            mentors_db.value.add(id)
            return new Mentor(fullname, specialization, [], id)
        },
        async get_mentor_by_id(id: number) {
            return await read<Mentor>(`/api/mentor/${id}`)
        },
        async remove_mentor_by_id(id: number) {
            mentors_db.value.delete(id)
            await delete_(`/api/mentor/${id}`)
        },
        async update_mentor({ fullname, id, specialization }: Mentor) {
            await update(`/api/mentor/${id}`, { fullname, specialization })
        },
        async add_team(mentor_id: number, members: string[], project: string, specialization: Specialization) {
            const { id } = await create(`/api/mentor/${mentor_id}/team`, {
                project, members, specialization
            })
            return new Team(id, project, specialization, members)
        },
        async remove_team_by_id(mentor_id: number, team_id: number) {
            await delete_(`/api/mentor/${mentor_id}/team/${team_id}`)
        },
        async update_team(mentor_id: number, { id, members, project, specialization }: Team) {
            await update(`/api/mentor/${mentor_id}/team/${id}`, { project, specialization })
            await create(`/api/mentor/${mentor_id}/team/${id}/members`, { members })
        },
        async get_team_by_id(mentor_id: number, team_id: number) {
            return await read<Team>(`/api/mentor/${mentor_id}/team/${team_id}`)
        },
        reload_store
    }
}