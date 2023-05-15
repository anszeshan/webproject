
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const { Mongoose } = require('mongoose');


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
  const filename="user"+"-"+Date.now()+".jpeg"
  req.file.filename=filename;

  await sharp(req.file.buffer)
    .resize( 200, 200 )
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile("public/img/users/"+req.file.filename);
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

exports.getAllChatUser = catchAsync(async (req, res, next) => {
 
   let users = (await User.findById(req.params.id,'chats').populate({path:'chats'})).toObject();
   console.log(users)
  res.status(200).json({
    status: 'success',
    data: {
      user: users
    }
  });
});

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
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
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

exports.addToWishList =catchAsync(async (req, res, next) => {
  let jobId = req.body.jobid;
  let _wishList = (await User.findById(req.params.id,'wishList')).toObject().wishList;
  _wishList.push(jobId)
  let newDoc = await User.findByIdAndUpdate(req.params.id,{wishList:_wishList})
  if(!newDoc)
  res.status(500).json({
    status: 'error',
    message: 'user not updated'
  });
 res.status(200).json({
   status: 'success',
   data: {
     user: newDoc
   }
 });
});
exports.deleteFromWishList =catchAsync(async (req, res, next) => {
  let jobId = req.body.jobid;
  let _wishList = (await User.findById(req.params.id,'wishList')).wishList;
  _wishList = _wishList.map((el)=>el.toString())
  const index = _wishList.indexOf(jobId);
if (index > -1) { // only splice array when item is found
  _wishList.splice(index, 1); // 2nd parameter means remove one item only
}

console.log(index,_wishList)
  let newDoc = await User.findByIdAndUpdate(req.params.id,{wishList:_wishList})
  if(!newDoc)
  res.status(500).json({
    status: 'error',
    message: 'user not updated'
  });
 res.status(200).json({
   status: 'success',
   data: {
     user: newDoc
   }
 });
});

exports.getWishList =catchAsync(async (req, res, next) => {
  let doc = (await User.findById(req.params.id,'wishList').populate({path:'wishList'})).toObject();

  const wl=[ ...new Set( doc.wishList ) ]
  console.log( wl )

  if(!doc)
  res.status(500).json({
    status: 'error',
    message: 'doc not found'
  });
 res.status(200).json({
   status: 'success',
   data: {
     wishlist: wl
   }
 });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

exports.getUser = factory.getOne(User,{path:'applications'});
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
