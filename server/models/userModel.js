const mongoose = require('mongoose');

/**
 * Schema for user records in MongoDB
 * Stores user profile information including name, email, password
 * Contains array of favorite associations with their details
 * Automatically adds timestamps for created/updated dates
 */
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String, 
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    Association: [
      {
        associationName: {
          type: String,
        },
        associationNumber: {
          type: Number,
        },
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);