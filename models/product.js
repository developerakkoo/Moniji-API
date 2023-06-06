const moment = require('moment/moment');
const mongoose = require('mongoose');


const Schema = mongoose.Schema;




const productSchema = new Schema({
    Make:{
        type: String,
    },
    Type:{
        type: String,
    },
    DiaInMm:{
        type: Number,
    },
    LengthInMm:{
        type: Number,
    },
    PartNo:{
        type: String,
    },
    

}, {timestamps : true})

module.exports = mongoose.model('Product', productSchema);