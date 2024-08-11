
//importar modelos
const User = require('../models/user');

//Importar dependencias
const bcrypt = require('bcrypt');
//const mongoosePagination= require('mongoose-pagination');
const mongoosePagination = require('mongoose-paginate-v2');
const fs = require("fs");
//Importar servicios

const jwt = require("../Services/jwt");
const path = require('path');
const followService = require('../Services/followService');
const follow = require('../models/follow');
const publication = require('../models/publication');



//Acciones de prueba 

const pruebaUser = (req, res) => {
    return res.status(200).send(
        {
            message: "Mensaje enviado desde: controllers/user.js",
            user: req.user
        }
    );

}

//Registro de usuarios 

const register = (req, res) => {
    //Recoger datos de la peticion
    let params = req.body;

    // Comprobar que llegan bien  los datos (+validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {

        return res.status(400).json({
            status: "Not Found",
            message: "El servidor no pudo encontrar el contenido solicitado."
        });
    }

    //crear objeto de usuario
    let user_save = new User(params);

    // control de usuarios duplicados
    User.find({ $or: [{ email: user_save.email.toLowerCase() }, { nick: user_save.nick.toLowerCase() }] })
        .then(async (users) => {
            if (users && users.length >= 1) {
                return res.status(200).send({ status: "success", message: "El usuario ya existe" });
            }

            //Cifrar la contraseña 
            const pwd = await bcrypt.hash(user_save.password, 10);

            user_save.password = pwd;

            //guardar usuario  en bd
            user_save.save().then(
                (userStored) => {
                    if (!userStored) return res.status(500).send({ status: "error", message: "Error al guardar" })
                    if (userStored) {

                        // añadido
                        userStored.toObject();
                        delete userStored.password;
                        delete userStored.role;


                        //devovler el resultado
                        return res.status(200).json({
                            status: 'success',
                            message: "Se registro un nuevo usuario",
                            user: userStored
                        });

                    }
                }
            ).catch((error) => {
                if (error) return res.status(500).send({ status: "error", message: "Error al guardar" })
                console.log(error);
            });;

        }).catch((error) => {
            if (error) return res.status(500).json({ status: "error", message: "Error al validar usuario" })

            console.log(error);
        });

};

const login = (req, res) => {

    //recoger parametros del body 
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(404).send({ status: "error", message: "faltan datos..." });
    }

    // buscar en la BD si existe 
    User.findOne({ email: params.email })
        // .select({ "password": 0 })
        .then((user) => {
            if (!user) return res.status(404).send({ status: "error", message: "No existe el usuario" })



            //comprobar contraseña 
            const pwd = bcrypt.compareSync(params.password.toString(), user.password.toString());

            if (!pwd) {
                return res.status(404).send({ status: "error", message: "Contraseña incorrecta..." });
            }

            //conseguir token
            const token = jwt.createToken(user);

            //datos user
            return res.status(200).send({
                status: "success", menssage: "Sesion iniciada...", user: {
                    id: user.id,
                    name: user.name,
                    nick: user.nick,

                },
                token
            });


        }).catch((err) => {
            console.log(err)
        });


};



const porfile = async (req, res) => {
    // Recibir el parametro  del id del usuario por la url

    const id = req.params.id;
    //consulta para sacar los datos del usuario
    await User.findById(id)
        .select({ password: 0, role: 0 })
        .then(async (userProfile) => {
            if (!userProfile) {
                return res.status(404).send({ status: "error", message: "El usuario no existe o hay un error" });
            }
            // Info dee seguimiento 

            const followingInfo = await followService.followThisUser(req.user.id, id);

            //devolver el resultado 
            //posteriormente devolver  informacion de follow
            return res.status(200).send({
                status: "success",
                message: "Consulta exitosa...",
                user: userProfile,
                following: followingInfo.following,
                follower: followingInfo.follower
            });

        }).catch((error) = {

        });
}

const list = async (req, res) => {
    //  controlar en q pagina estamos
    let page = parseInt(req.params.page) || 1;
    console.log(req.user.id)
    //  consulta con mongoose pagination
    // limitar usuarios por pagina
    let itemsPerPage = 5;

    // opciones de la paginacion
    const options = {
        page: page,
        limit: itemsPerPage,
        sort: { _id: -1 },
        collation: {
            locale: "es",
        },

    };

    try {
        //sacar array de ids de los usuarios que me siguen y los que sigo 
        let followUserIds = await followService.followUserIds(req.user.id);
        // obtenes los usuarios
        const users = await User.paginate({}, options);

        // b el numero total de usuarios
        const total = await User.countDocuments();

        // si no existe un usuario devolvermos el error
        if (!users)
            return res.status(404).json({
                status: "Error",
                message: "No se han encontrado usuarios",
            });



        // devolver el resultado si todo a salido bien
        return res.status(200).send({
            status: "success",
            users: users.docs,
            page,
            itemsPerPage,
            total,

            // redondeamos con ceil el numero de paginas con usuarios a mostrar
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(404).json({
            status: "Error",
            message: "Hubo un error al obtener los usuarios",
            error: error.message,
        });
    }
}

const update = async (req, res) => {
    // Recoger info del usuario a actualizar 
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    //si me llega la contraseña cifrarla 

    //Buscar y actualizar 
    // comprobar si el usuario ya existe 
    //   let userBusq = await User.find({
    //     $or: [{ email: userToUpdate.email.toLowerCase() }, { nick: userToUpdate.nick.toLowerCase() }]
    // });
    //          console.log(userBusq);

    User.find({
        $or: [{ email: userToUpdate.email.toLowerCase() }, { nick: userToUpdate.nick.toLowerCase() }]
    }).then(async (users) => {

        let userIsset = false;

        users.forEach(user => {
            if (user && user._id != userIdentity.id) { userIsset = true }
        });
        if (userIsset) { return res.status(200).send({ status: "success", message: "El usuario ya existe" }); }

        //Cifrar la contraseña 
        if (userToUpdate.password) {
            const pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            delete userToUpdate.password;
        }
        
        //Devolver la respuesta

        try {
            //Actualizar usuario  en bd
            let userUpdated = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true });
            if (!userUpdated) return res.status(404).send({ status: "error", message: "Error al actualizar.." });
            // Devolver datos actalizados
            return res.status(200).send({ status: "success", message: "El usuario se actualizo ", userToUpdate });


        } catch (err) {
            return res.status(500).json({ status: "error", message: "Error el usuario ya existe... ", err })

        }


    }).catch((error) => {
        return res.status(500).json({ status: "error", message: "Error el usuario ya existe... ", error })
    });

}

const upload = async (req, res) => {

    let userIdentity = req.user;
    // recoger el fichero de imagen y comprobar que existe 
    if (!req.file) {
        return res.status(404).send({ status: "error", message: "Peticion no incluye la imagen.." });

    }
    // Conseguir el nombre del archivo 

    let image = req.file.originalname
    // sacar la extencion del archivo 
    const imagSplit = image.split("\.");
    const extension = imagSplit[1];
    //Comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        //Borrar archivo subido
        const filePath = req.file.path;

        const fileDelete = fs.unlinkSync(filePath);

        //Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "Extensión del fichero invalida"

        })

    }
    console.log("El id es:" + req.user.id.toString());


    try {
        let userUpdated = await User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true });

        if (!userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar",
                user: req.user
            });
        }

        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            user: userUpdated,
            file: req.file,
        });

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Error en la app",
            user: req.user,
            error: error.message
        });
    }




};




const avatar = (req, res) => {

    // Sacar el parametro de la url
    const file = req.params.file;
    //Montar el path real de la imagen 
    const filePath = "./uploads/avatars/" + file;

    //COMPROOBAR QUE EXISTE EL ARCHIVO 

    fs.stat(filePath, (error, exists) => {
        if (!exists) return res.status(404).send({ status: "error", message: "No existe la imagen " });
        if (error) return res.status(500).send({ status: "error", message: "Error en el servidor " });


        //Devolver un file
        return res.sendFile(path.resolve(filePath))
    });





}



// añadido
const counters = async (req, res) => {

    let userId = req.user.id;

    if (req.params.id) {
        userId = req.params.id;
    }

    try {
        const following = await follow.count({ "user": userId });

        const followed = await follow.count({ "followed": userId });

        const publications = await publication.count({ "user": userId });

        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en los contadores",
            error
        });
    }
}




//exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    porfile,
    list,
    update,
    upload,
    avatar,
    counters
}