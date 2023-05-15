
const Application=require( "../models/applicationModel" );
const Job=require( "../models/jobModel" );
const catchAsync=require( "../utils/catchAsync" );
const AppError=require( "../utils/appError" );
const factory=require( './handlerFactory' );
const multer = require('multer');
const sharp = require('sharp');
const User = require("../models/userModel");
const Employer = require("../models/employerModel");

//Todo:  ********* helper functuions ***********

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});



exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = "user-"+req.user.id+"-"+Date.now()+".jpeg";

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile("public/img/users/"+req.file.filename);

  next();
});


exports.startChat = catchAsync( async ( req, res, next ) => {
  let query = Application.findById(req.params.id)
  query = query.populate({path:'job'})
  const application = await query

  if (!application) {
    return next(
      new AppError("Could not found document with ID: "+req.params.id, 404)
    )
  }
  
  let userId = application.applicant;
  let orgId = application.job.employer;
  
  let userChat = (await User.findById(userId,'chats')).toObject().chats
  let employerChat = (await Employer.findById(orgId,'chats')).toObject().chats


  userChat.push(orgId);
  employerChat.push(userId);

  await User.findByIdAndUpdate(userId,{chats:userChat})
  await Employer.findByIdAndUpdate(orgId,{chats:employerChat})

 res.status( 200 ).json( {
   status: "success",
 } )
} );


exports.hireEmp = catchAsync( async ( req, res, next ) => {
  let query = Application.findById(req.params.id)
  query = query.populate({path:'job'})
  const application = await query

  if (!application) {
    return next(
      new AppError("Could not found document with ID: "+req.params.id, 404)
    )
  }
  
  let userId = application.applicant;
  let orgId = application.job.employer;
  
  let emp = (await Employer.findById(orgId)).toObject()


  await User.findByIdAndUpdate(userId,{organization:emp.name});
  await Job.findByIdAndUpdate(application.job.id,{status:false})
  await Application.findByIdAndDelete(req.params.id);
 res.status( 200 ).json( {
   status: "success",
 } )
} );


// Optimize: get all 
exports.getAllApplication=factory.getAll( Application ,{path:'applicant job'});

// Optimize: get single data basaed on id
exports.getSingleApplicationForUser=factory.getOne( Application ,{path:'job'} );
// Optimize: get single data basaed on id
exports.getSingleApplicationForEmployer=factory.getOne( Application,{path:'applicant job'} );

// Optimize: Create  
exports.createApplication=factory.createOne( Application );

// Optimize: update based on id 
exports.updateApplication=factory.updateOne( Application )

// Optimize: delete  based on id 
exports.deleteApplication=factory.deleteOne( Application );

//exports.greet=catchAsync( async ( req, res, next ) => {
  
  //? (2) Send the delete response with 204 code
//  res.status( 200 ).json( {
//    status: "success",
//    data: "Hello World!"
//  } )
//} );
