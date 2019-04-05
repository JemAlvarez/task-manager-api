const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, setUpDb } = require('./fixtures/db')

beforeEach(setUpDb)

test('should sign up new user', async () => {
    const res = await request(app)
        .post('/users')
        .send({
            name: 'Jem',
            email: 'jem@example.com',
            password: 'Jem22@@'
        })
        .expect(201)

    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    expect(res.body).toMatchObject({
        user: {
            name: 'Jem',
            email: 'jem@example.com'
        },
        token: user.tokens[0].token
    })
})

test('should login existing user', async () => {
    const res = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    const user = await User.findById(res.body.user._id)
    expect(user.tokens[1].token).toBe(res.body.token)
})

test('should not login nonexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'blah@example.com',
            password: 'BlahBlah123'
        })
        .expect(400)
})

test('should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('should delete account for user', async () => {
    const res = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('should upload avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Mike'
        })
        .expect(200)
})

test('should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            tokens: 'HEY'
        })
        .expect(400)
})
