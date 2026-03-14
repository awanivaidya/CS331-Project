/**
 * Project controller - CRUD for projects linked to customers.
 */

const Project = require("../models/Project");
const Customer = require("../models/Customer");
const SLA = require("../models/SLA");

const isStaff = (req) => (req.user?.type || req.user?.role) === "Staff";

const staffDomainFilter = (req) => {
  if (!isStaff(req)) return null;
  const domains = req.user?.assignedDomains || [];
  return domains.map((id) => id.toString());
};

const listProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.domainId) filter.domainId = req.query.domainId;

    const allowedDomains = staffDomainFilter(req);
    if (allowedDomains) {
      filter.domainId = { $in: allowedDomains };
    }

    const projects = await Project.find(filter)
      .populate("customerId", "name")
      .populate("domainId", "name")
      .lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("customerId", "name")
      .populate("domainId", "name")
      .lean();
    if (!project) return res.status(404).json({ error: "Project not found" });

    const allowedDomains = staffDomainFilter(req);
    if (
      allowedDomains &&
      !allowedDomains.includes(
        project.domainId?._id?.toString?.() || project.domainId?.toString(),
      )
    ) {
      return res
        .status(403)
        .json({ error: "Access denied for this project domain" });
    }

    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, status, customerId, domainId, sla } = req.body;
    if (!name || !customerId)
      return res
        .status(400)
        .json({ error: "name and customerId are required" });

    const hasSla =
      sla &&
      sla.responseTime != null &&
      sla.deadline != null &&
      sla.riskThreshold != null;

    if (!hasSla) {
      return res.status(400).json({
        error:
          "SLA is required while creating a project (responseTime, deadline, riskThreshold).",
      });
    }

    let resolvedDomainId = domainId;
    if (!resolvedDomainId) {
      const customer = await Customer.findById(customerId)
        .select("domainId")
        .lean();
      if (!customer)
        return res.status(404).json({ error: "Customer not found" });
      resolvedDomainId = customer.domainId;
    }

    if (!resolvedDomainId) {
      return res
        .status(400)
        .json({ error: "domainId is required (directly or via customer)" });
    }

    const customerSla = await SLA.findOneAndUpdate(
      { customerId },
      {
        customerId,
        responseTime: Number(sla.responseTime),
        deadline: sla.deadline,
        riskThreshold: Number(sla.riskThreshold),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    const initialTasks = customerSla
      ? [
          `Respond to customer communications within ${customerSla.responseTime} hours.`,
          `Maintain SLA commitments until deadline: ${customerSla.deadline}.`,
          `Keep customer sentiment above risk threshold: ${customerSla.riskThreshold}.`,
        ]
      : [
          "Review customer requirements and confirm delivery milestones.",
          "Monitor communication updates and track action items.",
        ];

    const project = await Project.create({
      name,
      status: status || "active",
      customerId,
      domainId: resolvedDomainId,
      tasks: initialTasks,
    });
    const populated = await Project.findById(project._id)
      .populate("customerId", "name")
      .populate("domainId", "name")
      .lean();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("customerId", "name")
      .populate("domainId", "name")
      .lean();
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted" });
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
