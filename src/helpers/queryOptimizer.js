/**
 * Database Query Optimization Helpers
 */

// Optimize student list query with aggregation
const getStudentsWithDetailsOptimized = async (User, Profile, AcademicInfo, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Use aggregation pipeline for better performance
  const pipeline = [
    { $match: { role: 'student' } },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'profile',
      },
    },
    {
      $lookup: {
        from: 'academicinfos',
        localField: '_id',
        foreignField: 'userId',
        as: 'academicInfo',
      },
    },
    {
      $project: {
        password: 0,
        otp: 0,
        passwordResetOTP: 0,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $addFields: {
        profile: { $arrayElemAt: ['$profile', 0] },
        academicInfo: { $arrayElemAt: ['$academicInfo', 0] },
      },
    },
  ];

  const [students, total] = await Promise.all([
    User.aggregate(pipeline),
    User.countDocuments({ role: 'student' }),
  ]);

  return {
    students: students.map((student) => ({
      id: student._id,
      email: student.email,
      isVerified: student.isVerified,
      createdAt: student.createdAt,
      profile: student.profile || null,
      academicInfo: student.academicInfo || null,
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalStudents: total,
      limit,
    },
  };
};

// Optimize single student query
const getStudentByIdOptimized = async (User, Profile, AcademicInfo, studentId) => {
  const pipeline = [
    { $match: { _id: studentId, role: 'student' } },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'profile',
      },
    },
    {
      $lookup: {
        from: 'academicinfos',
        localField: '_id',
        foreignField: 'userId',
        as: 'academicInfo',
      },
    },
    {
      $project: {
        password: 0,
        otp: 0,
        passwordResetOTP: 0,
      },
    },
    {
      $addFields: {
        profile: { $arrayElemAt: ['$profile', 0] },
        academicInfo: { $arrayElemAt: ['$academicInfo', 0] },
      },
    },
  ];

  const result = await User.aggregate(pipeline);
  
  if (result.length === 0) {
    return null;
  }

  const student = result[0];
  return {
    id: student._id,
    email: student.email,
    isVerified: student.isVerified,
    createdAt: student.createdAt,
    profile: student.profile || null,
    academicInfo: student.academicInfo || null,
  };
};

module.exports = {
  getStudentsWithDetailsOptimized,
  getStudentByIdOptimized,
};

