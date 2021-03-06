const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }, "+password");

  if (!user)
    return next(new AppError(400, "Invalid credentials", "Login Error"));

  // if (!user.emailVerified) {
  //   return next(new AppError(406, "Please verify your email", "Login Error"));
  // }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AppError(400, "Wrong password", "Login Error"));

  accessToken = await user.generateToken();
  if (user.cart && user.cart.length > 0) {
    User.populate(user, { path: "cart.item" });
  }
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login successful"
  );
});

authController.loginWithFacebookOrGoogle = catchAsync(
  async (req, res, next) => {
    let profile = req.user;
    profile.email = profile.email.toLowerCase();
    let user = await User.findOne({ email: profile.email });
    const randomPassword = "" + Math.floor(Math.random() * 10000000);

    if (user) {
      user = await User.findByIdAndUpdate(
        user._id,
        { avatarUrl: profile.avatarUrl },
        { new: true }
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      const newUser = await User.create({
        name: profile.name,
        email: profile.email,
        password: newPassword,
        avatarUrl: profile.avatarUrl,
        cart: [],
      });
      user = await newUser.save();
    }

    const accessToken = await user.generateToken();
    if (user.cart && user.cart.length > 0) {
      User.populate(user, { path: "cart.item" });
    }
    return sendResponse(
      res,
      200,
      true,
      { user, accessToken },
      null,
      "Login successful"
    );
  }
);

module.exports = authController;
