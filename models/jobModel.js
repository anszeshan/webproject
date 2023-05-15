const mongoose = require("mongoose");
const validator = require("validator");

//Optimize:  ********* job Modal Schema ***********
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter title!"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Please enter country!"],
    },
    oppType: {
      type: String,
      required: [true, "Please enter oppType!"],
    },
    domain: [String],
    requirements: {
      type: String,
      required: [ true, "Please enter requirements!" ],
      trim: true,
    },
    description: {
      type: String,
      required: [ true, "Please enter description!" ],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
     default: Date.now()
    },
    status:{
      type:Boolean,
      default:true
    }
    ,
    employer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Employer',
      required: [true, 'A job must belong to an employer'],
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
// jobSchema.virtual( 'nickName' ).get( function () {
//   return this.name.slice(0,3);
// } )

//Todo: ********* Document/query/aggregation middlewares ***********

// **** DOCUMENT MIDDLEWARE: runs before .save() and .create()
jobSchema.pre("save", async function (next) {
  // HERE 'this' keyword === current document

  next();
});

// **** QUERRY MIDDLEWARE: runs before executing any find query
jobSchema.pre(/^find/, async function (next) {
  // HERE 'this' keyword === querry Obj

  next();
});

// **** AGGREGATION MIDDLEWARE: runs before executing Agrregation pipepline
jobSchema.pre("aggregate", async function (next) {
  // HERE 'this' keyword === aggregation Obj

  next();
});

//TODO:  ********* instance methods of documents ***********

jobSchema.methods.checkName = async function () {
  return ""; // return anything based on logic
};

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
