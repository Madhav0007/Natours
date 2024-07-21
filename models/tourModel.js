const mongoose = require('mongoose');
const slugify = require('slugify');
const { stripLow } = require('validator');
const User = require('./userModel');
// const validator=require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour named must have less than equal 40 characters '],
      minlength: [10, 'A tour named must have more than equal 10 characters ']
      // validate:[validator.isAlpha,'tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a durations']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have price']
    },
    // Custom Validator
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price; //100<200 then true
        },
        message: 'Discount price ({VALUE}) should be below than regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have ImageCover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GEOJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    // it makes virtuals visible in postman
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// tourSchema.index({price:1})
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// durationweek is name of virtual property and we have used normal function..not the arrow func bcoz arrow function not generally gets this keyword
tourSchema.virtual('durationWeeks').get(function() {
  // calc duration in weeks
  return this.duration / 7;
});

// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// Mongoose document middlewares : runs before .save() and .create() command
tourSchema.pre('save', function(next) {
  console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// EMBEDDING EXAMPLE
// tourSchema.pre('save',async function(next){
//   const guidesPromises=this.guides.map(async id=>await User.findById(id));
//   this.guides=await Promise.all(guidesPromises);
//   next();
// })

// tourSchema.pre('save',function(next)
// {
// console.log('will save doc')
// next();
// })
// // post matlab pachiiii so doc will be printed in console after running
// tourSchema.post('save',function(doc,next)
// {
//   console.log(doc);
//   next();
// })

// Query Middleware
// tourSchema.pre('find',function(next)

// it will work for all find functions of query middlewares , example find and findOne
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`query took ${Date.now() - this.start} millisecond`);
//   next();
// });

// AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//   // unshift adds at the begining of array.........$ne:true means removing all tours from output whosw property is true
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
