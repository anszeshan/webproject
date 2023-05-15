
// ********* ALL REQUIRE MODULES ************
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const Employer=require( "./models/employerModel" );
//<Import Router>
const employerRouter = require('./routes/employerRouter');

const app = express()
app.use(cors())
// Set EJS as the view engine
app.set('view engine', 'ejs');



const newEmployer = {
  name: 'John Smith',
  email: 'john@example.com',
  photo: 'john.jpg',
  country: 'USA',
  domain: 'IT',
  about: 'We are a technology company',
  phone: '555-1234',
  website: 'https://example.com',
  address: '123 Main St',
  role: 'organization',
  type: 'public',
  researchInterest: ['AI', 'Machine Learning'],
  password: 'password123',
  passwordConfirm: 'password123',
};


Employer.create(newEmployer)
  .then(employer => console.log(employer))
  .catch(error => console.error(error));

//! Logging Middleware
if (process.env.NODE_ENV.trim() === 'development') {
  app.use(morgan('dev')) // to see the information of request in console
}

//! limit the requests from same IP address (Rate-limiting middle-ware)
const limiter = rateLimit({
  max: 100, //no of request per IP in below time
  windowMs: 60 * 60 * 1000, // 1-hour
  message: 'Too many request from this IP, please try again in an hour!'
})
app.use('/api', limiter)

//! Body parser MiddleWare
app.use(express.json({ limit: '10kb' })) // to attached the content of body to request obj(req.body) (mostly for patch request)

//! Cookie parser MiddleWare
app.use( cookieParser() ) // to attached the cookies of request to req.cookies

//! attach form data to req.body
app.use(express.urlencoded({ extended: true }))

//! Data Sanitization Middlewares

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize()) //basically remove all the '$' signs and 'dots'

// Data sanitization against XSS attack
app.use(xss()) //clean  malicious html code from user input

//! MiddleWare for specfic routes

//<Use Router middleware>
app.use('/api/v1/employer', employerRouter)


//! Middleware for handling all other(ERROR) unhandled routes
 app.all('*', (req, res, next) => {
   next(new AppError("Can't find "+req.originalUrl+" , on this server!", 404)) // express automatically knows that, this is an error, so it call error handling middleware
 })

// ! ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler)

module.exports = app
