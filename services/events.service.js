import Boom from "@hapi/boom"
import { db } from "../db/mongoClient.js"
import { ObjectId } from "mongodb"


class Events{
  constructor(){}



  async create(data){
    try {
      const create = await db.collection('events').insertOne(data)

      return create.insertedId

    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Somethink was wrong n the creation ')
    }
  }

  async getAll(){
    try {
      const getAll = await db.collection('events').find().toArray()

      return getAll
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Something went wrong when calling everything')
    }
  }

  async getOne(id){
    try {
      const getOne = await db.collection('events').findOne({_id: new ObjectId(id)})
      return getOne
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Something went wrong when calling this register')
    }
  }

  async updateOne(id,newData){
    try {
      delete newData._id
      const updateOne = await db
      .collection('events')
      .updateOne(
        {_id: new ObjectId(id)},
        {$set:newData}
      )
      return updateOne
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Something went wrong while trying to update the record')
    }
  }

  async deleteOne(id){
    try {
      const deleteOne = await db.collection('events').deleteOne({
        _id:new ObjectId(id)
      })
      return deleteOne
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Something went wrong while trying to delete the record.')
    }
  }



}


export default Events
