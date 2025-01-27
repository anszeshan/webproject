
const Employer=require( "../models/employerModel" );
const catchAsync=require( "../utils/catchAsync" );
const AppError=require( "../utils/appError" );
const factory=require( './handlerFactory' );
const multer = require('multer');
const sharp = require('sharp');

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
  const filename="org-"+Date.now()+".jpeg";
  req.file.filename=filename;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile( "public/img/org/"+req.file.filename );
  req.body.photo=filename
  next();
});


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};



exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await Employer.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});



exports.getAllChatUser = catchAsync(async (req, res, next) => {
 
  let users = (await Employer.findById(req.params.id,'chats').populate({path:'chats'})).toObject();
  console.log(users)
 res.status(200).json({
   status: 'success',
   data: {
     user: users
   }
 });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Employer.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});


// Optimize: get all 
exports.getAllEmployer=factory.getAll( Employer );

// Optimize: get single data basaed on id
exports.getSingleEmployer=factory.getOne( Employer , { path: 'job' } );

// Optimize: Create  
exports.createEmployer=factory.createOne( Employer );

// Optimize: update based on id 
exports.updateEmployer=factory.updateOne( Employer )

// Optimize: delete  based on id 
exports.deleteEmployer=factory.deleteOne( Employer );

//exports.greet=catchAsync( async ( req, res, next ) => {
  
  //? (2) Send the delete response with 204 code
//  res.status( 200 ).json( {
//    status: "success",
//    data: "Hello World!"
//  } )
//} );
