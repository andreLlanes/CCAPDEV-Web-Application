const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { ensureGuest } = require("../middleware/auth");


router.get("/register", ensureGuest, authController.getRegisterForm);
router.post("/register", authController.registerUser);
router.get("/login", ensureGuest, authController.getLoginForm);
router.post("/login", authController.loginUser);
router.get("/logout", authController.logoutUser);

router.get("/clear-cookie", (req, res) => {
    res.clearCookie("token");
    res.send("✅ Cookie cleared. You can now go to /register or refresh /.");
  });
module.exports = router;