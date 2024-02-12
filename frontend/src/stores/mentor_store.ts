import { Mentor } from '../models/mentor'
import { ref } from 'vue'
import { use_database } from './database_store'

const db = use_database()

export function use_store() {
    const selected_mentor = ref<Mentor | undefined>(undefined)

    return {
        selected_mentor,

        async select_mentor(id: number) {
            this.selected_mentor.value = await db.get_mentor_by_id(id)
        }
    }
}