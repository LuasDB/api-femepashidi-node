import { db } from "../db/mongoClient.js"
import fs from "fs"

const skaters = async () => {
  const data = JSON.parse(fs.readFileSync('./../db.json', 'utf-8'));
  const skaters = data.skaters;

  const newData = await Promise.all(skaters.map(async (item) => {
    const copia = { ...item };
    delete copia.id;
    copia.img=null

    const association = await db.collection('associations').findOne({ nombre: copia.asociacion.nombre });
    copia.id_asociacion = association?._id || null;
    copia.nivel_actual = copia.nivel_actual.toUpperCase()

    return copia;
  }));

  try {
    const news = await db.collection('skaters').insertMany(newData);
    console.log(news);
  } catch (error) {
    console.error(error);
    throw new Error('Salió mal la exportación');
  }
};

const events = async()=>{
  const data = JSON.parse(fs.readFileSync('./utils/db.json','utf-8'))
  const events = data.events

  const newData = events.map(item=>{
    const copia = {...item}
    delete copia.id
    return copia
  })

  try {
    const news = await db.collection('events').insertMany(newData)
    console.log(news)
  } catch (error) {
    console.log('algo no salio en migracion')
    throw new Error('Salio mal la exportación')
  }
}

const register = async()=>{
  const data = JSON.parse(fs.readFileSync('./utils/db.json','utf-8'))
  const register = data.register

  const newData = register.map(item=>{
    const copia = {...item}
    return copia
  })

  try {
    const news = await db.collection('register').insertMany(newData)
    console.log(news)
  } catch (error) {
    console.log('algo no salio en migracion')
    throw new Error('Salio mal la exportación')
  }
}

const associations = async()=>{
  const data = JSON.parse(fs.readFileSync('./utils/db.json','utf-8'))
  const associations = data.associations

  const newData = associations.map(item=>{
    const copia = {...item}
    delete copia.id
    return copia
  })

  try {
    const news = await db.collection('associations').insertMany(newData)
    console.log(news)
  } catch (error) {
    console.log('algo no salio en migracion')
    throw new Error('Salio mal la exportación')
  }
}

export {events,skaters,register,associations}


