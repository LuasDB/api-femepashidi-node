import Boom from "@hapi/boom"
import { db } from "../db/mongoClient.js"
import { ObjectId } from "mongodb"
import fs from 'fs'
class Announcements{
  constructor(){}



  async create(files,data){
    try {
      const newData={...data,
        img:files.img[0].path,
        doc:files.doc[0].path
      }
      const create = await db.collection('announcements').insertOne(newData)

      return create.insertedId

    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong n the creation ')
    }
  }

  async getAll() {
    try {
      const results = await db.collection('announcements').find().toArray();
      return results;
    } catch (error) {
      throw Boom.badImplementation('Failed to fetch announcements');
    }
  }

  async getOne(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw Boom.badRequest('Invalid ID');
      }

      const result = await db.collection('announcements').findOne({ _id: new ObjectId(id) });
      if (!result) throw Boom.notFound('Announcement not found');
      return result;

    } catch (error) {
      throw Boom.isBoom(error) ? error : Boom.badImplementation('Error fetching announcement');
    }
  }

  async updateOne(id, newData, files) {
  try {
    if (!ObjectId.isValid(id)) {
      throw Boom.badRequest('Invalid ID');
    }

    // Preparar campos a actualizar
    const updateFields = { ...newData };

    if (files?.img?.[0]) {
      updateFields.img = files.img[0].path;
    }

    if (files?.doc?.[0]) {
      updateFields.doc = files.doc[0].path;
    }

    const result = await db.collection('announcements').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw Boom.notFound('Announcement not found');
    }

    return result;

  } catch (error) {
    throw Boom.isBoom(error) ? error : Boom.badImplementation('Error updating announcement');
  }
}

  async deleteOne(id) {
    try {
      console.log('ID A ELIMINAR',id)

      const announcement = await db.collection('announcements').findOne({_id:new ObjectId(id)})
      if(!announcement){
        throw Boom.badRequest('No se encontro el comunicado')
      }

      const result = await db.collection('announcements').deleteOne({ _id: new ObjectId(id) });


      if (result.deletedCount === 0) {
        throw Boom.notFound('Announcement not found');
      }

      if(fs.existsSync(announcement.img)){
        fs.unlinkSync(announcement.img)
        console.log('Eliminado',announcement.img)
      }
      if(fs.existsSync(`./uploads/announcements/${announcement.img}`)){
        fs.unlinkSync(`./uploads/announcements/${announcement.img}`)
        console.log('Eliminado',`./uploads/announcements/${announcement.img}`)
      }
      if(fs.existsSync(announcement.doc)){
        fs.unlinkSync(announcement.doc)
        console.log('Eliminado',announcement.doc)

      }
      if(fs.existsSync(`./uploads/announcements/${announcement.doc}`)){
        fs.unlinkSync(`./uploads/announcements/${announcement.doc}`)
        console.log('Eliminado',`./uploads/announcements/${announcement.doc}`)

      }

      return result;

    } catch (error) {
      throw Boom.isBoom(error) ? error : Boom.badImplementation('Error deleting announcement');
    }
  }
}

export default Announcements






