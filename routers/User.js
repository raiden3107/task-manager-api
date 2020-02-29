const User = require('../models/User')
const express = require('express')
const auth = require('../auth/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcome, sendCancel } = require('../email/account')

const router = express.Router()

router.post('/users', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcome(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (e) {
        res.status(502).send(e)
    }
})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    } catch (e) {
        res.status(404).send(e)
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logoutall', auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/me', auth, async (req,res) => {
    res.status(200).send(req.user)
})

router.patch('/users/me', auth, async (req,res) => {
    const allowed = ['name','email','password','age']
    const updates = Object.keys(req.body)
    const isValid = updates.every((update) => allowed.includes(update))
    if(!isValid){
        return res.status(501).send({'error':'Invalid Parameters!'})
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(201).send(req.user)
    } catch (e) {
        res.status(501).send(e)
    }
})

router.delete('/users/me',auth, async (req,res) => {
    try {
        await req.user.remove()
        sendCancel(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (e) {
        res.status(501).send(e)
    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('invalid file type!'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/me/:id/avatar', async (req,res) => {
    const user = await User.findById(req.params.id)
    if(!user || !user.avatar){
        return res.status(404).send()
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
})

module.exports = router