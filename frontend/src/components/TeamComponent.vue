<script lang="ts">
import { defineComponent } from 'vue'
import { use_database } from '../stores/database_store'
import { use_notification } from '../stores/notification_store'
import { Team } from '../models/team'
import { SpecializationValues } from '../models/specialization'
import { Mentor } from '../models/mentor'

type State = 'loading' | 'viewing' | 'editing'
type Event = 'edit' | 'save' | 'cancel' | 'load' | 'remove'

const db = use_database()
const { show } = use_notification()

export default defineComponent({
    props: {
        mentor_id: { type: Number, required: true },
        team_id: { type: Number, required: true }
    },
    emits: ['saved', 'invalid', 'deleted', 'moved'],
    async mounted() {
        this.team = await db.get_team_by_id(this.mentor_id, this.team_id)
        for (const id of db.mentors.value) {
            this.names.push([id, (await db.get_mentor_by_id(id)).fullname])
        }
        this.send('load')
    },
    data() {
        return {
            state: 'viewing' as State,
            team: undefined as Team | undefined,
            target_mentor_id: this.mentor_id,
            names: [] as [number, string][]
        }
    },
    methods: {
        SpecializationValues,
        send(event: Event) {
            switch (event) {
                case 'edit':
                    this.state = 'editing'
                    break
                case 'save':
                    (async () => {
                        const target_mentor = await db.get_mentor_by_id(this.target_mentor_id)
                        const validation: true | [false, string] = this.validate(target_mentor)
                        if (validation === true) {
                            if (this.target_mentor_id !== this.mentor_id) {
                                await db.remove_team_by_id(this.mentor_id, this.team_id)
                                await db.add_team(this.target_mentor_id, this.team.members, this.team.project, this.team.specialization)
                                this.$emit('moved')
                            } else {
                                await db.update_team(this.mentor_id, this.team)
                                this.$emit('saved')
                            }
                        } else {
                            show(validation[1], true)
                            this.$emit('invalid')
                        }
                    })()
                    break
                case 'cancel':
                    db.get_team_by_id(this.mentor_id, this.team_id)
                        .then(t => this.team = t)
                        .then(_ => this.state = 'viewing')
                    break
                case 'load':
                    this.state = 'viewing'
                    break
                case 'remove':
                    db.remove_team_by_id(this.mentor_id, this.team_id)
                        .then(_ => this.$emit('deleted'))
                    break
            }
        },
        validate(target_mentor: Mentor): [false, string] | true {
            if (this.team.project.trim() === '')
                return [false, 'Название проекта не должно быть пустым']
            if (this.team.members instanceof String) // textarea changes array to plain string
                this.team.members = this.team.members.split(',')
            if (this.team.members.length === 0)
                return [false, 'Должен быть хотя бы один человек в команде']
            if (this.team.members.length === 1 && this.team.members[0] === '')
                return [false, 'Должен быть хотя бы один человек в команде']
            if (this.team.specialization !== target_mentor.specialization)
                return [false, 'Направление команды и наставника не совпадают']
            return true
        }
    }
})
</script>

<template>
    <div class="card" draggable="true" v-if="team !== undefined">
        <div class="card-header has-background-dark">
            <div class="card-header-title has-text-light" v-if="state === 'viewing'">
                Проект: «{{ team.project }}»
            </div>
            <div class="card-header-title has-text-light" v-else>
                <input class="input" v-model="team.project">
            </div>
        </div>
        <div class="card-content">
            <div>
                <div class="columns is-mobile">
                    <div class="column">
                        <p>Направление:</p>
                    </div>
                    <div class="column has-text-right" v-if="state === 'viewing'">
                        <p>{{ team.specialization }}</p>
                    </div>
                    <div class="column has-text-light" v-else-if="state === 'editing'">
                        <div class="select">
                            <select v-model="team.specialization">
                                <option disabled selected value="">Выбрать</option>
                                <option v-for="spec in SpecializationValues()" :key="spec">{{ spec }}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="columns is-mobile">
                    <div class="column">
                        <p>Участники проекта:</p>
                    </div>
                    <div class="column has-text-right" v-if="state === 'viewing'">
                        <li v-for="member in team.members" :key="member">{{ member }}</li>
                    </div>
                    <div v-else class="column">
                        <textarea class="w-100 input" v-model="team.members"></textarea>
                    </div>
                </div>
            </div>
            <div>
                <div class="columns is-mobile" v-if="state === 'editing'">
                    <div class="column">Переместить к:</div>
                    <div class="column">
                        <div class="select">
                            <select v-model="target_mentor_id">
                                <option selected disabled>Выбрать</option>
                                <option v-for="name in names" :key="name[0]" :value="name[0]">{{ name[1] }}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer" v-if="state === 'viewing'">
            <a @click="send('edit')" class="card-footer-item">Изменить</a>
            <a @click="send('remove')" class="card-footer-item">Удалить</a>
        </div>
        <div class="card-footer" v-else>
            <a @click="send('save')" class="card-footer-item">Сохранить</a>
            <a @click="send('cancel')" class="card-footer-item">Отменить</a>
        </div>
    </div>
</template>

<style scoped>
.w-100 {
    max-width: 100%;
    min-width: 100%;
    width: 100%;
    resize: vertical;
    height: auto;
}
</style>