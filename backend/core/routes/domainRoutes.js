const express = require('express');
const {
  listDomains,
  getDomain,
  createDomain,
  updateDomain,
  deleteDomain,
} = require('../controllers/domainController');
const { authenticateToken } = require('../middlewares/authenticate');
const { managerOnly } = require('../middlewares/authorization');

const router = express.Router();

router.get('/', listDomains);
router.get('/:id', getDomain);
router.use(authenticateToken);
router.post('/', managerOnly, createDomain);
router.put('/:id', managerOnly, updateDomain);
router.delete('/:id', managerOnly, deleteDomain);

module.exports = router;
