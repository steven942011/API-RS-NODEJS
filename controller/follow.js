const follow = require("../models/follow");
const Follow = require("../models/follow");
const user = require("../models/user");
const User = require("../models/user");
const followService = require("../Services/followService")//Acciones de prueba 


//Importar dependecias

const mongoosePaginate = require('mongoose-paginate-v2')

const pruebaFollow = (req, res) => {
    return res.status(200).send(
        {
            message: "Mensaje enviado desde: controllers/pruebaFollow.js"
        }
    );

}
// Accion de guardar un follow ( accion seguir)
const save = (req, res) => {
    //Conseguir atos por body
    // Conseguir datos por body
    const params = req.body;

    // Sacar id del usuario identificado
    const identity = req.user;



    //Crear objeto con modelo follow 
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });
    // Guardar objeto en bbdd
    userToFollow.save().then((followStored) => {

        if (!followStored) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido seguir al usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            identity: req.user,
            follow: followStored
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "No se ha podido seguir al usuario"
        });
    })

};



const deleteFollow = async (req, res) => {

    //Recogr el id del usuario identificado 
    const userId = req.user.id;
    //Recoger el id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;

    try {
        let searchFollow = await Follow.deleteOne({ "user": userId, "followed": followedId });

        if (!searchFollow || searchFollow.length <= 0) {
            return res.status(500).send({
                status: "error",
                message: "No se encontro el dato.. "
            });
        }

        return res.status(200).send({
            status: "success",
            user: req.user,
            searchFollow
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });
    }



}



//Accion listado de usuarios que culauqier usuario esta siguiendo (siguiendo)
const following = async (req, res) => {
    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id por paramatro en url
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la pagina, si no la pagina 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    // Usuarios por pagina quiero mostrar
    const itemsPerPage = 2;

    
    // Find a follow, popular datos de los usuario y paginar con mongoose paginate

  let follows = await  Follow.find({user:userId}).populate("user followed", "-password -role -__v")
  .skip((page-1) * itemsPerPage)
  .limit(itemsPerPage);
   
   let totalFollows = await Follow.countDocuments({user:userId}).populate("user followed", "-password -role -__v");
   
    let followUserId = await followService.followUserIds(req.user.id);
   
   return res.status(200).send({
    status: "success",
    message: "Listado de usuarios que estoy siguiendo",
     follows, 
     totalFollows,
    pages:Math.ceil(totalFollows/itemsPerPage),
    user_following:followUserId.following,
    user_follow_me:followUserId.followers
 });
 
  

   
  
}
//Accion listado de usuarios que siguen o cualquier otro usuario  (soy seguido)
const followers =async (req, res) => {
 // Sacar el id del usuario identificado
 let userId = req.user.id;

 // Comprobar si me llega el id por paramatro en url
 if (req.params.id) userId = req.params.id;

 // Comprobar si me llega la pagina, si no la pagina 1
 let page = 1;

 if (req.params.page) page = req.params.page;

 // Usuarios por pagina quiero mostrar
 const itemsPerPage = 2;

 let follows = await  Follow.find({followed:userId}).populate("user followed", "-password -role -__v")
  .skip((page-1) * itemsPerPage)
  .limit(itemsPerPage);
   
   let totalFollows = await Follow.countDocuments({user:userId}).populate("user", "-password -role -__v");
   
    let followUserId = await followService.followUserIds(req.user.id);
   
   return res.status(200).send({
    status: "success",
    message: "Listado de usuarios que me siguiendo",
     follows, 
     totalFollows,
    pages:Math.ceil(totalFollows/itemsPerPage),
    user_following:followUserId.following,
    user_follow_me:followUserId.followers
 });



    return res.status(200).send({
        status: "success",
        message: "Listado de usuarios que estoy siguiendo"
    })
}

//exportar acciones
module.exports = {
    pruebaFollow,
    save,
    deleteFollow,
    following,
    followers
}