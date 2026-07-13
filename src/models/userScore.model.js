// online-compiler/src/models/userScore.model.js
import mongoose from 'mongoose';

const userScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true }, // references User in YT-AUTH's DB, not populatable here
  totalScore: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
  solvedProblemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }], // this ref IS fine, Problem lives in same DB
  lastSolvedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('UserScore', userScoreSchema);