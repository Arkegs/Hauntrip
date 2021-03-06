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
    value: {
        type: Number,
        min: 0,
        max: 5
    }
});

module.exports = mongoose.model("Spookiness", spookinessSchema);