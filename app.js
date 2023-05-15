
// ********* ALL REQUIRE MODULES ************
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const path = require('path')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')
const Application  = require("./models/applicationModel");
//<Import Router>
const applicationRouter = require('./routes/applicationRouter');

const app = express()
app.use(cors())
// Set EJS as the view engine
app.set('view engine', 'ejs');


const newApplication  = {
  date: '2023-05-15',
  coverLetter: 'I am interested in this job',
  resume: 'resume.pdf',
  applicant: '1234567890', // the ID of the applicant user
  Interviewtatus: false,
  job: '0987654321', // the ID of the job
};

  
Application.create(newApplication )
  .then(application => console.log(application))
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
app.use('/api/v1/application', applicationRouter)


//! Settings for Deployment
app.use( '/image/users', express.static( path.join( __dirname, 'public', 'user' ) ) )
app.use( '/image/org', express.static( path.join( __dirname, 'public', 'org' ) ) )

//! Middleware for handling all other(ERROR) unhandled routes
 app.all('*', (req, res, next) => {
   next(new AppError("Can't find "+req.originalUrl+" , on this server!", 404)) // express automatically knows that, this is an error, so it call error handling middleware
 })

// ! ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler)

module.exports = app
