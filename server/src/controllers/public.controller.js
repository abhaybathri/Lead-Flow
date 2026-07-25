const leadService = require('../services/lead.service');
const { success, error } = require('../utils/response');

const submitLead = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body, null);
    return success(res, 'Your enquiry has been submitted successfully. We will get back to you soon!', { lead }, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitLead };
