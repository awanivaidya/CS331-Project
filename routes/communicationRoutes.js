const express = require('express');
const {
  listCommunications,
  getCommunication,
  uploadEmail,
  uploadTranscript,
  updateCommunication,
  deleteCommunication,
} = require('../controllers/communicationController');

const router = express.Router();

// List communications (optional query: type, projectId, domainId, customerId)
router.get('/', listCommunications);
router.get('/:id', getCommunication);

// Upload endpoints - must be before /:id to avoid "email" and "transcript" being parsed as IDs
router.post('/email', uploadEmail);
router.post('/transcript', uploadTranscript);

router.put('/:id', updateCommunication);
router.delete('/:id', deleteCommunication);

module.exports = router;
