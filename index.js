//Importar dependencias
const connection =require("./database/connection");
const express = require("express");
const cors   =require("cors")


//Mensaje de bienvenida
console.log("API NODE para RED SOCIAL arrancada!!");

// conexion a bddd
connection();

// crear servidor node
const app = express();
const port =4700;


//configurar cors
app.use(cors());

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
// convertir los datos del body a objeto js
app.use(express.json());
app.use(express.urlencoded({extended:true}));



//cargar conf rutas
const UserRoutes   = require("./routers/users");
const publicRouter = require("./routers/publication");
const FollowRouter = require("./routers/follow");


app.use("/api/user",UserRoutes);
app.use("/api/publication",publicRouter);
app.use("/api/follow",FollowRouter);

//app.get('/rutas-prueba',(req,res)=>{

//     return res.status(200).json({
//         "id":1,
//         "nombre":"Milton",
//         "web":"https://steven942011.github.io/stevengarcia.github.io/index.html"
//     });

// });

// poner servidor a escuchar peticiones http

app.listen(port,()=>{
    console.log("Servidor de node corriendo en el puerto",port);
});

