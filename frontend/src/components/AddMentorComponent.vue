<script setup lang="ts">
import { reactive, ref } from 'vue'
import { use_database } from '../stores/database_store'
import { use_notification } from '../stores/notification_store'
import { Mentor } from '../models/mentor'
import { type Specialization, SpecializationValues } from '../models/specialization'

type State = 'button' | 'editing'
type Event = 'add' | 'save' | 'cancel'

const db = use_database()
const { show } = use_notification()

const emit = defineEmits<{ (e: 'saved', value: Mentor): void, (e: 'invalid'): void }>()
const state = ref<State>('button')
const object = reactive({
    fullname: '',
    specialization: 'Биоинженерия' as Specialization
})

function send(event: Event) {
    switch (event) {
        case 'add':
            this.state = 'editing'
            break
        case 'save':
            (async () => {
                const validation = validate()
                if (validation === true) {
                    const team = await db.add_mentor(object.fullname, object.specialization)
                    this.object = {
                        fullname: '',
                        spec: ''
                    }
                    emit('saved', team)
                    this.state = 'button'
                } else {
                    emit('invalid')
                    show(validation[1], true)
                }
            })()
            break
        case 'cancel':
            this.object = {
                fullname: '',
                spec: ''
            }
            this.state = 'button'
            break
    }
}

function validate(): [false, string] | true {
    if (object.fullname.trim() === '')
        return [false, 'Имя куратора должно быть в формате ФИО']
    return true
}
</script>

<template>
    <div class="card">
        <div class="card-header has-background-primary-dark">
            <div class="card-header-title has-text-light">Добавить куратора</div>
            <img class="card-header-icon"
                 src="../assets/icons/icons8-plus-24.png"
                 alt="plus"
                 v-show="state === 'button'"
                 @click="send('add')"
            />
        </div>
        <div class="card-content" v-show="state === 'editing'">
            <div>
                <div class="columns is-mobile is-align-items-center">
                    <div class="column">
                        <p>Имя:</p>
                    </div>
                    <div class="column">
                        <input class="input" v-model="object.fullname">
                    </div>
                </div>
            </div>
            <div>
                <div class="columns is-mobile">
                    <div class="column">
                        <p>Направление:</p>
                    </div>
                    <div class="column">
                        <div class="select">
                            <select v-model="object.specialization">
                                <option v-for="spec in SpecializationValues()" :key="spec">
                                    {{ spec }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer" v-show="state === 'editing'">
            <a @click="send('save')" class="card-footer-item">Сохранить</a>
            <a @click="send('cancel')" class="card-footer-item">Отменить</a>
        </div>
    </div>
</template>
