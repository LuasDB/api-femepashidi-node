import express from 'express'
import Results from '../services/results.service.js'
import upload from '../configurations/multer-config.js'

const router = express.Router()
const results = new Results()

router.post('/',upload('results').fields([
  { name: 'img', maxCount: 1 }]
),async(req,res,next)=>{
  try {
    const createResult = await results.create(req.files,req.body)

    res.status(201).json({
      success:true,
      message:'Registro Creado',
      data:createResult
    })
  } catch (error) {
    next()
  }
})

router.get('/',async(req,res,next)=>{
  try {
    const getAll = await results.getAll()
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
    const getOne = await results.getOne(req.params.id)
    res.status(200).json({
      success:true,
      data:getOne
    })
  } catch (error) {
    next()
  }
})

router.patch('/:id',upload('results').fields([
  { name: 'img', maxCount: 1 }]
),async(req,res,next)=>{
  try {
    const updateOne = await results.updateOne(req.params.id,req.body,req.files)
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
    const deleteOne = await results.deleteOne(req.params.id)
    res.status(200).json({
      success:true,
      data:deleteOne
    })
  } catch (error) {
    next()
  }
})





export default router
