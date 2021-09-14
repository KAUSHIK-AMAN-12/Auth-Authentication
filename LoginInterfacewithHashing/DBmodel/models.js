const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
    name : {
          type : String ,
          required : true
    },
    password : {
     type : String , 
     required : true
    },
    email : {
     type : String,
     required : true
    },
    age : {
        type : Number,
        required : true
    },
    profession : {
        type : String,
        required : true 
    },
    githublink : {
        type : String,
        required : false
    },
    Dateofbirth : {
        type : Number,
        required : true
    },
    Monthofbirth : {
        type : Number,
        required : true
    },
    Yearofbirth : {
        type : Number,
        required : true
    }
})

module.exports = mongoose.model('userAuth' , usersSchema)