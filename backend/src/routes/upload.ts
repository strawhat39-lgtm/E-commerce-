import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure images directory exists
const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Extract extension safely
    const ext = path.extname(file.originalname) || '';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/upload
// @desc    Upload an image or video to the backend
// @access  Public
router.post('/', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Construct the public URL 
    // Usually via the server's host variable or manually via pathing
    // For localhost usage based on the env: HTTP
    const hostUrl = req.protocol + '://' + req.get('host');
    const publicUrl = `${hostUrl}/images/${req.file.filename}`;

    res.status(201).json({
      message: 'File uploaded successfully',
      url: publicUrl
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

export default router;
