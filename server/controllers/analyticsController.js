import * as analyticsService from '../services/analytics/analyticsService.js';

const buildDateFilter = (req) => {
  const { from, to } = req.query;
  const filter = {};
  
  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate)) filter.createdAt.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate)) {
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }
    
    // Safety max range limits (1 year)
    if (filter.createdAt.$gte && filter.createdAt.$lte) {
      const diff = filter.createdAt.$lte - filter.createdAt.$gte;
      if (diff > 365 * 24 * 60 * 60 * 1000) {
        throw new Error('Date range cannot exceed 1 year.');
      }
    } else if (from && !to) {
        filter.createdAt.$lte = new Date();
    }
  } else {
    // Default to last 30 days if no explicit filter for trends, but for overview we might want all.
    // We will apply default filtering based on the route or leave as-is for global overview.
  }
  
  return filter;
};

export const getOverview = async (req, res) => {
  try {
    const query = buildDateFilter(req);
    const data = await analyticsService.getOverviewAnalytics(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const query = buildDateFilter(req);
    const data = await analyticsService.getCategoryAnalytics(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPriorities = async (req, res) => {
  try {
    const query = buildDateFilter(req);
    const data = await analyticsService.getPriorityAnalytics(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getStatusStats = async (req, res) => {
  try {
    const query = buildDateFilter(req);
    const data = await analyticsService.getStatusAnalytics(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = Math.min(Math.max(parseInt(days), 7), 365);
    
    let query = buildDateFilter(req);
    // If no explicit from/to, default to `days` 
    if (!req.query.from && !req.query.to) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysNum);
      query.createdAt = { $gte: fromDate, $lte: new Date() };
    }
    
    const data = await analyticsService.getTrendsAnalytics(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getResolutionTime = async (req, res) => {
  try {
    const query = buildDateFilter(req);
    const data = await analyticsService.getResolutionTimeAnalytics(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTechnicians = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'technician') {
      // Technicians only see their own workload
      query.technicianId = req.user._id;
    }
    
    const data = await analyticsService.getTechnicianWorkload(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
