import { Express } from 'express'
import { Member, Mentor, Team, TeamMembers } from './database'

const not_found_msg = {
    message: 'Not Found'
}

const ok_msg = {
    message: 'Ok'
}

const created = (id: number) => {
    return { message: 'Ok', id }
}

export default function routes(app: Express) {
    app.get('/api/mentor', async (_, res) => {
        const mentors = await Mentor.findAll({
            attributes: {
                include: ['id']
            }
        })
        res.json(mentors.map(it => it.id))
    })

    app.get('/api/mentor/:id', async (req, res) => {
        const mentor = await Mentor.findByPk(req.params.id, { include: [Team] })
        if (mentor === null)
            return res.status(404).json(not_found_msg)

        res.json(mentor)
    })

    app.get('/api/mentor/:id/team', async (req, res) => {
        const teams = await Team.findAll({
            where: {
                MentorId: req.params.id
            },
            attributes: ['id']
        })
        return res.json(teams)
    })

    app.get('/api/mentor/:id/team/:team_id', async (req, res) => {
        const team = await Team.findByPk(req.params.team_id, {
            include: [Member]
        })
        if (team === null)
            return res.status(404).json(not_found_msg)

        return res.json({
            id: team.id,
            project: team.project,
            specialization: team.specialization,
            members: team.members.map(it => it.fullname)
        })
    })

    app.delete('/api/mentor/:id', async (req, res) => {
        await Mentor.destroy({
            where: { id: req.params.id }
        })
        res.json(ok_msg)
    })

    app.delete('/api/mentor/:id/team/:team_id', async (req, res) => {
        await Team.destroy({
            where: { id: req.params.team_id },
            cascade: true
        })
        res.json(ok_msg)
    })

    app.post('/api/mentor', async (req, res) => {
        try {
            const mentor = await Mentor.create(req.body)
            return res.json(created(mentor.id))
        } catch (ex) {
            return res.status(400).json({ message: ex })
        }
    })

    app.patch('/api/mentor/:id', async (req, res) => {
        try {
            const mentor = await Mentor.findByPk(req.params.id)
            if (mentor === null) return res.json(not_found_msg)
            await mentor.update(req.body)
            await mentor.save()
            await Team.update({ specialization: mentor.specialization }, {
                where: { MentorId: mentor.id }
            })
            res.json(ok_msg)
        } catch (ex) {
            res.status(400).json({ message: ex })
        }
    })

    app.post('/api/mentor/:id/team', async (req, res) => {
        const { members, ...data } = req.body
        const members_array: string[] = members
        try {
            const team = await Team.create({
                MentorId: req.params.id,
                ...data
            })
            for (let member of members_array) {
                const [mem, _] = await Member.findCreateFind({
                    where: {
                        fullname: member
                    }
                })
                await TeamMembers.findOrCreate({
                    where: {
                        TeamId: team.id,
                        MemberId: mem.id
                    }
                })
            }
            return res.json(created(team.id))
        } catch (ex) {
            return res.status(400).json({ message: ex })
        }
    })

    app.delete('/api/mentor/:mentor_id/team/:id', async (req, res) => {
        await Team.destroy({
            where: {
                id: req.params.id
            },
            cascade: true
        })
        return res.json(ok_msg)
    })

    app.patch('/api/mentor/:mentor_id/team/:id', async (req, res) => {
        try {
            const team = await Team.findByPk(req.params.id)
            await team?.update(req.body)
            await team?.save()
            res.json(ok_msg)
        } catch (ex) {
            res.status(400).json({ message: ex })
        }
    })

    app.post('/api/mentor/:mentor_id/team/:id/members', async (req, res) => {
        const { members }: { members: string[] } = req.body
        console.log(members)
        await TeamMembers.destroy({
            where: {
                TeamId: req.params.id
            }
        })
        for (let member of members) {
            const [mem, _] = await Member.findCreateFind({
                where: {
                    fullname: member
                }
            })
            await TeamMembers.findOrCreate({
                where: {
                    TeamId: req.params.id,
                    MemberId: mem.id
                }
            })
        }
    })
}
