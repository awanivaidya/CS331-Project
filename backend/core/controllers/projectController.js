/**
 * Project controller - CRUD for projects linked to customers.
 */

const Project = require('../models/Project');

const listProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;
    if (req.query.status) filter.status = req.query.status;
    const projects = await Project.find(filter).populate('customerId', 'name').lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('customerId', 'name').lean();
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, status, customerId } = req.body;
    if (!name || !customerId)
      return res.status(400).json({ error: 'name and customerId are required' });
    const project = await Project.create({
      name,
      status: status || 'active',
      customerId,
    });
    const populated = await Project.findById(project._id).populate('customerId', 'name').lean();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customerId', 'name')
      .lean();
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
