const User = require("../models/User");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/CustomError");
const cookieToken = require("../utils/cookieToken");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError("Name, email, and password are required", 400));
  }

  const isUserAlreadyExist = await User.findOne({ email: email });

  if (isUserAlreadyExist) {
    return next(new CustomError("Email already exist", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  cookieToken(res, user);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user provided email and password or not
  if (!email || !password) {
    return next(new CustomError("Please provide email and password", 400));
  }

  // getting user for given email id
  const user = await User.findOne({ email }).select("+password");

  // cheking if user exist in our database or not
  if (!user) {
    return next(new CustomError("Invalid Email/Password", 400));
  }

  // checking if password is valid or not
  const isValidUser = await user.isValidatedPassword(password);

  if (!isValidUser) {
    return next(new CustomError("Invalid Email/Password", 400));
  }
  // If everything is okay then good to go sending response to user
  cookieToken(res, user);
});

exports.logout = BigPromise((req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout Success",
  });
});
