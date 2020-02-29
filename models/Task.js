const mongoose = require('mongoose')

const taskSchmema = new mongoose.Schema({
    description: {
        type: String,
        require: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
        ref: 'User'
    }
},
{
    timestamps: true
})

const Task = mongoose.model('Task', taskSchmema)

module.exports = Task