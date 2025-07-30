import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'
import config from './../config.js'

const sendMail = async({from, to, subject, data, templateEmail, attachments = []}) => {
  const transporter = nodemailer.createTransport({
    host: config.hostEmailSupport,
    port: config.portEmailSupport,
    secure: false, // false para puerto 587, true para 465
    auth: {
      user: config.emailSupport,
      pass: config.passSupport
    }
  })

  transporter.use('compile', hbs({
    viewEngine: {
      extname: '.hbs',
      partialsDir: path.resolve('./emails'),
      defaultLayout: false
    },
    viewPath: path.resolve('./emails'),
    extName: '.hbs'
  }))

  try {
    const sendedEmail = await transporter.sendMail({
      from,
      to,
      subject,
      template: templateEmail,
      context: data,
      attachments
    })



    return {
      success: true,
      message: 'Email enviado',
      info: sendedEmail
    }

  } catch (error) {

    return {
      success: false,
      message: 'Falla al enviar correo',
      error: error.message
    }
  }
}

export { sendMail }
