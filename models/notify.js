const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const notifySchema = new Schema({
   message: {
    type: String
   },
   userId:{
    type: Schema.Types.ObjectId,
    ref: "User"
   }
}, {timestamps: true})


module.exports = mongoose.model('Notify', notifySchema);