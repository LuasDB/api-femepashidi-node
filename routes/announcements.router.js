import express from 'express'
import Announcements from '../services/announcements.service.js'
import upload from '../configurations/multer-config.js'


const router = express.Router()
const announcements = new Announcements()

router.post('/',upload('announcements').fields([
  { name: 'img', maxCount: 1 },
  { name: 'doc', maxCount: 1 }
]),async(req,res,next)=>{
  try {
    const newAnnouncement = announcements.create(req.files,req.body)

    res.status(201).json({
      success:true,
      message:'Registro Creado',
      data:newAnnouncement
    })
  } catch (error) {
    next()
  }
})

router.get('/',async(req,res,next)=>{
  try {
    const getAll = await announcements.getAll()
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
    const getOne = await announcements.getOne(req.params.id)
    res.status(200).json({
      success:true,
      data:getOne
    })
  } catch (error) {
    next()
  }
})

router.patch('/:id', upload('announcements').fields([
  { name: 'img', maxCount: 1 },
  { name: 'doc', maxCount: 1 }
]), async (req, res, next) => {
  try {
    console.log(req.files)
    const result = await announcements.updateOne(
      req.params.id,
      req.body,
      req.files
    );

    res.status(201).json({ success: true, message: 'Comunicado actualizado', result });

  } catch (error) {
    next(error);
  }
});


router.delete('/:id',async(req,res,next)=>{
  try {
    const deleteOne = await announcements.deleteOne(req.params.id)
    res.status(200).json({
      success:true,
      data:deleteOne
    })
  } catch (error) {
    next()
  }
})





export default router
