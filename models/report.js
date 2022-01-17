const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const reportSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    authorName: String,
    report: String,
    reportType: {type: String, enum: ['mystery','evidence', 'user']},
    accused: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    accusedName: String,
    reportedElement: String,
    evidenceContent: String,
    mystery: {
        type: Schema.Types.ObjectId,
        ref: 'Mystery'
    }
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

reportSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Report", reportSchema);