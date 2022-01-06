const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    birthdate:{
        type: Date,
        required: true
    },
    exp:{
        type: Number,
        default: 0
    },
    banned:{
        type: Number,
        default: 0
    },
    status:{
        type: String,
        default: 'active'
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
}, 
{
    timestamps: { createdAt: true, updatedAt: false }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);