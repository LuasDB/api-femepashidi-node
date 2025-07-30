import express from 'express'
import Events from './../services/events.service.js'

const router = express.Router()
const events = new Events()

router.post('/',async(req,res,next)=>{
  try {
    const newEvent = await events.create(req.body)

    res.status(201).json({
      success:true,
      message:'Registro Creado',
      data:newEvent
    })
  } catch (error) {
    next()
  }
})

router.get('/',async(req,res,next)=>{
  try {
    const getAll = await events.getAll()
    res.status(200).json({
      success:true,
      message:'Registro Creado',
      data:getAll
    })
  } catch (error) {
    next()
  }
})

router.get('/:id',async(req,res,next)=>{
  try {
    const getOne = await events.getOne(req.params.id)
    res.status(200).json({
      success:true,
      data:getOne
    })
  } catch (error) {
    next()
  }
})

router.patch('/:id',async(req,res,next)=>{
  try {
    const updateOne = await events.updateOne(req.params.id,req.body)
    res.status(200).json({
      success:true,
      message:'Registro actualizado',
      data:updateOne
    })
  } catch (error) {
    next()
  }
})

router.delete('/:id',async(req,res,next)=>{
  try {
    const deleteOne = await events.deleteOne(req.params.id)
    res.status(200).json({
      success:true,
      data:deleteOne
    })
  } catch (error) {
    next()
  }
})





export default router
