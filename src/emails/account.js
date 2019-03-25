const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'contact@jemalvarez.com',
        subject: 'Thanks for signing up.',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app. Sincerely, Jem Alvarez`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'contact@jemalvarez.com',
        subject: 'Sorry to see you go.',
        text: 'We\'re sorry to see you go. Is there anything we can do to improve our service? -- Jem Alvarez'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}