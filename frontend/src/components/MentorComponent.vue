<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script lang="ts">
import type { Mentor } from '../models/mentor'
import { defineComponent } from 'vue'
import { use_database } from '../stores/database_store'
import { SpecializationValues } from '../models/specialization'

type State = 'loading' | 'unloaded' | 'expanded' | 'editing' | 'collapsed'
type Event = 'load' | 'edit' | 'save' | 'cancel' | 'expand' | 'collapse' | 'select'

const db = use_database()

export default defineComponent({
    props: {
        mentor_id: { type: Number, required: true },
        max_amount: { type: Number, default: 5 }
    },
    emits: {
        selected: (_mentor: Mentor) => true,
        deleted: (_mentor: Mentor) => true
    },
    async mounted() {
        this.mentor = await db.get_mentor_by_id(this.mentor_id)
        this.send('load')
    },
    methods: {
        SpecializationValues,
        send(event: Event) {
            switch (event) {
                case 'load':
                    this.state = 'collapsed'
                    break
                case 'edit':
                    this.state = 'editing'
                    break
                case 'save':
                    db.update_mentor(this.mentor)
                        .then(_ => this.state = 'expanded')
                    break
                case 'cancel':
                    db.get_mentor_by_id(this.mentor_id)
                        .then(m => this.mentor = m)
                        .then(_ => this.state = 'expanded')
                    break
                case 'expand':
                    this.state = 'expanded'
                    break
                case 'collapse':
                    this.state = 'collapsed'
                    break
                case 'select':
                    this.$emit('selected', this.mentor)
                    break
            }
        },
        trigger_header() {
            if (this.state === 'expanded')
                this.send('collapse')
            else if (this.state === 'collapsed')
                this.send('expand')
        }
    },
    data() {
        return {
            mentor: undefined as Mentor | undefined,
            state: 'unloaded' as State
        }
    }
})
</script>

<template>
    <progress class="progress" v-if="state === 'unloaded'"></progress>
    <div class="card" v-else>
        <div class="card-header has-background-dark">
            <div class="card-header-title has-text-light" v-if="state !== 'editing'">
                {{ mentor!.fullname }}
            </div>
            <div class="card-header-title has-text-light" v-else>
                <input class="input" type="text" v-model="mentor!.fullname" />
            </div>
            <img
                @click="trigger_header"
                src="../assets/icons/icons8-expand-arrow-24.png"
                class="card-header-icon my-auto"
                alt="arrow down"
                v-show="state === 'collapsed' || state === 'expanded'"
            />
        </div>
        <div class="card-content" v-if="state !== 'collapsed'">
            <div>
                <div class="columns is-mobile">
                    <div class="column">
                        <p>Специализация:</p>
                    </div>
                    <div class="column has-text-right" v-if="state == 'expanded'">
                        <p>{{ mentor!.specialization }}</p>
                    </div>
                    <div v-else>
                        <div class="select">
                            <select v-model="mentor.specialization">
                                <option v-for="spec in SpecializationValues()" :key="spec">
                                    {{ spec }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="columns is-mobile">
                    <div class="column">
                        <p v-if="state == 'expanded'">Количество команд:</p>
                    </div>
                    <div class="column has-text-right" v-if="state === 'expanded'">
                        <p>{{ mentor!.teams.length }} / {{ max_amount }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer" v-if="state == 'expanded'">
            <a @click="send('select')" class="card-footer-item">Выбрать</a>
            <a @click="send('edit')" class="card-footer-item">Изменить</a>
            <a @click="$emit('deleted', mentor!)" class="card-footer-item">Удалить</a>
        </div>
        <div class="card-footer" v-else-if="state == 'editing'">
            <a @click="send('save')" class="card-footer-item">Сохранить</a>
            <a @click="send('cancel')" class="card-footer-item">Отменить</a>
        </div>
    </div>
</template>
