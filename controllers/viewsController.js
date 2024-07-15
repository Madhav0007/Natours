const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Booking=require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1- get tour data from collection
  const tours = await Tour.find();

  //   2- build template

  //  3- render that template using tour data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1 Get the data , for the requested tour(including reviews and guide)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if(!tour)
  {
    return next(new AppError('There is no tour with that name.',404))
  }
    // 2 Build template

  // 3 render template using data from step 1
  res.status(200).render('tour', {
    title: `${tour.name}Tour`,
    tour,
  });
});
exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
exports.getAccount=(req,res)=>{
  res.status(200).render('account', {
    title: 'Your account',
  });
}

// exports.getMyTours = catchAsync(async (req, res, next) => {
//   // 1) Find all bookings
//   const bookings = await Booking.find({ user: req.user.id });

//   // 2) Find tours with the returned IDs
//   const tourIDs = bookings.map(el => el.tour);
//   const tours = await Tour.find({ _id: { $in: tourIDs } });

//   res.status(200).render('overview', {
//     title: 'My Tours',
//     tours
//   });
// });

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  console.log('Bookings retrieved:', bookings);

  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  console.log('Tours retrieved:', tours);

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});


exports.updateUserData=catchAsync(async(req,res,next)=>{
  const updatedUser=await User.findByIdAndUpdate(req.user.id,{
    name:req.body.name,
    email:req.body.email
  },
{
  new:true,
  runValidators:true
})
res.status(200).render('account', {
  title: 'Your account',
  user:updatedUser
});
})