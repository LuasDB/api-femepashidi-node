import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import config from '../config.js'


const sendMail = async({from, to, subject, data, templateEmail, attachments = []}) => {
  const resend = new Resend(config.apiKeyResend)
  const filePath = path.join("emails", `${templateEmail}.hbs`);
  const source = fs.readFileSync(filePath, "utf-8");
  const template = Handlebars.compile(source);

  const html = template(templateEmail,data)

  try {
    const response = await resend.emails.send({
      from:'registros@femepashidi.com.mx',
      to,
      subject,
      html
    })
     console.log("Email enviado:", response);


    return {
      success: true,
      message: 'Email enviado',
      info: response
    }
  } catch (error) {
    console.error("Error enviando correo:", error)
    throw error
  }
}

export {sendMail}
