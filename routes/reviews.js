const express = require('express')
//ottaa paramsit indexistä, että voidaan käyttää 'campgroundia'
const router =express.Router( {mergeParams: true})



const {reviewSchema} = require('../schemas.js')
const Campground = require('../models/campground')
const Review = require('../models/rewiev')


const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/expressError')

const validateReview = (req, res, next) => {
    const { error } =reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

//arvostelut
router.post('/', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))


module.exports = router