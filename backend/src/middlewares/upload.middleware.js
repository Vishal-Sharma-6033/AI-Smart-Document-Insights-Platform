import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const isPdf =
    file.mimetype === 'application/pdf' && /\.pdf$/i.test(file.originalname);
  if (!isPdf) return cb(ApiError.badRequest('Only PDF files are allowed'));
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxFileSizeBytes, files: 1 },
});

export const uploadPdf = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          ApiError.badRequest(
            `File too large. Max ${Math.round(env.upload.maxFileSizeBytes / 1024 / 1024)}MB`
          )
        );
      }
      return next(err instanceof ApiError ? err : ApiError.badRequest(err.message));
    }
    if (!req.file) return next(ApiError.badRequest('No file uploaded (field "file")'));
    next();
  });
};

export default uploadPdf;
