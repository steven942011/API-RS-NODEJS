
const { Schema, model } = require("mongoose");
const mongoosePagination = require("mongoose-paginate-v2");
const UserSchema = Schema({
 name:{
    type:String,
    require:true
 },
 surname:String,
 bio:String,
 nick:{
    type:String,
     },
     email:{
        type:String,
        require:true,
        },
        password:{
          type:String,

        },
        role:{
        type:String,
        default:"role_user"
        },
      image:{
        type:String,
        default:"default.png"
      },
      created_at: {
        type: Date,
        default: Date.now,
    },

});

UserSchema.plugin(mongoosePagination);
// Exporta modelo   (coleccion / nombre de modelo/ lo pluralisa users, Fromato, en que coleccion se guardara)
module.exports = model("User",UserSchema,"users");





