/**
 * Customer controller - create and list customers (Manager use).
 */

const Customer = require('../models/Customer');

// List all customers
const listCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one customer by ID
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create customer
const createCustomer = async (req, res) => {
  try {
    const { name, priority, sentimentScore, riskStatus } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const customer = await Customer.create({
      name,
      priority: priority || 'normal',
      sentimentScore: sentimentScore ?? null,
      riskStatus: riskStatus ?? null,
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
