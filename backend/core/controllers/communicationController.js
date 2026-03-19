/**
 * Communication controller - upload email/transcript with NLP processing.
 * Automatically analyzes content, updates project tasks, and triggers risk assessment.
 */

const Communication = require("../models/Communication");
const Project = require("../models/Project");
const Customer = require("../models/Customer");
const nlpService = require("../services/nlpService");
const {
  updateCustomerSentiment,
  generateAlertIfNeeded,
} = require("../services/riskService");

const isStaff = (req) => (req.user?.type || req.user?.role) === "Staff";

const staffDomainFilter = (req) => {
  if (!isStaff(req)) return null;
  const domains = req.user?.assignedDomains || [];
  return domains.map((id) => id.toString());
};

const toIdString = (value) =>
  value?._id?.toString?.() || value?.toString?.() || null;

const listCommunications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.projectId) filter.projectId = req.query.projectId;
    if (req.query.domainId) filter.domainId = req.query.domainId;
    if (req.query.customerId) filter.customerId = req.query.customerId;

    const allowedDomains = staffDomainFilter(req);
    if (allowedDomains) {
      filter.domainId = { $in: allowedDomains };
    }

    const communications = await Communication.find(filter)
      .populate("projectId", "name")
      .populate("domainId", "name")
      .populate("customerId", "name")
      .lean();
    res.json(communications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCommunication = async (req, res) => {
  try {
    const comm = await Communication.findById(req.params.id)
      .populate("projectId", "name")
      .populate("domainId", "name")
      .populate("customerId", "name")
      .lean();
    if (!comm)
      return res.status(404).json({ error: "Communication not found" });

    const allowedDomains = staffDomainFilter(req);
    const communicationDomainId = toIdString(comm.domainId);
    if (allowedDomains && !allowedDomains.includes(communicationDomainId)) {
      return res.status(403).json({ error: "Access denied for this domain" });
    }

    res.json(comm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const uploadEmail = async (req, res) => {
  try {
    const {
      content,
      subject,
      sender,
      projectId,
      domainId,
      customerId,
      timestamp,
    } = req.body;
    const required = [
      "content",
      "subject",
      "sender",
      "projectId",
      "domainId",
      "customerId",
    ];
    for (const field of required) {
      if (req.body[field] == null || req.body[field] === "")
        return res.status(400).json({ error: `${field} is required` });
    }

    const project = await Project.findById(projectId).lean();
    if (!project) return res.status(404).json({ error: "Project not found" });
    const projectCustomerId = toIdString(project.customerId);
    const projectDomainId = toIdString(project.domainId);
    if (!projectCustomerId || !projectDomainId) {
      return res.status(409).json({
        error: "Project is missing customer/domain linkage",
      });
    }

    if (projectCustomerId !== String(customerId)) {
      return res
        .status(400)
        .json({ error: "customerId does not match project" });
    }
    if (projectDomainId !== String(domainId)) {
      return res.status(400).json({ error: "domainId does not match project" });
    }

    const customer = await Customer.findById(customerId).lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    const customerDomainId = toIdString(customer.domainId);
    if (!customerDomainId) {
      return res
        .status(409)
        .json({ error: "Customer is missing domain linkage" });
    }

    if (customerDomainId !== String(domainId)) {
      return res
        .status(400)
        .json({ error: "domainId does not match customer" });
    }

    // Step 1: Create communication entry
    const doc = await Communication.create({
      type: "email",
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

    // Step 2: Run NLP analysis
    let nlpResult;
    let alert = null;

    try {
      console.log("Running NLP analysis on email content...");
      nlpResult = await nlpService.analyze(content);
      console.log("NLP Analysis Result:", nlpResult);

      // Update communication with NLP results
      doc.sentiment = nlpResult.sentimentScore;
      doc.summary = nlpResult.staffTasks.join("\n");
      await doc.save();

      // Step 3: Update project tasks with extracted tasks
      const project = await Project.findById(projectId);
      if (project) {
        project.tasks = nlpResult.staffTasks;
        await project.save();
        console.log(
          `Updated project ${project.name} with ${nlpResult.staffTasks.length} tasks`,
        );
      }

      // Step 4: Update customer sentiment and calculate risk
      const customer = await Customer.findById(customerId);
      if (customer) {
        updateCustomerSentiment(customer, nlpResult.sentimentScore);
        await customer.save();
        console.log(
          `Updated customer ${customer.name} sentiment: ${customer.sentimentScore.toFixed(2)}, risk: ${customer.riskStatus}`,
        );

        // Step 5: Check for risk alerts
        alert = generateAlertIfNeeded(customer, project);
      }
    } catch (nlpError) {
      console.error("NLP analysis failed:", nlpError.message);
      // Continue without NLP results
    }

    const populated = await Communication.findById(doc._id)
      .populate("projectId", "name")
      .populate("domainId", "name")
      .populate("customerId", "name")
      .lean();

    const response = {
      communication: populated,
      nlpAnalysis: nlpResult || null,
      alert: alert,
    };

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadTranscript = async (req, res) => {
  try {
    const {
      content,
      meetingDate,
      participants,
      projectId,
      domainId,
      customerId,
      timestamp,
    } = req.body;
    const required = [
      "content",
      "meetingDate",
      "participants",
      "projectId",
      "domainId",
      "customerId",
    ];
    for (const field of required) {
      if (req.body[field] == null)
        return res.status(400).json({ error: `${field} is required` });
    }
    const participantsArr = Array.isArray(participants)
      ? participants
      : [participants];

    const project = await Project.findById(projectId).lean();
    if (!project) return res.status(404).json({ error: "Project not found" });
    const projectCustomerId = toIdString(project.customerId);
    const projectDomainId = toIdString(project.domainId);
    if (!projectCustomerId || !projectDomainId) {
      return res.status(409).json({
        error: "Project is missing customer/domain linkage",
      });
    }

    if (projectCustomerId !== String(customerId)) {
      return res
        .status(400)
        .json({ error: "customerId does not match project" });
    }
    if (projectDomainId !== String(domainId)) {
      return res.status(400).json({ error: "domainId does not match project" });
    }

    const customer = await Customer.findById(customerId).lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    const customerDomainId = toIdString(customer.domainId);
    if (!customerDomainId) {
      return res
        .status(409)
        .json({ error: "Customer is missing domain linkage" });
    }

    if (customerDomainId !== String(domainId)) {
      return res
        .status(400)
        .json({ error: "domainId does not match customer" });
    }

    // Step 1: Create communication entry
    const doc = await Communication.create({
      type: "transcript",
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

    // Step 2: Run NLP analysis
    let nlpResult;
    let alert = null;

    try {
      console.log("Running NLP analysis on transcript content...");
      nlpResult = await nlpService.analyze(content);
      console.log("NLP Analysis Result:", nlpResult);

      // Update communication with NLP results
      doc.sentiment = nlpResult.sentimentScore;
      doc.summary = nlpResult.staffTasks.join("\n");
      await doc.save();

      // Step 3: Update project tasks with extracted tasks
      const project = await Project.findById(projectId);
      if (project) {
        project.tasks = nlpResult.staffTasks;
        await project.save();
        console.log(
          `Updated project ${project.name} with ${nlpResult.staffTasks.length} tasks`,
        );
      }

      // Step 4: Update customer sentiment and calculate risk
      const customer = await Customer.findById(customerId);
      if (customer) {
        updateCustomerSentiment(customer, nlpResult.sentimentScore);
        await customer.save();
        console.log(
          `Updated customer ${customer.name} sentiment: ${customer.sentimentScore.toFixed(2)}, risk: ${customer.riskStatus}`,
        );

        // Step 5: Check for risk alerts
        alert = generateAlertIfNeeded(customer, project);
      }
    } catch (nlpError) {
      console.error("NLP analysis failed:", nlpError.message);
      // Continue without NLP results
    }

    const populated = await Communication.findById(doc._id)
      .populate("projectId", "name")
      .populate("domainId", "name")
      .populate("customerId", "name")
      .lean();

    const response = {
      communication: populated,
      nlpAnalysis: nlpResult || null,
      alert: alert,
    };

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCommunication = async (req, res) => {
  try {
    const comm = await Communication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    )
      .populate("projectId", "name")
      .populate("domainId", "name")
      .populate("customerId", "name")
      .lean();
    if (!comm)
      return res.status(404).json({ error: "Communication not found" });
    res.json(comm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteCommunication = async (req, res) => {
  try {
    const comm = await Communication.findByIdAndDelete(req.params.id);
    if (!comm)
      return res.status(404).json({ error: "Communication not found" });
    res.json({ message: "Communication deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const analyzeExistingCommunication = async (req, res) => {
  try {
    const comm = await Communication.findById(req.params.id);
    if (!comm)
      return res.status(404).json({ error: "Communication not found" });

    const allowedDomains = staffDomainFilter(req);
    const communicationDomainId = toIdString(comm.domainId);
    if (!communicationDomainId) {
      return res
        .status(409)
        .json({ error: "Communication is missing domain linkage" });
    }

    if (allowedDomains && !allowedDomains.includes(communicationDomainId)) {
      return res.status(403).json({ error: "Access denied for this domain" });
    }

    // Run NLP analysis
    const nlpResult = await nlpService.analyze(comm.content);

    // Update communication
    comm.sentiment = nlpResult.sentimentScore;
    comm.summary = nlpResult.staffTasks.join("\n");
    await comm.save();

    // Update project tasks
    const project = await Project.findById(comm.projectId);
    if (project) {
      project.tasks = nlpResult.staffTasks;
      await project.save();
    }

    // Update customer sentiment
    const customer = await Customer.findById(comm.customerId);
    let alert = null;
    if (customer) {
      updateCustomerSentiment(customer, nlpResult.sentimentScore);
      await customer.save();

      // Check for alerts
      alert = generateAlertIfNeeded(customer, project);
    }

    const populated = await Communication.findById(comm._id)
      .populate("projectId", "name")
      .populate("domainId", "name")
      .populate("customerId", "name")
      .lean();

    res.json({
      communication: populated,
      nlpAnalysis: nlpResult,
      customerRisk: customer
        ? {
            sentimentScore: customer.sentimentScore,
            riskStatus: customer.riskStatus,
          }
        : null,
      alert: alert,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  listCommunications,
  getCommunication,
  uploadEmail,
  uploadTranscript,
  updateCommunication,
  deleteCommunication,
  analyzeExistingCommunication,
};
