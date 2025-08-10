import express from 'express';
import Letters from './../services/letters.service.js';
import upload from './../configurations/multer-config.js';

const router = express.Router();
const letters = new Letters();

router.post('/', upload('letters').single('archivo'), async (req, res,next) => {
  try {

    const newLetter = await letters.create(req.body, req.file);
    res.status(201).json({success:true,
      data:newLetter});
  } catch (error) {
    next(error);
  }
});

router.get('/verification/:id/:status', async (req, res,next) => {
  try {

    const verification = await letters.verification(req.params.id, req.params.status);
    if(verification){
    res.redirect('https://www.femepashidi.com.mx/inicio/respuesta.html')
  }
  } catch (error) {
    next(error);
  }
});

router.get('/approve/:id/:status', async (req, res,next) => {
  try {

    const approve = await letters.approve(req.params.id, req.params.status);
    if(approve){
    res.redirect('https://www.femepashidi.com.mx/inicio/respuesta.html')
  }
  } catch (error) {
    next(error);
  }
});


export default router;
