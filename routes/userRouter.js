
const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post( '/signup/user', userController.uploadUserPhoto,
  userController.resizeUserPhoto, authController.signupUser );
router.post('/login/user', authController.loginUser);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/chatlist/:id')
  .get(userController.getAllChatUser)
router
  .route('/wishlist/add/:id')
  .post(userController.addToWishList)
router
  .route('/wishlist/delete/:id')
  .post(userController.deleteFromWishList)
  router
  .route('/wishlist/:id')
  .get(userController.getWishList)
  router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
