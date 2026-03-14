const express = require("express");
const {
  listSlas,
  getSla,
  createSla,
  updateSla,
  deleteSla,
} = require("../controllers/slaController");
const { authenticateToken } = require("../middlewares/authenticate");
const { managerOnly } = require("../middlewares/authorization");

const router = express.Router();

router.use(authenticateToken);
router.get("/", listSlas);
router.get("/:id", getSla);
router.post("/", managerOnly, createSla);
router.put("/:id", managerOnly, updateSla);
router.delete("/:id", managerOnly, deleteSla);

module.exports = router;
