const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const academicInfoSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true,
  },
  bsc: {
    certificate: {
      url: String,
      publicId: String,
    },
  },
  msc: {
    certificate: {
      url: String,
      publicId: String,
    },
  },
  hsc: {
    certificate: {
      url: String,
      publicId: String,
    },
  },
  ssc: {
    certificate: {
      url: String,
      publicId: String,
    },
  },
  ielts: {
    certificate: {
      url: String,
      publicId: String,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

academicInfoSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AcademicInfo', academicInfoSchema);

