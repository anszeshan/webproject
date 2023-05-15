
const Job=require( "../models/jobModel" );
const catchAsync=require( "../utils/catchAsync" );
const AppError=require( "../utils/appError" );
const factory=require( './handlerFactory' );


//Todo:  ********* helper functuions ***********

exports.getJobsOfEmployer = catchAsync(async (req, res, next) => {
  let jobs = await Job.find({employer:req.params.id});
 res.status(200).json({
   status: 'success',
   data: {
     jobs: jobs
   }
 });
});



// Optimize: get all 
exports.getAllJob=factory.getAll( Job, { path: 'employer' } );

// Optimize: get single data basaed on id
exports.getSingleJob=factory.getOne( Job, { path: 'employer' } );

// Optimize: Create  
exports.createJob=factory.createOne( Job );

// Optimize: update based on id 
exports.updateJob=factory.updateOne( Job )

// Optimize: delete  based on id 
exports.deleteJob=factory.deleteOne( Job );

//exports.greet=catchAsync( async ( req, res, next ) => {
  
  //? (2) Send the delete response with 204 code
//  res.status( 200 ).json( {
//    status: "success",
//    data: "Hello World!"
//  } )
//} );
