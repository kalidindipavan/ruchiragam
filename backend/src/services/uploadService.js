/**
 * @file uploadService.js
 * @description Cloud Storage Upload Logic for Supabase
 */

const { supabase } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const path = require('path');

const BUCKET_NAME = 'products';

// Ensure bucket exists on first load
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && !buckets.find((b) => b.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      logger.info(`Supabase Storage Bucket '${BUCKET_NAME}' created automatically.`);
    }
  } catch (err) {
    logger.warn('Could not auto-create Supabase storage bucket:', err.message);
  }
})();

/**
 * Upload an image buffer to Supabase Storage
 * @param {Object} file - The parsed multer file object
 */
const uploadProductImage = async (file) => {
  if (!file) throw new AppError('No file provided for upload', 400);

  // Generate unique filename via UUID
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${uuidv4()}${ext}`;

  // Stream raw memory buffer to Supabase cloud bucket
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    logger.error('Supabase upload error:', error);
    throw new AppError('Failed to upload image to cloud storage', 500);
  }

  // Get resulting Public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  return {
    url: publicUrlData.publicUrl,
    filename,
    bucket: BUCKET_NAME
  };
};

module.exports = {
  uploadProductImage
};
