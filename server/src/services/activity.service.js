const Activity = require('../models/Activity');

const createActivity = async (leadId, actorId, action, metadata = {}) => {
  return Activity.create({
    lead: leadId,
    actor: actorId || null,
    action,
    metadata,
  });
};

const getLeadActivity = async (leadId) => {
  return Activity.find({ lead: leadId })
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 });
};

module.exports = { createActivity, getLeadActivity };
