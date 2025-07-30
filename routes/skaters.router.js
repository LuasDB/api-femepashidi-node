import express from 'express'
import Boom from '@hapi/boom'
import Skaters from '../services/skaters.service.js'
import uploadFiles from '../middlewares/multer-upload-files.js'
import upload from '../configurations/multer-config.js'

const router = express.Router()
const skaters = new Skaters()

router.post('/new-skater/:collection',uploadFiles,async(req, res, next)=>{
  const uploadNewSkater = req.upload.any()

  uploadNewSkater(req,res,async(err)=>{
    if(err){
      throw Boom.unsupportedMediaType('Error al subir archivos')
    }

    const { files, body } = req

    try {
      const addSketer = await skaters.addSketer(files,body)
      return res.status(201).json({
        success:true,
        message:'Nuevo registro creado',
        data:addSketer
      })
    } catch (error) {
      next(error)
    }
  })
})

router.get('/',async(req, res, next)=>{
  try {
    const { page,limit,search =''} = req.query

    const paginatedData = await skaters.getSkatersWithPagination({
      page:parseInt(page),
      limit:parseInt(limit),
      search
    })

    res.status(200).json({
      success:true,
      data:paginatedData.skaters,
      total:paginatedData.total
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:curp',async(req, res, next)=>{
  try {
    const getOne = await skaters.getOneByCurp(req.params.curp)
    res.status(200).json({
      success:true,
      data:getOne
    })
  } catch (error) {
    next(error)
  }
})

router.get('/by-curp/:curp',uploadFiles,async(req, res, next)=>{
  try {
    const getByCurp = await skaters.getByCurp(req.params.curp)

    if(!getByCurp){
      res.status(200).json({
            success:false,
          })
    }
    else{
      res.status(200).json({
        success:true
      })
    }

  } catch (error) {
    next(error)
  }

})

router.get('/approve/:curp/:status',uploadFiles,async(req, res, next)=>{
  try {
    const approve = await skaters.aprove(req.params.curp,req.params.status)
    // res.json(approve)

   if(approve){
        res.redirect('https://www.femepashidi.com.mx/inicio/respuesta.html');
      }else{
        res.redirect('https://www.femepashidi.com.mx/inicio/respuesta.html');
      }

  } catch (error) {
    next(error)
  }

})

router.patch('/:curp',async(req, res, next)=>{
  try {
    const updateOne = await skaters.updateOneByCurp(req.params.curp,req.body)
    res.status(200).json({
      success:true,
      message:'Registro actualizado',
      data:updateOne
    })
  } catch (error) {
    next(error)
  }
})








export default router
