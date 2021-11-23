const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function(){
    this.url.replace('/upload', '/upload/w_100');
});

const evidenceSchema = new Schema({
    title: String,
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    images: [ImageSchema],
    conclusion: {type: String, enum: ['real','fake']},
    helpfulness: {
        type: Number,
        default: 0
    },
    expgiven: {
        type: Number,
        default: 0
    },
    isHelpful: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model("Evidence", evidenceSchema);