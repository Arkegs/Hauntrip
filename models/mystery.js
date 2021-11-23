const mongoose = require('mongoose');
const Evidence = require('./evidence');
const user = require('./user');
const Schema = mongoose.Schema;

const opts = { toJSON: {virtuals: true}, timestamps: { createdAt: true, updatedAt: false }};

const MysterySchema = new Schema({
    title: String,
    description: String,
    location: String,
    image: {
        url: String,
        filename: String
    },
    geometry: {
        type:{
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type: [Number],
            required: true
        }
    },
    category: String,
    credibility: {
        type: Number,
        default: 0
    },    
    spookiness: {
        type: Number,
        default: 0
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    evidences: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Evidence'
        }
    ]
}, opts);

MysterySchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Evidence.remove({
            _id: {
                $in: doc.evidences
            }
        })
    }
}); 

MysterySchema.virtual('properties.popUpMarkup').get(function(){
    return `
    <strong><a href="/mysteries/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,40)}...</p>`
});

module.exports = mongoose.model('Mystery', MysterySchema);