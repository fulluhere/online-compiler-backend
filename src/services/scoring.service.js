// online-compiler/src/services/scoring.service.js
import userModel from '../models/user.model.js';
import problemModel from '../models/problem.model.js';

const DIFFICULTY_POINTS = { Easy: 10, Medium: 20, Hard: 30 };

export async function updateScoreOnAccept(userID, problemID) {
  if (!userID || !problemID) {
    // matches Submission schema's required: false — skip scoring if either is missing
    console.warn('Skipping score update: missing userID or problemID');
    return null;
  }

  const user = await userModel.findById(userID);
  if (!user) throw new Error('User not found');

  const alreadySolved = user.solvedProblemIds.some(
    (id) => id.toString() === problemID.toString()
  );
  if (alreadySolved) return user; // already solved before — resubmission, no score change

  const problem = await problemModel.findById(problemID);
  if (!problem) throw new Error('Problem not found');

  const points = DIFFICULTY_POINTS[problem.difficulty] ?? 0;

  user.score += points;
  user.problemsSolved += 1;
  user.solvedProblemIds.push(problemID);
  await user.save();

  return user;
}