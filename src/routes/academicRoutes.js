const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateAcademicInfo, getAcademicInfo, deleteCertificate } = require('../controllers/academicController');

router.get('/', authenticate, getAcademicInfo);
router.post('/upload', authenticate, upload.single('certificate'), updateAcademicInfo);
router.delete('/:certificateType', authenticate, deleteCertificate);

module.exports = router;

