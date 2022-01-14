const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model("Admin", adminSchema);