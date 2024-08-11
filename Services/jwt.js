//dependencias 
const jwt =require("jwt-simple");
const moment = require("moment");

//clave secreta
const secret ="CLAVE_SECRETA_DEL_ADMIN_21456897";





//crear una fuction para generar tokens
const createToken =(user)=>{
        const payload ={
            id:user.id,
            name:user.name,
            surname:user.surname,
            nick:user.nick,
            email:user.mail,
            role:user.role,
            image:user.image,
           iat:moment().unix(), //momento en el que se esta creando
           exp:moment().add({seconds:'600000'}).unix(),//fecha de expircion del token
   };

   //Devolver jwt token codificado
   
   return jwt.encode(payload,secret);


}
 
module.exports= {
   secret,
    createToken
    
}