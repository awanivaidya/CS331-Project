/**
 * Communication controller - upload email/transcript; list by project, domain, type.
 */

const Communication = require('../models/Communication');

const listCommunications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.projectId) filter.projectId = req.query.projectId;
    if (req.query.domainId) filter.domainId = req.query.domainId;
    if (req.query.customerId) filter.customerId = req.query.customerId;
    const communications = await Communication.find(filter)
      .populate('projectId', 'name')
      .populate('domainId', 'name')
      .populate('customerId', 'name')
      .lean();
    res.json(communications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCommunication = async (req, res) => {
  try {
    const comm = await Communication.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('domainId', 'name')
      .populate('customerId', 'name')
      .lean();
    if (!comm) return res.status(404).json({ error: 'Communication not found' });
    res.json(comm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const uploadEmail = async (req, res) => {
  try {
    const { content, subject, sender, projectId, domainId, customerId, timestamp } = req.body;
    const required = ['content', 'subject', 'sender', 'projectId', 'domainId', 'customerId'];
    for (const field of required) {
      if (req.body[field] == null || req.body[field] === '')
        return res.status(400).json({ error: `${field} is required` });
    }
    const doc = await Communication.create({
      type: 'email',
      content,
      subject,
      sender,
      projectId,
      domainId,
      customerId,
      timestamp: timestamp ? new Date(timestamp) : undefined,
      sentiment: null,
      summary: null,
    });
    const populated = await Communication.findById(doc._id)
      .populate('projectId', 'name')
      .populate('domainId', 'name')
      .populate('customerId', 'name')
      .lean();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadTranscript = async (req, res) => {
  try {
    const { content, meetingDate, participants, projectId, domainId, customerId, timestamp } = req.body;
    const required = ['content', 'meetingDate', 'participants', 'projectId', 'domainId', 'customerId'];
    for (const field of required) {
      if (req.body[field] == null)
        return res.status(400).json({ error: `${field} is required` });
    }
    const participantsArr = Array.isArray(participants) ? participants : [participants];
    const doc = await Communication.create({
      type: 'transcript',
      content,
      meetingDate,
      participants: participantsArr,
      projectId,
      domainId,
      customerId,
      timestamp: timestamp ? new Date(timestamp) : undefined,
      sentiment: null,
      summary: null,
    });
    const populated = await Communication.findById(doc._id)
      .populate('projectId', 'name')
      .populate('domainId', 'name')
      .populate('customerId', 'name')
      .lean();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCommunication = async (req, res) => {
  try {
    const comm = await Communication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name')
      .populate('domainId', 'name')
      .populate('customerId', 'name')
      .lean();
    if (!comm) return res.status(404).json({ error: 'Communication not found' });
    res.json(comm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteCommunication = async (req, res) => {
  try {
    const comm = await Communication.findByIdAndDelete(req.params.id);
    if (!comm) return res.status(404).json({ error: 'Communication not found' });
    res.json({ message: 'Communication deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listCommunications,
  getCommunication,
  uploadEmail,
  uploadTranscript,
  updateCommunication,
  deleteCommunication,
};
