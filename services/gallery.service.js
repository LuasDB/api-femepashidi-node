import { Boom } from "@hapi/boom";
import fs from 'fs';
import path from 'path';
import { db } from "../db/mongoClient.js";

class Gallery{
  consturctor(){}

  async create(data,files){
    try {
      if(!data || !files || files.length === 0){
        throw Boom.badRequest('Invalid data or files')
      }
      // Solo existe una galería vigente: se reemplaza por completo en cada subida
      await db.collection('gallery').deleteMany({})
      const create = await db.collection('gallery').insertOne({
        ...data,fotos:files
      })
      if(create.insertedId){
        return {
        files,...data
      }
      }
      throw Boom.badRequest('The service is not availeble')

    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Error creating gallery', error)
    }
  }

  async getGallery(){
    try {
      return await db.collection('gallery').findOne()
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error}
      }
      throw Boom.badImplementation('Not Found:',error)
    }


}

export default Gallery;
