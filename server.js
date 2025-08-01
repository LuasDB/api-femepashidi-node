import express from 'express'
import cors from 'cors'
import AppRouter from './routes/index.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { logErrors,errorHandler} from './middlewares/hanldeErrors.js'
import { client } from './db/mongoClient.js'
import swaggerUi from 'swagger-ui-express'
import { readFile } from 'fs/promises'
import { events, skaters,register,associations,announcements,results} from './migration/migrations.js'
import uploadFilesMigration from './middlewares/multer-migration.js'

const data = await readFile('./api_documentation_swaggerUi.json', 'utf-8')
const swaggerDoc = JSON.parse(data)

const port = process.env.PORT || 3000
//Express
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
//Ejecutamos CORS, primero crearemos las url a las que le daremos acceso
  // const whitelist = ['http://localhost:3000','http://127.0.0.1'];
  // const options ={
  //   origin: (origin,callback)=>{
  //     if(whitelist.includes(origin) || !origin){
  //       callback(null,true);
  //     }else{
  //       callback(new Error('No permitido'));
  //     }
  //   }
  // }

// app.use(cors(options));

// para todas las url
app.use(cors())
//Socket.io
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Asegúrate de que sea la URL de tu frontend
    methods: ["GET", "POST"]
  }
})
io.on('connection', (socket) => {
  console.log('Usuario conectado', socket.id)
  socket.on('disconnect', () => {
    console.log('Usuario desconectado', socket.id)
  });

  socket.on('chat message', (msg) => {
    console.log('Mensaje recibido:', msg)
    socket.emit('response', `Mensaje recibido: ${msg}`)
  });


})

const startServer = async ()=>{
  try {
    await client.connect()
    console.log('✅ Conectado a MongoDB')

    //Rutas
    AppRouter(app,io)
    app.use('/migration/:collection',(req,res,next)=>{
      try{
        const collection = req.params.collection
        let data
        switch (collection) {
          case 'skaters':
            data=skaters()
            break;
          case 'events':
            data=events()
            break;
          case 'register':
            data=register()
            break;
          case 'associations':
            data=associations()
            break;
            case 'announcements':
            data=announcements()
            break;
            case 'results':
            data=results()
            break;

          default:
            break;
        }
      res.json({success:true,data})}
      catch(error){
       next()
      }
    })
    app.use('/upload-files/:folder', uploadFilesMigration, (req, res, next) => {
  try {
    res.status(201).json({
      files: req.files,
      data: req.body,
      success: true,
    });
  } catch (error) {
    next(error);
  }
});
    app.use(logErrors)
    app.use(errorHandler)

    app.use('/uploads', express.static('uploads'))


    httpServer.listen(3000,()=>{
      console.log(`Servidor iniciado en puerto :${port}`)
    })

  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error)
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  await client.close()
  console.log('🛑 Conexión con MongoDB cerrada')
  process.exit(0)
})

startServer()



