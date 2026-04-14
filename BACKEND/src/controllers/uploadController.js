const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// Multer setup using memory storage (upload goes straight from memory to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max limit as requested
}).single("file");

// Helper to upload buffer to Cloudinary
const streamUploadToCloudinary = (buffer, folder, formatFilter = null) => {
  return new Promise((resolve, reject) => {
    const options = { folder };
    if (formatFilter === "pdf") {
      options.resource_type = "image";
      options.format = "pdf"; 
      // Cloudinary treats PDF as images for simple document uploads often, or 'raw'
    }

    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });

    const requireStream = require("stream");
    requireStream.Readable.from(buffer).pipe(stream);
  });
};

const uploadImage = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size exceeds 2MB limit" });
      }
      return res.status(500).json({ success: false, message: "Upload failed", error: err.message });
    }

    if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

    // Validate MIME type for images
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Only image files are allowed" });
    }

    try {
      const result = await streamUploadToCloudinary(req.file.buffer, "epandit/profiles");
      res.json({ success: true, url: result.secure_url });
    } catch (error) {
      console.error("Cloudinary Profile Upload Error:", error);
      res.status(500).json({ success: false, message: "Failed to upload to Cloudinary", error: error.message || JSON.stringify(error) });
    }
  });
};

const uploadDocument = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size exceeds 2MB limit" });
      }
      return res.status(500).json({ success: false, message: "Upload failed", error: err.message });
    }

    if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

    // Ensure it's a PDF
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ success: false, message: "Only PDF documents are accepted" });
    }

    try {
      const result = await streamUploadToCloudinary(req.file.buffer, "epandit/documents", "pdf");
      res.json({ success: true, url: result.secure_url });
    } catch (error) {
      console.error("Cloudinary Document Upload Error:", error);
      res.status(500).json({ success: false, message: "Failed to upload to Cloudinary", error: error.message || JSON.stringify(error) });
    }
  });
};

module.exports = {
  uploadImage,
  uploadDocument,
};
