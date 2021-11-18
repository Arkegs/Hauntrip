const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const helpfulnessSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    evidence: {
        type: Schema.Types.ObjectId,
        ref: 'Mystery'
    },
    value: {
        type: Number,
        min: -1,
        max: 1
    }
});

module.exports = mongoose.model("Helpfulness", helpfulnessSchema);