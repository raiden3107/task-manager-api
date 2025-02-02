const express = require('express')
const Task = require('../models/Task')
const auth = require('../auth/auth')

const router = express.Router()

router.post('/tasks', auth, async (req,res) => {
    const task = new Task ({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(200).send(task)
    } catch (e) {
        res.status(501).send(e)
    }
})

router.get('/tasks', auth, async(req,res) => {
    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(404).send(e)
    }
})

router.get('/tasks/:id', auth, async (req,res) => {
    try {
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})
        res.status(200).send(task)
    } catch (e) {
        res.status(404).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req,res) => {
    const allowed = ['description','completed']
    const updates = Object.keys(req.body)
    const isValid = updates.every((update) => allowed.includes(update))
    if(!isValid){
        return res.status(404).send({'error':'Invalid Parameters'})
    }
    try {
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.status(200).send(task)
    } catch (e) {
        res.status(501).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        res.status(200).send(task)
    } catch (e) {
        res.status(501).send(e)
    }
})


module.exports = router