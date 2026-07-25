const Lead = require('../models/Lead');
const User = require('../models/User');
const { createActivity } = require('./activity.service');

const buildLeadQuery = (filters, user) => {
  const query = {};

  // Members only see their assigned leads
  if (user.role === 'member') {
    query.assignedTo = user._id;
  }

  if (filters.status) query.status = filters.status;

  if (user.role === 'admin' && filters.assignedTo) {
    if (filters.assignedTo === 'unassigned') {
      query.assignedTo = null;
    } else {
      query.assignedTo = filters.assignedTo;
    }
  }

  if (filters.search) {
    const re = new RegExp(filters.search, 'i');
    query.$or = [{ name: re }, { email: re }, { company: re }, { requirement: re }];
  }

  return query;
};

const getLeads = async (filters, user) => {
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const sortField = filters.sort || 'createdAt';
  const sortOrder = filters.order === 'asc' ? 1 : -1;

  const query = buildLeadQuery(filters, user);

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(query),
  ]);

  return {
    leads,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getLeadById = async (leadId, user) => {
  const lead = await Lead.findById(leadId)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email');

  if (!lead) return null;

  // Members can only view leads assigned to them
  if (user.role === 'member') {
    const assignedId = lead.assignedTo ? lead.assignedTo._id.toString() : null;
    if (assignedId !== user._id.toString()) return 'forbidden';
  }

  return lead;
};

const createLead = async (data, actorId) => {
  const lead = await Lead.create({ ...data, createdBy: actorId || null });
  await createActivity(lead._id, actorId, 'lead_created', { name: lead.name, email: lead.email });
  return lead;
};

const updateLead = async (leadId, updates, user) => {
  const lead = await Lead.findById(leadId);
  if (!lead) return null;

  // Members can only update their assigned leads
  if (user.role === 'member') {
    const assignedId = lead.assignedTo ? lead.assignedTo.toString() : null;
    if (assignedId !== user._id.toString()) return 'forbidden';

    // Members cannot reassign leads
    delete updates.assignedTo;
  }

  const oldStatus = lead.status;
  const oldAssignedTo = lead.assignedTo ? lead.assignedTo.toString() : null;

  Object.assign(lead, updates);
  await lead.save();

  // Track status change
  if (updates.status && updates.status !== oldStatus) {
    await createActivity(lead._id, user._id, 'status_changed', {
      from: oldStatus,
      to: updates.status,
    });
  }

  // Track assignment change (admin only)
  if (user.role === 'admin' && updates.assignedTo !== undefined) {
    const newAssignedTo = updates.assignedTo ? updates.assignedTo.toString() : null;
    if (newAssignedTo !== oldAssignedTo) {
      // Fetch names for readable activity messages
      const [prevUser, newUser] = await Promise.all([
        oldAssignedTo ? User.findById(oldAssignedTo).select('name') : Promise.resolve(null),
        newAssignedTo ? User.findById(newAssignedTo).select('name') : Promise.resolve(null),
      ]);
      await createActivity(lead._id, user._id, 'lead_assigned', {
        previousAssignee: oldAssignedTo,
        previousAssigneeName: prevUser?.name || null,
        newAssignee: newAssignedTo,
        newAssigneeName: newUser?.name || null,
      });
    }
  }

  return Lead.findById(leadId)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email');
};

const deleteLead = async (leadId) => {
  const lead = await Lead.findByIdAndDelete(leadId);
  return lead;
};

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead };
