import { INTEGER, STRING } from 'sequelize'
import { properties } from './const'
import { BelongsToMany, Column, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript'

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: properties.database.source,
    password: properties.database.password
})

@Table({ timestamps: false })
export class Mentor extends Model<Mentor> {
    @Column({
        allowNull: false,
        type: STRING(64)
    })
    declare fullname: string

    @Column({
        allowNull: false,
        type: STRING(10)
    })
    declare specialization: string

    @HasMany(() => Team)
    declare teams: Team[]
}

@Table({ timestamps: false })
export class Team extends Model<Team> {
    @Column({
        allowNull: false,
        type: STRING(64)
    })
    declare project: string

    @Column({
        allowNull: false,
        type: STRING(10)
    })
    declare specialization: string

    @ForeignKey(() => Mentor)
    @Column({
        allowNull: false,
        type: INTEGER
    })
    declare MentorId: number

    @BelongsToMany(() => Member, () => TeamMembers)
    declare members: Member[]
}

@Table({ timestamps: false })
export class Member extends Model<Member> {
    @Column({
        allowNull: false,
        unique: true,
        type: STRING(64)
    })
    declare fullname: string

    @BelongsToMany(() => Team, () => TeamMembers)
    declare teams: Team[]
}

@Table({ timestamps: false })
export class TeamMembers extends Model<TeamMembers> {
    @ForeignKey(() => Member)
    @Column({
        allowNull: false,
        type: INTEGER
    })
    declare MemberId: number

    @ForeignKey(() => Team)
    @Column({
        allowNull: false,
        type: INTEGER
    })
    declare TeamId: number
}

sequelize.addModels([Mentor, Team, Member, TeamMembers])