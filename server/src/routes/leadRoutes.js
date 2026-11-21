const express = require("express");
const validate = require("../middleware/validate");
const requireAuth = require("../middleware/auth");
const {
  createLeadSchema,
  updateLeadSchema,
  listQuerySchema,
} = require("../validators/lead");
const {
  options,
  list,
  exportLeads,
  create,
  update,
  remove,
  stats,
} = require("../controllers/leadController");

const router = express.Router();

// Every lead route requires a logged-in user.
router.use(requireAuth);

// "/options" and "/stats" are declared before "/:id" so Express does not
// mistake the words "options" or "stats" for a lead id.
router.get("/options", options);
router.get("/stats", stats);
router.get("/export", validate(listQuerySchema, "query"), exportLeads);

router.get("/", validate(listQuerySchema, "query"), list);
router.post("/", validate(createLeadSchema), create);
router.patch("/:id", validate(updateLeadSchema), update);
router.delete("/:id", remove);

module.exports = router;
