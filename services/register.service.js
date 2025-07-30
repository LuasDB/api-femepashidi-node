import Boom from '@hapi/boom'
import fs from 'fs'
import path from 'path'
import { db } from '../db/mongoClient.js'
import { ObjectId } from 'mongodb'
import { sendMail } from '../utils/sendMail.js'
import config from '../config.js'
import { formatoFecha } from '../configurations/formats.js'


class Register{
  constructor(){}

  async create(data,files){
    try {

      const dataParse={
      user:JSON.parse(data.user),
      event:JSON.parse(data.event),
      association:JSON.parse(data.association),
    }


    console.log('[1]',dataParse)
    if(!dataParse.user.verificacion){
      throw Boom.badImplementation('Tu solicitud de registro aun no ha sido aprobada')
    }
    const curp = dataParse.user.curp
    console.log('[2]',curp)

    if(files){
      dataParse.user.img = files.foto[0]

      if(data.lastFoto){
        if(fs.existsSync(data.lastFoto)){
          delete data?.foto
          fs.unlinkSync(data.lastFoto)
        }
      }
      await db.collection('skaters').updateOne(
        {curp},
        {$set: {img:files.foto[0] }}
      )
    }
    console.log('[4]',files)

    delete data.association
    delete data.event
    delete data.user

    const isRegistered = await db.collection('register').find({curp,'event.nombre':dataParse.event.nombre }).toArray()
    if(dataParse.user.categoria.toLowerCase() !== 'adulto' && isRegistered.length > 0){
      throw Boom.badRequest('El usuario ya esta registrado en este evento, espera la respuesta que se enviará a tu correo')
    }
    const create = await db.collection('register').insertOne({...data,...dataParse})
    console.log('[4]',create.insertedId)
    if(create.insertedId){
      const emailAssociation = await sendMail({
                from:'saul.delafuente@samar-technologies.com',
                to:dataParse.association.correo,
                subject:'Inscripción de participante a competencia',
                data:{
                  association:dataParse.association.nombre,
                  name:dataParse.association.representante,
                  nameSkater:`${dataParse.user.nombre} ${dataParse.user.apellido_paterno} ${dataParse.user.apellido_materno}`,
                  nameEvent:dataParse.event.nombre,
                  curp:dataParse.user.curp,
                  dateStart:dataParse.event.fecha_inicio,
                  dateEnd:dataParse.event.fecha_fin,
                  level:data.nivel_actual,
                  category:data.categoria,
                  id:create.insertedId,
                  server:config.server
                },
                templateEmail:'InscripcionSkaterAsociation',
                attachments:[
                  {
                    filename:'encabezado',
                    path:path.join('emails/encabezado.png'),
                    cid:'encabezado'
                  },
                  {
                    filename:'ACEPTAR',
                    path:path.join('emails/ACEPTAR.png'),
                    cid:'aceptar'
                  },
                  {
                    filename:'RECHAZAR',
                    path:path.join('emails/RECHAZAR.png'),
                    cid:'rechazar'
                  }
                ]
      })
      if(emailAssociation.success){
        return create
      }else{
        throw Boom.badGateway('No se logro entregar el mail')
      }
    }
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! ')
    }
  }

  async findByEvent(event){
    try {

      const findByEvent = await db
      .collection('register')
      .find({'event.nombre':event})
      .toArray()
      console.log(findByEvent)

      return findByEvent
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! ')
    }
  }

  async findOne(id){
    try {
      const findOne = await db.collection('register').findOne({_id: new ObjectId(id)})
      return findOne
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! ')
    }
  }

  async update(id,newData){
    try {
      delete newData._id
      const updateOne = await db.collection('register')
      .updateOne({_id:new ObjectId(id)},{$set:{...newData}})
      return updateOne
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }

      throw Boom.badImplementation('Somethink was wrong! ')
    }
  }

  async approval(data){

    try {
      const { id,status } = data
      const approval = await db.collection('register')
      .updateOne({_id:new ObjectId(id)},{$set:{status:status}})
      if(approval){
        const register = await db.collection('register').findOne({_id:new ObjectId(id)})

        const emailSkater = await sendMail({
        from:'saul.delafuente@samar-technologies.com',
        to:register.user.correo,
        subject:'Aceptación de Inscripción a competencia',
        data:{
          name:`${register.user.nombre} ${register.user.apellido_paterno} ${register.user.apellido_materno}`,
          event:register.event.nombre,
          fecha_inicio:formatoFecha(register.event.fecha_inicio),
          fecha_fin:formatoFecha(register.event.fecha_fin),
          level:register.nivel_actual,
          category:register.categoria
        },
        templateEmail:status?'approveInscripcionSkater':'noApproveInscripcionSkate',
        attachments:[
          {
            filename:'encabezado',
            path:path.join('emails/encabezado.png'),
            cid:'encabezado'
          }
        ]
        })

        if(emailSkater.success){
          return {message:'Correo enviado'}
        }
      }
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! ')
    }

  }

  async delete(id){
    try {
      const deleteOne = await db.collection('register').deleteOne({_id:new ObjectId(id)})
      return deleteOne
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! ')
    }
  }
}

export default Register
