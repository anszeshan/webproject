const mongoose = require("mongoose");
const validator = require("validator");

//Optimize:  ********* application Modal Schema ***********
const applicationSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, "Please enter date!"],
    },
    coverLetter: {
      type: String,
      required: [true, "Please enter coverLetter!"],
      trim: true,
    },
    resume: {
      type: String,
      // required: [true, "Please upload resume!"],
      trim: true,
    },
    applicant: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A application must belong to an applicant"],
    },
    Interviewtatus: {
      type: Boolean,
      default: false,
    },
    job: {
      type: mongoose.Schema.ObjectId,
      ref: "Job",
      required: [true, "A applicaiton must belong to an job"],
    },
  },
  {
    // TO SEE VIRTUAL FIELDS
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//Todo: ********* Adding virtual properties ***********
// *** Whatever return will be set to virtual property value
// applicationSchema.virtual( 'nickName' ).get( function () {
//   return this.name.slice(0,3);
// } )

//Todo: ********* Document/query/aggregation middlewares ***********

// **** DOCUMENT MIDDLEWARE: runs before .save() and .create()
applicationSchema.pre("save", async function (next) {
  // HERE 'this' keyword === current document

  next();
});

// **** QUERRY MIDDLEWARE: runs before executing any find query
applicationSchema.pre(/^find/, async function (next) {
  // HERE 'this' keyword === querry Obj

  next();
});

// **** AGGREGATION MIDDLEWARE: runs before executing Agrregation pipepline
applicationSchema.pre("aggregate", async function (next) {
  // HERE 'this' keyword === aggregation Obj

  next();
});

//TODO:  ********* instance methods of documents ***********

applicationSchema.methods.checkName = async function () {
  return ""; // return anything based on logic
};

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
