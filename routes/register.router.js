
import express from 'express'
import Register from '../services/register.service.js'
import upload from '../configurations/multer-config.js'


const router = express.Router()
const registro = new Register()

router.post('/',upload('skaters').fields([{name: 'foto', maxCount: 1 }]),async(req,res,next)=>{
  try {

    const register = await registro.create(req.body,req.files);
    res.status(201).json({
      success:true,
      message:'Registro completado, te enviaremos más instrucciones por correo, gracias por participar.',
      data:register
    });
  } catch (error) {
    next(error);
  }
});
router.get('/:id',async(req,res,next)=>{
  const { id }=req.params;
  try {
    const user = await registro.findOne(id);
    res.status(200).json({
      success: true,
      data:user});
  } catch (error) {
    next(error);
  }
});
router.get('/event/:event',async(req,res,next)=>{
  try {
    const users = await registro.findByEvent(req.params.event)
    res.status(200).json({
      success:true,
      data:users
    });
  } catch (error) {
    next(error);
  }
});
router.patch('/:id',async(req,res,next)=>{
  try {
    const user = await registro.update(req.params.id,req.body);
    res.status(201).json({success:true,message:'Registro Actualizado',data:user});
  } catch (error) {
    next(error);
  }
});
router.get('/approval/:id/:status',async(req,res,next)=>{

  try {
    const register = await registro.approval(req.params);
    if(register.message === 'Correo enviado'){
      res.redirect('https://www.femepashidi.com.mx/inicio/respuesta.html');
    }
  } catch (error) {
    next(error);
  }
});
router.delete('/:id',async(req,res,next)=>{
  try {
    const user = await registro.delete(req.params.id);
    res.status(201).json({
      success:true,
      messsage:'Registro eliminado',
      data:user
    });
  } catch (error) {
    next(error);
  }
});

// router.get('/confirmation/:id',async(req,res,next)=>{
//   const { id } = req.params
//   try {
//     const register = await registro.confirmate(id);
//     if(register.message === 'Correo enviado'){
//       res.redirect('https://www.femepashidi.com.mx/inicio/respuesta.html');
//     }else if(register.message === 'Ya confirmado'){
//       res.redirect('https://www.femepashidi.com.mx/inicio/respuesta.html');
//     }

//   } catch (error) {
//     next(error);
//   }
// });

// router.get('/get/event/by/:name',async(req,res,next)=>{
//   const { name }=req.params;

//   try {
//     const events = await registro.findOneByName(name);
//     res.status(200).json({
//       success:true,
//       data:events
//     });
//   } catch (error) {
//     next(error);
//   }
// });
// router.patch('/:id',async(req,res,next)=>{
//   try {
//     const user = await registro.update(req.params.id,req.body);
//     res.status(201).json(user);
//   } catch (error) {
//     next(error);
//   }
// });
// router.delete('/:id',async(req,res,next)=>{
//   try {
//     const user = await registro.delete(req.params.id);
//     res.status(201).json(user);
//   } catch (error) {
//     next(error);
//   }
// });


export default router
