const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// create
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (err) {
        res.status(400).send(err)
    }
})

// read
// GET /tasks?completed=true
// GET /tasks?limit=10&page=2
// GET /tasks?sortBy=createdAt_asc/desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    const filter = { owner: req.user._id }

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
        filter.completed = match.completed
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    const tasksNum = await Task.countDocuments(filter, (err, count) => count)

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: (parseInt(req.query.pageNum) - 1) * parseInt(req.query.limit),
                sort
            }
        }).execPopulate()
        res.send({
            pages: Math.ceil(tasksNum / req.query.limit),
            pageNum: req.query.pageNum,
            tasksNum,
            tasks: req.user.tasks
        })
    } catch (err) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (err) {
        res.status(500).send()
    }
})

// update
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOp = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOp) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (err) {
        res.status(400).send(err)
    }
})

// delete
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (err) {
        res.status(500).send()
    }
})

module.exports = router