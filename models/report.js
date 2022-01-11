const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    report: String,
    reportType: {type: String, enum: ['mystery','evidence', 'user']},
    accused: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reportedElement: String
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model("Report", reportSchema);