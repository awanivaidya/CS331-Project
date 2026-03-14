const express = require("express");
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { authenticateToken } = require("../middlewares/authenticate");
const { managerOnly } = require("../middlewares/authorization");

const router = express.Router();

router.use(authenticateToken);
router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", managerOnly, createProject);
router.put("/:id", managerOnly, updateProject);
router.delete("/:id", managerOnly, deleteProject);

module.exports = router;
