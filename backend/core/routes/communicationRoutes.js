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

const router = express.Router();

router.get("/", listCommunications);
router.get("/:id", getCommunication);
router.post("/email", uploadEmail);
router.post("/transcript", uploadTranscript);
router.post("/:id/analyze", analyzeExistingCommunication);
router.put("/:id", updateCommunication);
router.delete("/:id", deleteCommunication);

module.exports = router;
