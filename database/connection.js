const mongoose = require("mongoose");

const connection = async()=>{

       try{
           await mongoose.connect('mongodb://127.0.0.1:27017/Red_Social');
              console.log("Conectado correctamente a db: Red_Social")
       }catch(err){
              console.log(err);
       
       }

       
}; 


module.exports =connection;