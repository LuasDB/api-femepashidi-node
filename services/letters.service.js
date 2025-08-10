import Boom from "@hapi/boom";
import { db } from "../db/mongoClient.js";
import { ObjectId } from "mongodb";
import { sendMail } from './../utils/sendMail.js';
import config from "../config.js";
import fs from 'fs';
import path from 'path';
import * as fontkit from 'fontkit';


import { PDFDocument, rgb } from 'pdf-lib';
import fsP from 'fs/promises';

function formatearFecha(date) {
  const meses = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  console.log("Fecha original:", date);
  const newDate = new Date(date);
  console.log("Fecha interpretada por new Date:", newDate);

  const dia = newDate.getUTCDate();
  const mes = meses[newDate.getUTCMonth()];
  const año = newDate.getUTCFullYear();
  console.log("Fecha formateada:", `${dia}-${mes}-${año}`);

  return `${dia}-${mes}-${año}`;
}
function edadAJulio(fecha){
  const fechaNac = new Date(fecha);
  const fechaActual = new Date();
  const añoActual = fechaActual.getFullYear();
  const mesActual = fechaActual.getMonth() + 1; // Meses van de 0 a 11
  let edad = añoActual - fechaNac.getFullYear();
  if (mesActual < 7 || (mesActual === 7 && fechaActual.getDate() < 1)) {
    edad--;
  }

  return edad;
}
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


async function modificarPDF({ letter }) {
  try {
    // Leer el archivo PDF original
    const pdfBytes = await fsP.readFile('./scripts/machote.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);

    // Obtener la primera página del documento
    const page = pdfDoc.getPage(0);
    console.log('Iniciado')

    // Fecha
    const fecha = new Date();

    page.drawText(`Mexico City,Mexico ${formatearFecha(fecha)}`, {
      x: 360,
      y: page.getHeight() - 120,
      size: 14,
      color: rgb(0, 0, 0),
    });
    const fontBytes = await fsP.readFile('./scripts/RobotoMono-Bold.ttf')
    const font = await pdfDoc.embedFont(fontBytes);
     // Texto a centrar
     const texto = `${capitalizeFirstLetter(letter.user.nombre)} ${letter.user.apellido_paterno.toUpperCase()} ${letter.user.apellido_materno.toUpperCase()}`

     // Calcular el ancho del texto en la fuente y el tamaño de fuente dado
     const textSize = font.widthOfTextAtSize(texto, 13);

     // Obtener el ancho de la página
     const pageWidth = page.getWidth();

     // Calcular la posición x para centrar el texto
     const xPos = (pageWidth - textSize) / 2;
    page.drawText(texto, {
      x: xPos+30,
      y: page.getHeight() - 210,
      size: 15,
      color: rgb(0, 0, 0),
      font: font
    });


    page.drawText(letter.user.asociacion.nombre, {
      x: 150,
      y: page.getHeight() - 272,
      size: 13,
      color: rgb(0, 0, 0),
      font:font

    });

    let renglon=20

    page.drawText(`Therefore, ${letter.user.sexo==='MASCULINO'?'he':'she'} has the necessary authorization to participate`, {
      x: 150,
      y: page.getHeight() - 315 -renglon,
      size: 15,
      color: rgb(0, 0, 0)
    });
    page.drawText(`in the following event:`, {
      x: 150,
      y: page.getHeight() - 330 -renglon,
      size: 15,
      color: rgb(0, 0, 0)
    });
    //Table
    let xData = 190
    let yLine = 360+renglon
    let carriet = 25

    page.drawText(`${letter.nombreCompetencia.toUpperCase()}`, {
      x: xData ,
      y: page.getHeight() - yLine,
      size: 12,
      color: rgb(0, 0, 0),
      font:font
    });
    yLine=yLine+carriet

    page.drawText(`${letter.domicilioCompetencia.toUpperCase()}`, {
      x: xData,
      y: page.getHeight() - yLine,
      size: 12,
      color: rgb(0, 0, 0)
    });
    yLine=yLine+carriet

    const fechaI=new Date(letter.fechaInicialCompetencia)
    const fechaF=new Date(letter.fechaFinalCompetencia)
    page.drawText(`${formatearFecha(fechaI)} to ${formatearFecha(fechaF)}`, {
      x: xData,
      y: page.getHeight() - yLine,
      size: 12,
      color: rgb(0, 0, 0)
    });
    yLine=yLine+carriet
    page.drawText(`Level:`, {
      x: xData,
      y: page.getHeight() - yLine,
      size: 12,
      color: rgb(0, 0, 0),
      font: font
    });
    page.drawText(`${letter.nivelCompeticion}`, {
      x: xData +55,
      y: page.getHeight() - yLine,
      size: 12,
      color: rgb(0, 0, 0)
    });


    // Guardar el PDF modificado en un nuevo archivo
    const modifiedPdfBytes = await pdfDoc.save();
    if(!fs.existsSync('./uploads/lettersA')) {
      fs.mkdirSync('./uploads/lettersA', { recursive: true });
    }
    await fsP.writeFile(`./uploads/lettersA/carta-${letter.folio}.pdf`, modifiedPdfBytes);

    console.log('Archivo PDF modificado creado exitosamente.');
    return `carta-${letter.folio}.pdf`
  } catch (error) {
    console.error('Error al modificar el PDF:', error);
  }
}


class Letters {
  async create(data,files) {
    try {
      const userObj = typeof data.user === "string" ? JSON.parse(data.user) : data.user
      data.user = userObj
      const numberData = await db.collection('letters').countDocuments({
        year: new Date().getFullYear()
      });
      const folioNumber = String(numberData + 1).padStart(3, "0");
      const folio = `CP${new Date().getFullYear()}-${folioNumber}`;

      const register = {
        ...data,
        folio,
        createdAt: new Date(),
        year: new Date().getFullYear(),
        convocatoria:files
      }
      const dataMail ={
          name:`${data.user.nombre} ${data.user.apellido_paterno} ${data.user.apellido_materno}`,
          nombreCompetencia:data.nombreCompetencia,
          nivelCompeticion:data.nivelCompeticion,
          nombreAsociacion:data.user.asociacion.nombre,
          dateRegister:data.date,
          nombre:data.user.nombre,
          apellidoPaterno:data.user.apellido_paterno,
          apellidoMaterno:data.user.apellido_materno,
          fechaNacimiento:data.user.fecha_nacimiento,
          fechaActual:new Date().toLocaleDateString(),
          year:new Date().getFullYear(),
          edad:edadAJulio(data.user.fecha_nacimiento),
          correo:data.user.correo,
          abreviacionAsociacion:data.user.asociacion.abreviacion,
          nombreCompetencia:data.nombreCompetencia,
          domicilioCompetencia:data.domicilioCompetencia,
          ciudadEstadoCompetencia:data.ciudadEstadoCompetencia,
          fechaInicialCompetencia:data.fechaInicialCompetencia,
          fechaFinalCompetencia:data.fechaFinalCompetencia,
          nivelCompeticion:data.nivelCompeticion,
          nivelActual:data.user.nivel_actual,
          comentariosCompetencia:data.comentariosCompetencia,
          folio:folio,
          server:config.server
      }


      // Insertar en la base de datos
      const result = await db.collection('letters').insertOne(register);
      if (!result.insertedId) {
        throw Boom.badImplementation('No se pudo insertar la carta');
      }
      if(result.insertedId){
      const mailSkater = await sendMail({
        to:data.user.correo,
        from: config.emailSupport,
        subject: 'Solicitud de Carta Permiso',
        templateEmail: 'letters/mailSkaterStart',
        data:dataMail,
        attachments: [
                  {
                    filename: 'encabezado',
                    path: path.join('emails/encabezado.png'),
                    cid: 'encabezado',
                  }
        ],
      })
      console.log(mailSkater)
      const mailAssociation = await sendMail({
        to:data.user.asociacion.correo,
        from: config.emailSupport,
        subject: 'Solicitud de Carta Permiso',
        templateEmail: 'letters/mailAsociacionStart',
        data:{...dataMail,name:`${data.user.asociacion.representante} `,idSolicitud:result.insertedId},
        attachments: [
                  {
                    filename: 'encabezado',
                    path: path.join('emails/encabezado.png'),
                    cid: 'encabezado',
                  },
                  {
                    filename: 'ACEPTAR',
                    path: path.join('emails/ACEPTAR.png'),
                    cid: 'aceptar',
                  },
                  {
                    filename: 'RECHAZAR',
                    path: path.join('emails/RECHAZAR.png'),
                    cid: 'rechazar',
                  },
                  {
                    filename: files.originalname,
                    path: path.join(files.path),
                    cid: 'documento',
                  },
        ],
      })
      console.log(mailAssociation)
      if (!mailSkater.success || !mailAssociation.success) {
        throw Boom.badGateway('No se logró entregar el mail');
      }




      return {files, register,mailSkater};
      }
    } catch (error) {
      if (error.isBoom) {
        throw error;
      }
      throw Boom.badImplementation("Failed to create letter");
    }
  }

  async verification(id, status) {
    try {
      const data = await db.collection('letters').findOne({ _id: new ObjectId(id) });
      if (!data) {
        throw Boom.notFound('Carta no encontrada');
      }
      if (status === 'true') {
        await db.collection('letters').updateOne({ _id: new ObjectId(id) }, { $set: { verificacionAsociacion: true} });
      } else {
        await db.collection('letters').updateOne({ _id: new ObjectId(id) }, { $set: { verificacionAsociacion: false } });
      }
      console.log('[2]')

      const dataMail ={
          nombre:`${data.user.nombre} ${data.user.apellido_paterno} ${data.user.apellido_materno}`,
          nombreCompetencia:data.nombreCompetencia,
          nivelCompeticion:data.nivelCompeticion,
          nombreAsociacion:data.user.asociacion.nombre,
          dateRegister:data.date,
          nombre:data.user.nombre,
          apellidoPaterno:data.user.apellido_paterno,
          apellidoMaterno:data.user.apellido_materno,
          fechaNacimiento:data.user.fecha_nacimiento,
          fechaActual:data.date,
          year:data.year,
          edad:edadAJulio(data.user.fecha_nacimiento),
          correo:data.user.correo,
          abreviacionAsociacion:data.user.asociacion.abreviacion,
          domicilioCompetencia:data.domicilioCompetencia,
          ciudadEstadoCompetencia:data.ciudadEstadoCompetencia,
          fechaInicialCompetencia:data.fechaInicialCompetencia,
          fechaFinalCompetencia:data.fechaFinalCompetencia,
          nivelActual:data.user.nivel_actual,
          comentariosCompetencia:data.comentariosCompetencia,
          folio:data.folio,
          server:config.server,
          idSolicitud:data._id.toString()
      }
      console.log('[3]',dataMail)


      const mailPresident = await sendMail({
        to:'saul.delafuente@samar-technologies.com',
        from: config.emailSupport,
        subject: `Solicitud de Carta Permiso ${dataMail.folio} - ${dataMail.nombre} ${dataMail.apellidoPaterno}`,
        templateEmail: 'letters/mailPresidencia',
        data:dataMail,
        attachments: [
                  {
                    filename: 'encabezado',
                    path: path.join('emails/encabezado.png'),
                    cid: 'encabezado',
                  },
                  {
                    filename: 'ACEPTAR',
                    path: path.join('emails/ACEPTAR.png'),
                    cid: 'aceptar',
                  },
                  {
                    filename: 'RECHAZAR',
                    path: path.join('emails/RECHAZAR.png'),
                    cid: 'rechazar',
                  },
                  {
                    filename: data.convocatoria.originalname,
                    path: path.join(data.convocatoria.path),
                    cid: 'documento',
                  },
        ],
      })
      console.log(mailPresident)
      // if (!mailPresident.success) {
      //   throw Boom.badGateway('No se logró entregar el mail');
      // }else{
      //   fs.unlink(letter.convocatoria.path, (err) => {
      //     if (err) {
      //       console.error('Error al eliminar el archivo:', err);
      //       return;
      //     }
      //     console.log('Archivo eliminado con éxito');
      //   });
      // }

      return true;
    } catch (error) {
      if (error.isBoom) {
        throw error;
      }
      throw Boom.badImplementation("Failed to verify letter");
    }
  }

  async approve(id, status) {
    try {
      const data = await db.collection('letters').findOne({ _id: new ObjectId(id) });
      if (!data) {
        throw Boom.notFound('Carta no encontrada');
      }
      if (status === 'true') {
        await db.collection('letters').updateOne({ _id: new ObjectId(id) }, { $set: { aprobado: true } });
        const pdfName = await modificarPDF({ letter:data });
        await db.collection('letters').updateOne({ _id: new ObjectId(id) }, { $set: { carta_pdf: pdfName } });
      } else {
        await db.collection('letters').updateOne({ _id: new ObjectId(id) }, { $set: { aprobado: false } });
      }

      const dataMail ={
        name: data.user.nombre,
        nombreCompetencia: data.nombreCompetencia,
        nivelCompeticion: data.nivelCompeticion
      }
      const mailSkater = await sendMail({
        to: data.user.correo,
        from: config.emailSupport,
        subject: 'Carta Permiso Aprobada',
        templateEmail: 'letters/approveLetterSkater',
        data: dataMail,
        attachments: [
          {
            filename: `carta-${data.folio}.pdf`,
            path: path.join(`./uploads/lettersA/carta-${data.folio}.pdf`),
            cid: `carta-${data.folio}`
          },
          {
                    filename: 'encabezado',
                    path: path.join('emails/encabezado.png'),
                    cid: 'encabezado',
                  }
        ]
      })

      return true;
    } catch (error) {
      if (error.isBoom) {
        throw error;
      }
      throw Boom.badImplementation("Failed to approve letter");
    }
  }


}

export default Letters;
