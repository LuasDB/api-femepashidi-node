import express from 'express'
import collectionsRouter from './collections.router.js'
import authRouter from './auth.router.js'
import skatersRouter from './skaters.router.js'
import associationsRouter from './associations.router.js'
import eventsRouter from './events.router.js'
import announcementsRouter from './announcements.router.js'
import registerRouter from './register.router.js'
import resultsRouter from './results.router.js'


const router = express.Router()

const AppRouter = (app,io) => {

  app.use('/api/v1', router)
  router.use('/collections', collectionsRouter(io))
  router.use('/auth', authRouter)
  router.use('/skaters', skatersRouter)
  router.use('/associations',associationsRouter)
  router.use('/events',eventsRouter)
  router.use('/announcements', announcementsRouter)
  router.use('/register',registerRouter)
  router.use('/results',resultsRouter)

  //Agregar las rutas necesarias

}

export default AppRouter
