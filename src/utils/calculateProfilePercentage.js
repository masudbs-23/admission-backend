const Profile = require('../models/Profile');
const AcademicInfo = require('../models/AcademicInfo');

const calculateProfilePercentage = async (userId) => {
  const profile = await Profile.findOne({ userId });
  const academicInfo = await AcademicInfo.findOne({ userId });

  let totalFields = 0;
  let filledFields = 0;

  // Profile fields (5 fields)
  const profileFields = ['name', 'image', 'address', 'phone', 'email'];
  totalFields += profileFields.length;

  if (profile) {
    profileFields.forEach((field) => {
      if (field === 'image') {
        if (profile.image && profile.image.url) filledFields++;
      } else if (field === 'email') {
        if (profile.email) filledFields++;
      } else {
        if (profile[field]) filledFields++;
      }
    });
  }

  // Academic fields (5 certificates)
  const academicFields = ['bsc', 'msc', 'hsc', 'ssc', 'ielts'];
  totalFields += academicFields.length;

  if (academicInfo) {
    academicFields.forEach((field) => {
      if (academicInfo[field] && academicInfo[field].certificate && academicInfo[field].certificate.url) {
        filledFields++;
      }
    });
  }

  const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  return percentage;
};

module.exports = calculateProfilePercentage;

