const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema({
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },

    name:{
        type: String,
        required: [true, 'Name is required'],
        unique: true,
    },
    password:{
        type: String,
        required: [true, 'Password is required']
    },

    isActive:{
        type: Boolean,
        default: false
    },

    isBlocked:{
        type: Boolean,
        default: false
    },

    address:{
        type: String,
        required: [true, "address is required"]
    },

    city:{
        type: String,
        required:[true]
    },

    mobileno:{
        type: String,
        required: [true]
    },

    gst: {
        type: String,
        required:[true]
    },

    company:{
        type: String,
        required: [true]
    }
}, {timestamps: true})


module.exports = mongoose.model('User', userSchema);