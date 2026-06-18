// ============================================
// FILE UPLOAD MIDDLEWARE
// ============================================

const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

// ============================================
// CONFIGURE MULTER STORAGE
// ============================================

// Use memory storage for direct Cloudinary upload
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpeg, png, gif, webp)', 400), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ============================================
// UPLOAD MIDDLEWARE FUNCTIONS
// ============================================

// Single file upload
const uploadSingle = upload.single('image');

// Multiple files upload
const uploadMultiple = upload.array('images', 10); // Max 10 images

// Custom middleware to handle multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File is too large. Maximum size is 5MB', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files. Maximum is 10 files', 400));
    }
  }
  next(err);
};

// Validate uploaded image
const validateUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next(new AppError('Please upload an image', 400));
  }

  // Check file size manually
  const file = req.file || req.files?.[0];
  if (file && file.size > 5 * 1024 * 1024) {
    return next(new AppError('File size exceeds 5MB', 400));
  }

  next();
};

// ============================================
// HELPER - UPLOAD TO CLOUDINARY
// ============================================

const cloudinary = require('cloudinary').v2;

const uploadToCloudinary = async (fileBuffer, folder = 'mess-dekho') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        quality: 'auto:best'
      },
      (error, result) => {
        if (error) {
          reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to stream
    const Readable = require('stream').Readable;
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

// Middleware to upload file to Cloudinary
const uploadImageToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // Upload to Cloudinary
    const url = await uploadToCloudinary(req.file.buffer, 'mess-dekho/pg');
    req.uploadedImageUrl = url;
    next();

  } catch (error) {
    next(error);
  }
};

// Middleware to upload multiple files to Cloudinary
const uploadMultipleImagesToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Upload all files in parallel
    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, 'mess-dekho/pg')
    );

    const urls = await Promise.all(uploadPromises);
    req.uploadedImageUrls = urls;
    next();

  } catch (error) {
    next(error);
  }
};

// ============================================
// CONFIGURE CLOUDINARY
// ============================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  validateUpload,
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  uploadToCloudinary
};
