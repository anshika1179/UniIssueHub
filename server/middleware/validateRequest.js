import mongoose from 'mongoose';

export const validateObjectId = (req, res, next, value) => {
  if (!mongoose.isObjectIdOrHexString(value)) {
    return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
  }
  next();
};

export const validateTechnicianId = (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.body.technicianId)) {
    return res.status(400).json({ success: false, message: 'A valid technician ID is required.' });
  }
  next();
};

export const validatePagination = (req, res, next) => {
  for (const key of ['page', 'limit']) {
    const value = req.query[key];
    if (value !== undefined && (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1)) {
      return res.status(400).json({ success: false, message: `${key} must be a positive integer.` });
    }
  }
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 10), 100);
  if (!Number.isSafeInteger((page - 1) * limit)) {
    return res.status(400).json({ success: false, message: 'Pagination range is too large.' });
  }
  next();
};
