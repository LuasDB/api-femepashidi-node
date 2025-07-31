import multer from 'multer'
import path from 'path'
import fs from 'fs'

const storageConf= (folder)=>{
  const uploadPath = `uploads/${folder}`
  if(!fs.existsSync(uploadPath)){
    fs.mkdirSync(uploadPath,{recursive:true})
  }

  return multer.diskStorage({
    destination: (req,file,cb)=>{
      cb(null,uploadPath)
    },
    filename:(req,file,cb)=>{
      cb(null,file.originalname)
    }
  })
}

const migrationFiles = (folder)=>{
  return multer({storage:storageConf(folder)})
}

export default migrationFiles
