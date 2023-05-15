
// ********* ALL REQUIRE MODULES ************
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const path = require('path')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const Job=require( "./models/jobModel" );
const User = require("./models/userModel");
const jobRouter = require('./routes/jobRouter');
const userRouter = require('./routes/userRouter');


const app = express()
app.use(cors())
// Set EJS as the view engine
app.set('view engine', 'ejs');

//! To set headers
app.use(helmet())
const newJob = {
  title: 'Software Engineer',
  country: 'United States',
  oppType: 'Full-time',
  domain: ['Software Development', 'Web Development'],
  requirements: '5+ years of experience in software development',
  description: 'We are seeking a highly skilled software engineer to join our team',
  instructions: 'Please apply with your resume and cover letter',
  employer: '60a7b5c4c2d5c35b546d289d' // The ID of the employer document this job belongs to
};

const newUser = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  photo: 'jane.jpg',
  organization: 'ABC Inc',
  country: 'USA',
  bio: 'I am a researcher',
  educaiton: {
    degree: 'Master of Science',
    filedOfStudy: 'Computer Science',
    institute: 'XYZ University',
    yearGrad: '2022'
  },
  phone: '555-1234',
  skills: 'JavaScript, Python',
  language: 'English',
  role: 'researcher',
  wishList: ['1234567890', '0987654321'],  
  researchInterest: ['AI', 'Machine Learning'],
  chats: ['9876543210'], // the IDs of the employers in the chats
  password: 'password123',
  passwordConfirm: 'password123',
};
User.create(newUser)
  .then(user => console.log(user))
  .catch(error => console.error(error));

Job.create(newJob)
  .then(job => console.log(job))
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
app.use('/api/v1/job', jobRouter)
app.use('/api/v1/user', userRouter)

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
