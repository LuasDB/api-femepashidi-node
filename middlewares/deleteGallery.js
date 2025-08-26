import fs from 'fs'
import path from 'path'

export default function deleteGallery(req,res,next){
  const galleryPath = path.join('uploads', 'gallery')
        if(fs.existsSync(galleryPath)){
          fs.readdirSync(galleryPath).forEach(file=>{
            const filePath = path.join(galleryPath,file)
            fs.unlinkSync(filePath)
          })
        }
        next()
}
