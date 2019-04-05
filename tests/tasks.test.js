const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOne, userTwo, taskOne, setUpDb } = require('./fixtures/db')

beforeEach(setUpDb)

test('should create task for user', async () => {
    const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Test suit task'
        })
        .expect(201)

    const task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()
})

test('should get tasks for user one', async () => {
    const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res.body.tasks.length).toBe(2)
})

test('should not delete first task from user two', async () => {
    const res = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})