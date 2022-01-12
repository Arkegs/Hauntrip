const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verificatorSchema = new Schema({
    newUser: {
        type: String,
        required: true
    },
    activationKey: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    }
}, 
{
    timestamps: { createdAt: true, updatedAt: true }
});

module.exports = mongoose.model("Verificator", verificatorSchema);