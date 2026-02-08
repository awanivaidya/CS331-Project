const express = require('express');
const {
  listDomains,
  getDomain,
  createDomain,
  updateDomain,
  deleteDomain,
} = require('../controllers/domainController');

const router = express.Router();

router.get('/', listDomains);
router.get('/:id', getDomain);
router.post('/', createDomain);
router.put('/:id', updateDomain);
router.delete('/:id', deleteDomain);

module.exports = router;
