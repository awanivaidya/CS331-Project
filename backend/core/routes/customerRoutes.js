const express = require('express');
const {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { authenticateToken } = require('../middlewares/authenticate');
const { managerOnly } = require('../middlewares/authorization');

const router = express.Router();

router.use(authenticateToken);
router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.post('/', managerOnly, createCustomer);
router.put('/:id', managerOnly, updateCustomer);
router.delete('/:id', managerOnly, deleteCustomer);

module.exports = router;
