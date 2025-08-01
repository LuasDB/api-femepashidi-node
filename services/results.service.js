import Boom from "@hapi/boom"
import { db } from "../db/mongoClient.js"
import { ObjectId } from "mongodb"


class Results{
  constructor(){}



  async create(files,data){
    try {
      const newData = {
        ...data,
        img:files.img[0].path
      }
      const create = await db.collection('results').insertOne(newData)

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
      const getAll = await db.collection('results').find().toArray()

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
      const getOne = await db.collection('results').findOne({_id: new ObjectId(id)})
      return getOne
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Something went wrong when calling this register')
    }
  }

  async updateOne(id,newData,files){
    try {
      delete newData._id
      if(files){
        newData.img=files.img[0].path
      }
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
      const deleteOne = await db.collection('results').deleteOne({
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


export default Results
