const AcademicInfo = require('../models/AcademicInfo');
const calculateProfilePercentage = require('../utils/calculateProfilePercentage');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const updateAcademicInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { certificateType } = req.body; // bsc, msc, hsc, ssc, ielts

    if (!certificateType || !['bsc', 'msc', 'hsc', 'ssc', 'ielts'].includes(certificateType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate type. Must be one of: bsc, msc, hsc, ssc, ielts',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a certificate file',
      });
    }

    let academicInfo = await AcademicInfo.findOne({ userId });

    if (!academicInfo) {
      academicInfo = new AcademicInfo({ userId });
    }

    // Delete old certificate if exists
    if (academicInfo[certificateType] && academicInfo[certificateType].certificate && academicInfo[certificateType].certificate.publicId) {
      await deleteFromCloudinary(academicInfo[certificateType].certificate.publicId);
    }

    // Upload new certificate
    const uploadResult = await uploadToCloudinary(req.file.buffer, `admission/academic/${certificateType}`);

    academicInfo[certificateType] = {
      certificate: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      },
    };

    await academicInfo.save();

    const percentage = await calculateProfilePercentage(userId);

    res.status(200).json({
      success: true,
      message: `${certificateType.toUpperCase()} certificate uploaded successfully`,
      data: {
        academicInfo,
        profilePercentage: percentage,
      },
    });
  } catch (error) {
    console.error('Academic info update error:', error);
    res.status(500).json({
      success: false,
      message: 'Academic info update failed',
      error: error.message,
    });
  }
};

const getAcademicInfo = async (req, res) => {
  try {
    const userId = req.userId;

    const academicInfo = await AcademicInfo.findOne({ userId });
    const percentage = await calculateProfilePercentage(userId);

    res.status(200).json({
      success: true,
      data: {
        academicInfo: academicInfo || null,
        profilePercentage: percentage,
      },
    });
  } catch (error) {
    console.error('Get academic info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic info',
      error: error.message,
    });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const userId = req.userId;
    const { certificateType } = req.params;

    if (!['bsc', 'msc', 'hsc', 'ssc', 'ielts'].includes(certificateType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate type',
      });
    }

    const academicInfo = await AcademicInfo.findOne({ userId });

    if (!academicInfo || !academicInfo[certificateType] || !academicInfo[certificateType].certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Delete from Cloudinary
    if (academicInfo[certificateType].certificate.publicId) {
      await deleteFromCloudinary(academicInfo[certificateType].certificate.publicId);
    }

    // Remove from database
    academicInfo[certificateType] = undefined;
    await academicInfo.save();

    const percentage = await calculateProfilePercentage(userId);

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
      data: {
        academicInfo,
        profilePercentage: percentage,
      },
    });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate',
      error: error.message,
    });
  }
};

module.exports = {
  updateAcademicInfo,
  getAcademicInfo,
  deleteCertificate,
};

