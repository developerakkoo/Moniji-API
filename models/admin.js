const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const adminSchema = new Schema({
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },

    password:{
        type: String,
        required: [true, 'Password is required']
    }
}, {timestamps: true})


module.exports = mongoose.model('Admin', adminSchema);