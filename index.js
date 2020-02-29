require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/User')
const taskRouter = require('./routers/Task')

const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})