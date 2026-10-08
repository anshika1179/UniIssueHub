import multer from 'multer';
import sharp from 'sharp';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

export const imageDirectory = fileURLToPath(new URL('../uploads/complaints/', import.meta.url));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5, fieldSize: 10000, parts: 6 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(new Error('Use a JPEG, PNG or WebP image.'));
    cb(null, true);
  }
}).single('image');

export const parseComplaintImage = (req, res, next) => upload(req, res, error => {
  if (error) return res.status(400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : error.message });
  next();
});

export const storeComplaintImage = async (file) => {
  // Decode real image bytes, cap dimensions and re-encode to strip metadata and
  // embedded content. Neither the supplied filename nor MIME type is trusted.
  const image = sharp(file.buffer, { limitInputPixels: 40000000, animated: false });
  const metadata = await image.metadata();
  if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) > 1) throw new Error('Use a valid, non-animated JPEG, PNG or WebP image.');
  const buffer = await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  await mkdir(imageDirectory, { recursive: true });
  const name = `${randomUUID()}.jpg`;
  await writeFile(`${imageDirectory}${name}`, buffer, { flag: 'wx' });
  return name;
};
export const removeComplaintImage = name => unlink(`${imageDirectory}${name}`);
