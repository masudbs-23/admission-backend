const Profile = require('../models/Profile');
const calculateProfilePercentage = require('../utils/calculateProfilePercentage');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, phone, address } = req.body;

    let profile = await Profile.findOne({ userId });

    if (!profile) {
      profile = new Profile({ userId });
    }

    if (name) profile.name = name;
    if (email) profile.email = email;
    if (phone) profile.phone = phone;
    if (address) profile.address = address;

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (profile.image && profile.image.publicId) {
        await deleteFromCloudinary(profile.image.publicId);
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, 'admission/profiles');
      profile.image = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
    }

    await profile.save();

    const percentage = await calculateProfilePercentage(userId);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile,
        profilePercentage: percentage,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const profile = await Profile.findOne({ userId });
    const percentage = await calculateProfilePercentage(userId);

    res.status(200).json({
      success: true,
      data: {
        profile: profile || null,
        profilePercentage: percentage,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

const getProfilePercentage = async (req, res) => {
  try {
    const userId = req.userId;
    const percentage = await calculateProfilePercentage(userId);

    res.status(200).json({
      success: true,
      data: {
        profilePercentage: percentage,
      },
    });
  } catch (error) {
    console.error('Get profile percentage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile percentage',
      error: error.message,
    });
  }
};

module.exports = {
  updateProfile,
  getProfile,
  getProfilePercentage,
};

