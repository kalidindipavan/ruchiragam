/**
 * @file upload.routes.js
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

const { authenticate, authorize } = require('../middleware/auth');
const uploadService = require('../services/uploadService');
const { sendCreated } = require('../utils/apiResponse');

// Memory storage keeps file buffer in memory allowing us to instantly pipe it to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only accept jpeg/png/webp
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Only JPG/PNG/WEBP allowed.'));
    }
  }
});

/**
 * POST /api/upload
 * Requires Admin or Seller role. Expected form-data key: 'image'
 */
router.post('/', authenticate, authorize('admin', 'seller'), upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No valid image file attached' });
  }

  const result = await uploadService.uploadProductImage(req.file);

  return sendCreated(res, {
    url: result.url,
  }, 'Image hosted safely to the cloud!');
});

module.exports = router;
