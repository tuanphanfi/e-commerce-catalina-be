const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String, require: false },
    password: { type: String, required: true, select: false },
    emailVerificationCode: { type: String, select: false },
    emailVerified: { type: Boolean, require: true, default: false },
    isDeleted: { type: Boolean, default: false, select: false },
    cart: [
      Schema({
        quantity: { type: Number, default: 1 },
        item: { type: Schema.Types.ObjectId, ref: "Item" },
      }),
    ],
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
  },
  { timestamps: true }
);

userSchema.plugin(require("./plugins/isDeletedFalse"));

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
