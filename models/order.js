const moment = require('moment/moment');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const orderSchema = new Schema({
    orderId:{
        type: Number,
        required: [true]
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    OrderedProducts:[{
        PartNo: { type: String },
        Make: { type: String },
        Type: { type: String },
        DiaInMm: { type: Number },
        LengthInMm: { type: Number },
        units: { type: String },
        quantity: { type: Number, required: true, default: 1 },
        
    }],
    status:{
        type: Number,
        default:1
    },
    message:{
        type: String,
        default:"N/A"
    },
    isAccepted:{
        type: Boolean,
        default:false
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