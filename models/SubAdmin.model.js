const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subAdminSchema = new Schema({
    name:{
        type: String,
        required: [true, 'Name is required'],
        unique: true,
    },
    email:{
        type: String,
        required: [true, 'Password is required'],
        unique: true
    },
    
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    isActive:{
        type: Boolean,
        default: false
    },
    canAcceptOrder:{
        type: Boolean,
        default: false
    },
    canUpdateOrder:{
        type: Boolean,
        default: false
    },
    canDeleteOrder:{
        type: Boolean,
        default: false
    },
    canAcceptUser:{
        type: Boolean,
        default: false
    }
});




module.exports = mongoose.model('SubAdmin', subAdminSchema);

