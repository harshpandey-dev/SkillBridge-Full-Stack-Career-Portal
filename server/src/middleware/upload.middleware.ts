import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { BadRequestError } from '../lib/errors';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const memoryStorage = multer.memoryStorage();

// Resume upload filter (PDF only)
const resumeFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ['application/pdf'];
  const isPdfExtension = file.originalname.toLowerCase().endsWith('.pdf');

  if (allowedMimeTypes.includes(file.mimetype) || isPdfExtension) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only PDF files are allowed for resumes.'));
  }
};

// Image upload filter (JPG, JPEG, PNG, WEBP)
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const isAllowedExt = allowedExtensions.some(ext =>
    file.originalname.toLowerCase().endsWith(ext)
  );

  if (allowedMimeTypes.includes(file.mimetype) || isAllowedExt) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Only JPG, JPEG, PNG, and WEBP image formats are supported.'
      )
    );
  }
};

const resumeMulter = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: resumeFileFilter,
}).single('resume');

const profileImageMulter = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: imageFileFilter,
}).single('image');

const companyLogoMulter = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: imageFileFilter,
}).single('logo');

function wrapMulter(
  uploadHandler: RequestHandler,
  fieldName: string
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadHandler(req, res, err => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError('File size exceeds 5 MB limit.'));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(
              new BadRequestError(`Unexpected field. Please upload using field "${fieldName}".`)
            );
          }
          return next(new BadRequestError(`Upload error: ${err.message}`));
        }
        return next(err);
      }

      if (!req.file) {
        return next(new BadRequestError(`Please provide a file in the "${fieldName}" field.`));
      }

      next();
    });
  };
}

export const uploadResumeMiddleware = wrapMulter(resumeMulter, 'resume');
export const uploadProfileImageMiddleware = wrapMulter(profileImageMulter, 'image');
export const uploadCompanyLogoMiddleware = wrapMulter(companyLogoMulter, 'logo');
