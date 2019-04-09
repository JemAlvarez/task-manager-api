// const app = require('./app')
const express = require('express')
require('./db/mongoose')
const cors = require('cors')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})