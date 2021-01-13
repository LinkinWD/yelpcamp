const mongoose = require('mongoose')
const Review = require('./rewiev')
const Schema = mongoose.Schema

const campgroundSchema = new Schema( {
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String, 
    reviews: [
        {
            type: Schema.Types.ObjectId, ref: 'Review'
        }
    ]
})
//kun poistat campgroundin, poistaa myös arvostelut
campgroundSchema.post('findOneAndDelete', async function (doc) {
    //jos jotain deletoitiin
    if(doc){
        await Review.remove({
           _id: {
               $in: doc.reviews
           } 
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema)
