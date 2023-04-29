const moment = require('moment/moment');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const orderSchema = new Schema({
    diameter:{
        type: Number,
        required: [true]
    },

    length:{
        type:Number,
        required: [true]
    },

    make:{
        type: String,
        required: [true]
    },

    quantity:{
        type: Number,
        required: [true]
    },

    orderId:{
        type: Number,
        required: [true]
    },
    status:{
        type: Number,
        default:1
    },

    type:{
        type: String,
        required: [true]
    },
    message:{
        type: String,
    },
    isAccepted:{
        type: Boolean,
        default:false
    },

    isAlternate:{
        type: Boolean
    },

    userId:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    Date:{
        type:String,
        default:moment().format('DD-MM-YY')
    },
    Day:{
        type:String,
        default:moment().format('DD')
    },
    Month:{
        type:String,
        default:moment().format('MM')
    },
    Year:{
        type:String,
        default:moment().format('YY')
    },
}, {timestamps : true})


module.exports = mongoose.model('Order', orderSchema);