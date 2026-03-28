/**
 * Domain controller - CRUD for domains.
 */

const Domain = require('../models/Domain');
const Customer = require('../models/Customer');
const Project = require('../models/Project');

const listDomains = async (req, res) => {
  try {
    const domains = await Domain.find({}).lean();
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDomain = async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id).lean();
    if (!domain) return res.status(404).json({ error: 'Domain not found' });
    res.json(domain);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const createDomain = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const domain = await Domain.create({ name });
    res.status(201).json(domain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDomain = async (req, res) => {
  try {
    const domain = await Domain.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!domain) return res.status(404).json({ error: 'Domain not found' });
    res.json(domain);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteDomain = async (req, res) => {
  try {
    const domainId = req.params.id;
    const domain = await Domain.findById(domainId).lean();
    if (!domain) return res.status(404).json({ error: 'Domain not found' });

    const [customerCount, projectCount] = await Promise.all([
      Customer.countDocuments({ domainId }),
      Project.countDocuments({ domainId }),
    ]);

    if (customerCount > 0 || projectCount > 0) {
      return res.status(409).json({
        error:
          'Cannot delete domain because it is linked to existing customers or projects',
        linkedCustomers: customerCount,
        linkedProjects: projectCount,
      });
    }

    await Domain.findByIdAndDelete(domainId);
    res.json({ message: 'Domain deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listDomains,
  getDomain,
  createDomain,
  updateDomain,
  deleteDomain,
};
