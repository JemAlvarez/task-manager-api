const app = require('./app')

app.listen(port, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})