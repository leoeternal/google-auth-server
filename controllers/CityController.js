const City = require("../models/CityModel");

const addCity = async (req, res) => {
  const data = {
    cityName: req.body.city,
    user: req.user._id,
  };
  try {
    if (req.body.city === "") {
      return res.status(400).send({
        status: "failed",
        message: "please select a city first",
      });
    }
    const cityDetails = new City(data);
    const citySaved = await cityDetails.save();
    res.status(201).send({
      status: "success",
      message: "city added successfully",
      data: cityDetails.cityName,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "cannot add city. please try again later",
    });
  }
};

module.exports = { addCity };
