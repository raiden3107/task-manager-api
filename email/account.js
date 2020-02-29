const sgMail = require('@sendgrid/mail')
const apiKey = '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'
sgMail.setApiKey(apiKey)

const sendWelcome = (email,name) => {
    sgMail.send({
        to:email,
        from: 'hasan.nadeem97@hotmail.com',
        subject: 'Thanks for joining!',
        text: `Welcome to the Task App, ${name}. Hope you get along well with this app.`
    })
}

const sendCancel = (email,name) => {
    sgMail.send({
        to:email,
        from: 'hasan.nadeem97@hotmail.com',
        subject: 'Sorry to see you go.',
        text: `Goodbye, ${name}. Hope to see you soon sometime.`
    })
}

module.exports = {
    sendWelcome,
    sendCancel
}