const express = require("express");
const {
  listCommunications,
  getCommunication,
  uploadEmail,
  uploadTranscript,
  updateCommunication,
  deleteCommunication,
  analyzeExistingCommunication,
} = require("../controllers/communicationController");
const { authenticateToken } = require("../middlewares/authenticate");
const { managerOnly } = require("../middlewares/authorization");

const router = express.Router();

router.use(authenticateToken);
router.get("/", listCommunications);
router.get("/:id", getCommunication);
router.post("/email", managerOnly, uploadEmail);
router.post("/transcript", managerOnly, uploadTranscript);
router.post("/:id/analyze", managerOnly, analyzeExistingCommunication);
router.put("/:id", managerOnly, updateCommunication);
router.delete("/:id", managerOnly, deleteCommunication);

module.exports = router;
