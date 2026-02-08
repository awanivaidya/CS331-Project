const express = require('express');
const {
  listSlas,
  getSla,
  createSla,
  updateSla,
  deleteSla,
} = require('../controllers/slaController');

const router = express.Router();

router.get('/', listSlas);
router.get('/:id', getSla);
router.post('/', createSla);
router.put('/:id', updateSla);
router.delete('/:id', deleteSla);

module.exports = router;
