const express = require("express");
const router = new express.Router();

const { addCity } = require("../controllers/CityController");
const auth = require("../middleware/auth");

router.post("/city", auth, addCity);

module.exports = router;
