const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token, 'raiden_hasan')
        const user = await User.findOne({_id:decode._id, 'tokens.token':token})
        if(!user){
            throw new Error ('Authentication failed!')
        }
        req.user = user
        req.token = token
        next()
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports = auth