<script setup lang="ts">
import { use_database } from '../stores/database_store'
import { use_notification } from '../stores/notification_store'
import type { Team } from '../models/team'
import { reactive, ref } from 'vue'
import { Mentor } from '../models/mentor'
import { type Specialization, SpecializationValues } from '../models/specialization'

type State = 'button' | 'editing'
type Event = 'add' | 'save' | 'cancel'

const db = use_database()
const { show } = use_notification()

const props = defineProps({
    mentor: { type: Mentor, required: true }
})

const emit = defineEmits<{ (e: 'saved', value: Team): void, (e: 'invalid'): void }>()
const state = ref<State>('button')
let object = reactive({
    project: '',
    spec: undefined as Specialization | undefined,
    members: [] as string[] | string
})

function validate(): [false, string] | true {
    if (object.project.trim() === '')
        return [false, 'Ошибка! Название проекта не должно быть пустым']
    if (object.spec === undefined)
        return [false, 'Выберите направление']
    if (object.spec !== props.mentor.specialization)
        return [false, 'Выбранное направление не совпадает со специализацией наставника']
    if (typeof object.members === 'string')
        object.members = object.members.split(',')
    if (object.members.length === 0 || (object.members.length === 1 && object.members[0] === ''))
        return [false, 'Внимание! В команде отсутствуют участники']
    return true
}

function send(event: Event) {
    switch (event) {
        case 'add':
            this.state = 'editing'
            break
        case 'save':
            (async () => {
                const validated = validate()
                if (validated !== true) {
                    emit('invalid')
                    show(validated[1], true)
                } else {
                    const team = await db.add_team(props.mentor.id, object.members as string[], object.project, object.spec)
                    object = {
                        project: '',
                        spec: undefined,
                        members: []
                    }
                    emit('saved', team)
                    state.value = 'button'
                }
            })()
            break
        case 'cancel':
            this.object = {
                project: '',
                spec: '',
                members: []
            }
            this.state = 'button'
            break
    }
}
</script>

<template>
    <div class="card">
        <div class="card-header has-background-info-dark">
            <div class="card-header-title has-text-white">Добавить проект</div>
            <img class="card-header-icon"
                 src="../assets/icons/icons8-plus-24.png"
                 alt="plus"
                 v-show="state === 'button' && props.mentor.teams.length <= 4"
                 @click="send('add')"
            >
        </div>
        <div class="card-content" v-show="state === 'editing'">
            <div class="columns is-mobile is-align-items-center">
                <div class="column">
                    <p>Название проекта:</p>
                </div>
                <div class="column">
                    <input type="text" class="input" v-model="object.project">
                </div>
            </div>
            <div class="columns is-mobile">
                <div class="column">
                    <p>Направление:</p>
                </div>
                <div class="column">
                    <div class="select">
                        <select v-model="object.spec">
                            <option selected value="" disabled>Выбрать</option>
                            <option v-for="spec in SpecializationValues()" :key="spec">
                                {{ spec }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="columns is-mobile">
                <div class="column">
                    <p>Участники проекта:</p>
                </div>
                <div class="column">
                    <textarea v-model="object.members" class="w-100 input"></textarea>
                </div>
            </div>
        </div>
        <div class="card-footer" v-show="state === 'editing'">
            <a @click="send('save')" class="card-footer-item">Сохранить</a>
            <a @click="send('cancel')" class="card-footer-item">Отменить</a>
        </div>
    </div>
</template>

<style scoped>
.w-100 {
    max-width: 100%;
    min-width: 100%;
    resize: vertical;
}
</style>