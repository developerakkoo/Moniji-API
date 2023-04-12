const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const orderSchema = new Schema({
    diameter:{
        type: number,
        required: [true]
    },

    length:{
        type: number,
        required: [true]
    },

    make:{
        type: String,
        required: [true]
    },

    quantity:{
        type: number,
        required: [true]
    },

    orderid:{
        type: number,
        required: [true]
    },
    status:{
        type: number,
        required: [true]
    },

    type:{
        type: String,
        required: [true]
    },

    userId:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps : true})


module.exports = mongoose.model('Order', orderSchema);