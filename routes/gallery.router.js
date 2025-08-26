import express from 'express'
import Gallery from '../services/gallery.service.js'
import deleteGallery from '../middlewares/deleteGallery.js'
import upload from '../configurations/multer-config.js'


const router = new express.Router()
const gallery = new Gallery()

router.post('/',deleteGallery,upload('gallery').any(),async(req,res,next)=>{
  try {
    console.log(req.files)
    const newGallery = await gallery.create(req.body,req.files)
    res.status(201).json({
      success: true,
      data: newGallery
    })
  } catch (error) {
    next(error)
  }
})

router.get('/',async(req,res,next)=>{
  try {
    const getGallery = await gallery.getGallery()
    res.status(201).json({
      success: true,
      data: getGallery
    })
  } catch (error) {
    next(error)
  }
})










export default router
