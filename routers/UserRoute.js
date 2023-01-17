const express = require("express");
const router = new express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getUserInfo,
  loginUserWithGoogleAuth,
} = require("../controllers/UserController");
const auth = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", auth, logoutUser);
router.get("/user", auth, getUserInfo);
router.post("/login/google/auth", loginUserWithGoogleAuth);

module.exports = router;
