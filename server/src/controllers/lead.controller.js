const leadService = require('../services/lead.service');
const noteService = require('../services/note.service');
const { getLeadActivity } = require('../services/activity.service');
const { success, error } = require('../utils/response');

const getLeads = async (req, res, next) => {
  try {
    const result = await leadService.getLeads(req.query, req.user);
    return success(res, 'Leads fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

const getLead = async (req, res, next) => {
  try {
    const result = await leadService.getLeadById(req.params.leadId, req.user);
    if (!result) return error(res, 'Lead not found', 404);
    if (result === 'forbidden') return error(res, 'You are not allowed to access this lead', 403);
    return success(res, 'Lead fetched successfully', { lead: result });
  } catch (err) {
    next(err);
  }
};

const createLead = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body, req.user._id);
    return success(res, 'Lead created successfully', { lead }, 201);
  } catch (err) {
    next(err);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const result = await leadService.updateLead(req.params.leadId, req.body, req.user);
    if (!result) return error(res, 'Lead not found', 404);
    if (result === 'forbidden') return error(res, 'You are not allowed to update this lead', 403);
    return success(res, 'Lead updated successfully', { lead: result });
  } catch (err) {
    next(err);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const lead = await leadService.deleteLead(req.params.leadId);
    if (!lead) return error(res, 'Lead not found', 404);
    return success(res, 'Lead deleted successfully', null, 204);
  } catch (err) {
    next(err);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const result = await noteService.getNotes(req.params.leadId, req.user);
    if (result === 'forbidden') return error(res, 'You are not allowed to access this lead', 403);
    return success(res, 'Notes fetched successfully', { notes: result });
  } catch (err) {
    next(err);
  }
};

const createNote = async (req, res, next) => {
  try {
    const result = await noteService.createNote(req.params.leadId, req.body.content, req.user);
    if (result === 'forbidden') return error(res, 'You are not allowed to add notes to this lead', 403);
    return success(res, 'Note created successfully', { note: result }, 201);
  } catch (err) {
    next(err);
  }
};

const getActivity = async (req, res, next) => {
  try {
    // Members: verify they can access this lead first
    if (req.user.role === 'member') {
      const lead = await require('../models/Lead').findById(req.params.leadId).select('assignedTo');
      if (!lead) return error(res, 'Lead not found', 404);
      const assignedId = lead.assignedTo ? lead.assignedTo.toString() : null;
      if (assignedId !== req.user._id.toString()) {
        return error(res, 'You are not allowed to access this lead', 403);
      }
    }
    const activities = await getLeadActivity(req.params.leadId);
    return success(res, 'Activity fetched successfully', { activities });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead, getNotes, createNote, getActivity };
