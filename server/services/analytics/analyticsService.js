import Complaint from '../../models/Complaint.js';
import Assignment from '../../models/Assignment.js';
import mongoose from 'mongoose';

export const getOverviewAnalytics = async (query = {}) => {
  const [totals] = await Complaint.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalComplaints: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
      }
    }
  ]);

  return totals || {
    totalComplaints: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  };
};

export const getCategoryAnalytics = async (query = {}) => {
  return await Complaint.aggregate([
    { $match: query },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { category: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);
};

export const getPriorityAnalytics = async (query = {}) => {
  return await Complaint.aggregate([
    { $match: query },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $project: { priority: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);
};

export const getStatusAnalytics = async (query = {}) => {
  return await Complaint.aggregate([
    { $match: query },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);
};

export const getTrendsAnalytics = async (query = {}) => {
  return await Complaint.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $project: { date: '$_id', count: 1, _id: 0 } },
    { $sort: { date: 1 } }
  ]);
};

export const getResolutionTimeAnalytics = async (query = {}) => {
  const matchQuery = { ...query, status: { $in: ['resolved', 'closed'] }, resolvedAt: { $exists: true } };

  const [stats] = await Complaint.aggregate([
    { $match: matchQuery },
    {
      $project: {
        hoursToResolve: {
          $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000] // ms to hours
        }
      }
    },
    {
      $group: {
        _id: null,
        averageHours: { $avg: '$hoursToResolve' },
        resolvedCount: { $sum: 1 }
      }
    }
  ]);

  return {
    averageHours: stats?.averageHours ? parseFloat(stats.averageHours.toFixed(1)) : 0,
    resolvedCount: stats?.resolvedCount || 0
  };
};

export const getTechnicianWorkload = async (techQuery = {}) => {
  return await Assignment.aggregate([
    { $match: techQuery },
    {
      $group: {
        _id: '$technicianId',
        assigned: { $sum: { $cond: [{ $in: ['$status', ['assigned', 'accepted']] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'technician'
      }
    },
    { $unwind: '$technician' },
    {
      $project: {
        technicianId: '$_id',
        name: '$technician.name',
        assigned: 1,
        inProgress: 1,
        resolved: 1,
        _id: 0
      }
    },
    { $sort: { inProgress: -1, assigned: -1 } }
  ]);
};
