import Boom from "@hapi/boom"
import { db } from "../db/mongoClient.js"
import { ObjectId } from "mongodb"


class Association{

  constructor(){}

  async create(data){
    try {
      const create = await db.collection('associations').insertOne(data)
      return create.insertedId

    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! ')
    }
  }

  async getAll(){
    try {
      const getAll = await db.collection('associations').find().toArray()
      return getAll
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong! ')
    }
  }

  async getOne(id){
    try {
      console.log('TRAER',id)

      const getOne = await db.collection('associations')
      .findOne(
        {_id: new ObjectId(id)})

      return getOne
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong ! ')
    }
  }

  async update(newData,id){
    try {
      console.log('ACTUALIZAR',id)
      console.log('Datps',newData)
      delete newData._id

      const update = await db.collection('associations')
      .updateOne(
        {_id: new ObjectId(id)},
        { $set: newData}
      )
      if (update.modifiedCount === 0) {
        throw Boom.notFound('No se actualizó ningún documento');
      }
      console.log(update)
      return update
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong ! ')
    }
  }

  async deleteOne(id){
    try {
    const deleteOne = await db.collection('associations')
    .deleteOne({_id: new ObjectId(id)})

    return deleteOne
  } catch (error) {
    if(Boom.isBoom(error)){
      throw error
    }
    throw Boom.badImplementation('Somethink was wrong! ')
  }
  }
}

export default Association
