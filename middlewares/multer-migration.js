import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Configuración dinámica del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderName = req.params.folder;
    const uploadPath = `uploads/${folderName}`

    // Crea la carpeta si no existe
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Conserva el nombre original
  },
});

const uploadFilesMigration = multer({ storage }).any(); // Acepta múltiples archivos

export default uploadFilesMigration
