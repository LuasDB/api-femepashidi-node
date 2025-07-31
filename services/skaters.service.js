import Boom from "@hapi/boom"
import { db } from "../db/mongoClient.js"
import { sendMail } from './../utils/sendMail.js'
import { register } from "module"
import path from "path"
import config from "./../config.js"
import { ObjectId } from "mongodb"


class Skaters{
  constructor(){}

  async addSketer(files,data){

    try {
      const exists = await this.getByCurp(data.curp)
      console.log('[EXIST]',exists)
      if(exists){
        throw Boom.conflict('Skater exists in the platform')
      }
      const newSkater = {
        img:files[0],
        ...data,
        asociacion:JSON.parse(data.asociacion)
      }

      const result = await db.collection('skaters').insertOne(newSkater)

      if(result.insertedId){
        const emailSkater = await sendMail({
          from:'saul.delafuente@samar-technologies.com',
          to:data.correo,
          subject:'Registro a plataforma FEMEPASHIDI',
          data:{name:`${data.nombre} ${data.apellido_paterno}`},
          templateEmail:'register',
          attachments:[
            {
              filename:'encabezado',
              path:path.join('emails/encabezado.png'),
              cid:'encabezado'
            }
          ]
        })

        const emailAssociation = await sendMail({
          from:'saul.delafuente@samar-technologies.com',
          to:newSkater.asociacion.correo,
          subject:'Registro a plataforma FEMEPASHIDI',
          data:{
            association: newSkater.asociacion.nombre,
            name:newSkater.asociacion.representante ,
            nameSkater: `${newSkater.nombre} ${newSkater.apellido_paterno} ${newSkater.apellido_materno}`,
            level: newSkater.nivel_actual,
            category: newSkater.categoria,
            brithday:newSkater.fecha_nacimiento ,
            server:config.server,
            curp:newSkater.curp ,
          },
          templateEmail:'registerAsociation',
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

        return {emailSkater,emailAssociation}

      }

      return { result }


    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! ')
    }

  }

  async getByCurp(curp){
    try {
      curp = curp.toUpperCase()
      console.log('[CURP]',curp)
      const isCurp = await db.collection('skaters').findOne({curp})
      console.log('[]',isCurp)
      return isCurp !== null
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! 2 ')
    }
  }

  async getOneByCurp(curp){
    try {
      curp = curp.toUpperCase()
      const isCurp = await db.collection('skaters').findOne({curp})
      return isCurp
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! 2 ')
    }
  }

  async getSkatersWithPagination({page,limit,search}){

    try {

      const skip = ( page - 1 ) * limit

      const filtro = search ?
        {
          $or:[
            {nombre:{ $regex:search , $options:'i'}},
            {apellido_paterno:{ $regex:search , $options:'i'}},
            {curp:{ $regex:search , $options:'i'}},
          ]
      }
      :{}

      const collection = await db.collection('skaters')

      const total = await collection.countDocuments(filtro)
      const skaters = await collection
      .find(filtro)
      .skip(skip)
      .limit(limit)
      .sort({apellido_paterno:1})
      .toArray()

      return { total, skaters }


      }catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! 2 ')
    }
  }

  async updateOneByCurp(curp, newData) {
    try {
      if (!newData.id_asociacion) {
        throw Boom.badRequest('id_asociacion is required');
      }

      const newAssociation = await db.collection('associations').findOne({ _id: new ObjectId(newData.id_asociacion) });

      if (!newAssociation) {
        throw Boom.badRequest('Association not found');
      }

      newData.asociacion = newAssociation;
      delete newData._id
      const updateOne = await db.collection('skaters').updateOne(
        { curp},
        { $set: newData }
      );

      if (updateOne.matchedCount === 0) {
        throw Boom.notFound('The CURP was not found');
      }

      console.log(updateOne);
      return updateOne;
    } catch (error) {
      console.error('[ERROR REAL]:', error);
      if (Boom.isBoom(error)) {
        throw error.message;
      }
      throw Boom.badImplementation('Something went wrong!');
    }
  }

  async aprove(curp,status){

    try {
      status = status==='true'
      const skater = await db.collection('skaters').findOne({curp})
      let response
      if(status){
        response = await sendMail({
          from:config.emailSupport,
          to:skater.correo,
          subject:'Aceptación de registro en plataforma FEMEPASHIDI',
          data:{name:`${skater.nombre} ${skater.apellido_paterno}`},
          templateEmail:'approveSkater',
          attachments:[
            {
              filename:'encabezado',
              path:path.join('emails/encabezado.png'),
              cid:'encabezado'
            }
          ]
        })

      }else{
        response = await sendMail({
          from:config.emailSupport,
          to:skater.correo,
          subject:'Registro en plataforma FEMEPASHIDI',
          data:{name:`${skater.nombre} ${skater.apellido_paterno}`},
          templateEmail:'noApproveSkater',
          attachments:[
            {
              filename:'encabezado',
              path:path.join('emails/encabezado.png'),
              cid:'encabezado'
            }
          ]
        })
      }

      if(!response.success){
        throw Boom.badRequest("Can't send email to confirm")
      }

      return this.updateOneByCurp(skater.curp,{verificacion:status,id_asociacion:skater.id_asociacion})

    } catch (error) {
      if(Boom.isBoom(error)){
              throw error
            }
            throw Boom.badImplementation('Can´t update the register')
          }
  }

  async delete(curp){
    try {
      const deleteOne = await db.collection('skaters').deleteOne({curp})
      return deleteOne
    } catch (error) {
      if(Boom.isBoom(error)){
          throw error
        }
        throw Boom.badImplementation('Can´t update the register')
      }
    }
  }



export default Skaters
