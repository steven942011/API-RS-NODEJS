//Importar modulos

const jwt =require("jwt-simple");
const moment = require("moment");

//Importar clave secreta
const libjwt =require("../Services/jwt");
const secret = libjwt.secret;


// MIDDLEWARE Funcion de autenticacion
exports.auth=(req, res, next )=>{
  //comprobar si llega la cabecera de la autenticacion auth
//console.log(req.headers)
  if(!req.headers.autorization){
    return res.status(403).send({
        status:"error",
        message:"La petición no trae la cabecera de autenticación"
    });
  }


//limpiar el token

let token= req.headers.autorization.replace(/['"]+/g,'');


//Decodifica el token

try{

    let payload = jwt.decode(token,secret);
   
    ///comprobar expiracion del token
      console.log(payload.exp)
    if(payload.exp <= moment().unix()){

        return res.status(401).send({
            status:"Error",
            message:"Token Expirado",
            error
        });

    }
    
//Agregar datos de usuario arequest

req.user= payload;

}catch(error){
    return res.status(404).send({
        status:"Error",
        message:"Token invalido",
        error
    })
}

//pasar a ejecucion de accion  
next();
}



