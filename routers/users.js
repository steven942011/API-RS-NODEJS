const express = require("express");

const router = express.Router();
const UserController = require("../controller/user")
const middlewareAutentication=require("../middlewares/auth")
const multer = require('multer');

//configuracion de subida
const storage =multer.diskStorage({
    destination:(req, file, cb)=>{
       cb(null,"./uploads/avatars")
    },
    filename: (req,file,cb)=>{
     cb(null,"avatar-"+Date.now()+"-"+file.originalname);
    }
});

 const uploads = multer({storage})

//Definir rutas

router.get('/prueba-usuario',middlewareAutentication.auth,UserController.pruebaUser);
router.post('/register',UserController.register);
router.post('/login',UserController.login);
router.get('/profile/:id',middlewareAutentication.auth,UserController.porfile);
router.get('/list/:page?',middlewareAutentication.auth,UserController.list);
router.put('/update',middlewareAutentication.auth,UserController.update);
router.post('/upload',[middlewareAutentication.auth, uploads.single("file0")],UserController.upload);
router.get('/avatar/:file?',UserController.avatar);
router.get('/counters/:id',middlewareAutentication.auth,UserController.counters);
//Exportar router

module.exports =router;

