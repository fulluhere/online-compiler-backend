import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  score: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
  solvedProblemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  hintsUsedProblemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
});

const userModel = mongoose.model("users", userSchema);
export default userModel;