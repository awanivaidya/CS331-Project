/**
 * SLA controller - CRUD for SLAs linked to customers.
 */

const SLA = require('../models/SLA');

const listSlas = async (req, res) => {
  try {
    const filter = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;
    const slas = await SLA.find(filter).populate('customerId', 'name').lean();
    res.json(slas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSla = async (req, res) => {
  try {
    const sla = await SLA.findById(req.params.id).populate('customerId', 'name').lean();
    if (!sla) return res.status(404).json({ error: 'SLA not found' });
    res.json(sla);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const createSla = async (req, res) => {
  try {
    const { responseTime, deadline, riskThreshold, customerId } = req.body;
    if ([responseTime, deadline, riskThreshold, customerId].some((v) => v == null))
      return res.status(400).json({ error: 'responseTime, deadline, riskThreshold, customerId are required' });
    const sla = await SLA.create({ responseTime, deadline, riskThreshold, customerId });
    const populated = await SLA.findById(sla._id).populate('customerId', 'name').lean();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSla = async (req, res) => {
  try {
    const sla = await SLA.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customerId', 'name')
      .lean();
    if (!sla) return res.status(404).json({ error: 'SLA not found' });
    res.json(sla);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteSla = async (req, res) => {
  try {
    const sla = await SLA.findByIdAndDelete(req.params.id);
    if (!sla) return res.status(404).json({ error: 'SLA not found' });
    res.json({ message: 'SLA deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listSlas,
  getSla,
  createSla,
  updateSla,
  deleteSla,
};
