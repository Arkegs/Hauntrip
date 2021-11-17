const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const spookinessSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    mystery: {
        type: Schema.Types.ObjectId,
        ref: 'Mystery'
    },
    value: Number
});

module.exports = mongoose.model("Spookiness", spookinessSchema);