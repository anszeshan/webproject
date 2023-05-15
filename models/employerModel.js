
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const employerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  country: {
    type: String,
  },
  domain: {
    type: String,
  },
  about: {
    type: String,
  },
  phone: {
    type: String,
  },
  website: {
    type: String,
  },
  address: {
    type: String
  },
  role: {
    type: String,
    enum: ['institution', 'organization']
  },
  type: {
    type: String,
    enum: ['public', 'private']
  },
  researchInterest: [String],
  chats: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    },
    newMessages: {
      type: Object,
      default: {}
    },
    status: {
      type: String,
      default: 'online'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
},
{
  // TO SEE VIRTUAL FIELDS
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

employerSchema.virtual('job', {
  ref: 'Job',
  foreignField: 'employer',
  localField: '_id',
});

employerSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

employerSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

employerSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

employerSchema.methods.correctPassword = async function(
  candidatePassword,
  employerPassword
) {
  return await bcrypt.compare(candidatePassword, employerPassword);
};

employerSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

employerSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Employer = mongoose.model('Employer', employerSchema);

module.exports = Employer;
