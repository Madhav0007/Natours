const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// start express app
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1 GLOBAL MIDDLEWARES
// SERVING STATIC FILES
// app.use(express.static(`${__dirname}/starter/public`));
app.use(express.static(path.join(__dirname, 'public')));

//  SECURITY HTTP HEADER
// app.use(helmet());

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         // scriptSrc: ["'self'", "https://api.mapbox.com"],
//         scriptSrc: [
//           "'self'",
//           'https://api.mapbox.com',
//           'https://cdnjs.cloudflare.com',
//           'https://js.stripe.com',
//           "'unsafe-inline'",
//         ],
//         // scriptSrc: ["'self'", "https://api.mapbox.com", "'unsafe-inline'"],
//         styleSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           'https://api.mapbox.com',
//           'https://fonts.googleapis.com',
//         ],
//         imgSrc: ["'self'", 'data:', 'https://api.mapbox.com', 'blob:'],
//         connectSrc: [
//           "'self'",
//           'https://api.mapbox.com',
//           'https://events.mapbox.com',
//           'ws://127.0.0.1:6406',
//         ],
//         fontSrc: [
//           "'self'",
//           'https://fonts.googleapis.com',
//           'https://fonts.gstatic.com',
//         ],
//         frameSrc: ["'self'", 'https://js.stripe.com'],
//         workerSrc: ["'self'", 'blob:'],
//         objectSrc: ["'none'"],
//         upgradeInsecureRequests: [],
//       },
//     },
//   }),
// );

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://cdnjs.cloudflare.com',
          'https://js.stripe.com',
          "'unsafe-inline'"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com'
        ],
        imgSrc: ["'self'", 'data:', 'https://api.mapbox.com', 'blob:'],
        connectSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'ws://127.0.0.1:6406'
        ],
        fontSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com'
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: true // Correct value
      }
    }
  })
);

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUEST FROM SAME API
const limiter = rateLimit({
  // maximum 100 request can be send from same IP
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP , please try again later '
});
app.use('/api', limiter);

// BODY PARSER,READING DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

//DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

// TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3 ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// all contains all http method GET,POST,PATCH ETC
app.all('*', (req, res, next) => {
  next(new AppError(`can't find  ${req.originalUrl} on this server`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

// 4 START SERVER
module.exports = app;
