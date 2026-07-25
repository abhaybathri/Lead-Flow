const Note = require('../models/Note');
const Lead = require('../models/Lead');
const { createActivity } = require('./activity.service');

const canAccessLead = async (leadId, user) => {
  if (user.role === 'admin') return true;
  const lead = await Lead.findById(leadId).select('assignedTo');
  if (!lead) return false;
  return lead.assignedTo && lead.assignedTo.toString() === user._id.toString();
};

const getNotes = async (leadId, user) => {
  const allowed = await canAccessLead(leadId, user);
  if (!allowed) return 'forbidden';
  return Note.find({ lead: leadId })
    .populate('author', 'name email')
    .sort({ createdAt: -1 });
};

const createNote = async (leadId, content, user) => {
  const allowed = await canAccessLead(leadId, user);
  if (!allowed) return 'forbidden';

  const note = await Note.create({ lead: leadId, author: user._id, content });
  await createActivity(leadId, user._id, 'note_added', { noteId: note._id });

  return Note.findById(note._id).populate('author', 'name email');
};

module.exports = { getNotes, createNote };
