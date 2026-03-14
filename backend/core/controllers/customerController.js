/**
 * Customer controller - create and list customers.
 */

const Customer = require("../models/Customer");

const isStaff = (req) => (req.user?.type || req.user?.role) === "Staff";

const staffDomainFilter = (req) => {
  if (!isStaff(req)) return null;
  const domains = req.user?.assignedDomains || [];
  return domains.map((id) => id.toString());
};

const listCustomers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.domainId) filter.domainId = req.query.domainId;

    const allowedDomains = staffDomainFilter(req);
    if (allowedDomains) {
      filter.domainId = { $in: allowedDomains };
    }

    const customers = await Customer.find(filter)
      .populate("domainId", "name")
      .lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("domainId", "name")
      .lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const allowedDomains = staffDomainFilter(req);
    const customerDomainId =
      customer.domainId?._id?.toString?.() || customer.domainId?.toString();
    if (allowedDomains && !allowedDomains.includes(customerDomainId)) {
      return res
        .status(403)
        .json({ error: "Access denied for this customer domain" });
    }

    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, priority, domainId } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    if (!domainId)
      return res.status(400).json({ error: "domainId is required" });

    const customer = await Customer.create({
      name,
      priority: priority || "normal",
      domainId,
      sentimentScore: 0,
      riskStatus: "stable",
      sentimentHistory: [{ score: 0, timestamp: new Date() }],
    });

    const populatedCustomer = await Customer.findById(customer._id)
      .populate("domainId", "name")
      .lean();

    res.status(201).json({
      customer: populatedCustomer,
      message: "Customer created successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted" });
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
