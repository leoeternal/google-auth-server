const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const City = require("../models/CityModel");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const errors = [];
  try {
    const user = await User.findOne({ email });
    if (name === "") {
      errors.push({ field: "name", message: "This field cannot be empty" });
    }
    if (email === "") {
      errors.push({ field: "email", message: "This field cannot be empty" });
    }
    if (password === "") {
      errors.push({ field: "password", message: "This field cannot be empty" });
    }
    if (user !== null) {
      errors.push({
        field: "email",
        message: "user with this email id already exist",
      });
    }
    if (errors.length !== 0) {
      return res.status(400).send({
        status: "failed",
        data: errors,
      });
    }
    const userDetails = new User(req.body);
    const userSaved = await userDetails.save();
    res.status(201).send({
      status: "success",
      message: "user registered successfully",
      data: userDetails,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "User cannot be registered. Please try again",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const errors = [];
  try {
    if (email === "") {
      errors.push({ field: "email", message: "This field cannot be empty" });
    }
    if (password === "") {
      errors.push({ field: "password", message: "This field cannot be empty" });
    }
    if (errors.length !== 0) {
      return res.status(400).send({
        status: "failed",
        data: errors,
      });
    }
    const user = await User.findOne({ email });
    if (user === null) {
      return res.status(404).send({
        status: "failed",
        message: "no user found with this email address",
      });
    }
    if (user !== null && user.password === undefined) {
      return res.status(400).send({
        status: "failed",
        message: "you are registered via google auth",
        data: [],
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors.push({ field: "password", message: "Password Incorrect" });
    }
    if (errors.length !== 0) {
      return res.status(400).send({
        status: "failed",
        data: errors,
      });
    }
    const token = await user.generateToken();
    await user.save();
    res.status(200).send({
      status: "success",
      message: "user logged in successfully",
      data: { user, token },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "User cannot be logged in. Please try again",
    });
  }
};

const logoutUser = async (req, res) => {
  const { user, token } = req;
  try {
    user.tokens = user.tokens.filter((currToken) => {
      return currToken.token.toString() !== token.toString();
    });
    await user.save();
    res.status(204).send({
      status: "success",
      message: "user logged out successfully",
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "User cannot be logged out. Please try again",
    });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const cities = await City.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$user", cities: { $push: "$cityName" } } },
    ]);
    if (cities.length === 0) {
      return res.status(200).send({
        status: "success",
        message: "user info fetched successfully",
        data: [{ _id: req.user, cities: [] }],
      });
    }
    await User.populate(cities, { path: "_id" });
    res.status(200).send({
      status: "success",
      message: "user info fetched successfully",
      data: cities,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "User info cannot be fetched. Please try again",
    });
  }
};

const loginUserWithGoogleAuth = async (req, res) => {
  try {
    const token = req.body.tokenId;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const data = ticket.getPayload();
    const findUser = await User.findOne({ email: data.email });
    if (findUser === null) {
      const userDetails = new User({ email: data.email, name: data.name });
      const userSaved = await userDetails.save();
      const userToken = await userDetails.generateToken();
      await userDetails.save();
      res.status(201).send({
        status: "success",
        message: "google auth successful",
        data: { user: userDetails, token: userToken },
      });
    } else {
      const userToken = await findUser.generateToken();
      await findUser.save();
      res.status(200).send({
        status: "success",
        message: "google auth successful",
        data: { user: findUser, token: userToken },
      });
    }
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Google auth error. Please try again",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserInfo,
  loginUserWithGoogleAuth,
};
