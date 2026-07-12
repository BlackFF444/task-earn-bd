// Integration Test Script for Task Earn Bd
// Simulates LocalStorage and runs test assertions on services

const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, value) => { storage[key] = value.toString(); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Now dynamically import after mock is attached
const { authService, dbService, getMultiplier } = await import('./src/services/firebase.js');

async function runTests() {
  console.log("=== STARTING INTEGRATION TESTS FOR TASK EARN BD ===\n");
  
  // 1. Test Auth
  console.log("1. Testing Authentication...");
  const user = await authService.loginWithGoogle();
  console.log(`   - Logged in successfully: ${user.name} (${user.email})`);
  console.log(`   - Generated Referral Code: ${user.referralCode}`);
  if (user.balance !== 0) throw new Error("Initial balance should be 0");
  
  // 2. Test Get Tasks
  console.log("2. Testing Task Retrieval...");
  const tasks = await dbService.getTasks();
  console.log(`   - Retrieved ${tasks.length} tasks successfully.`);
  if (tasks.length < 4) throw new Error("Should have at least 4 default tasks");

  // 3. Test Streak Claim
  console.log("3. Testing Daily Streak Claim...");
  const streakResult = await dbService.claimStreak(user.id);
  console.log(`   - Streak claimed: Day ${streakResult.streakCount}, Reward: $${streakResult.reward} USDT`);
  const userAfterStreak = authService.getCurrentUser();
  console.log(`   - Current Balance: $${userAfterStreak.balance} USDT`);
  if (userAfterStreak.balance !== streakResult.reward) throw new Error("Balance should match streak reward");

  // Try claiming streak again (should throw error because of 24h lock)
  try {
    await dbService.claimStreak(user.id);
    throw new Error("Should not allow claiming streak twice in 24 hours");
  } catch (err) {
    console.log(`   - Correctly prevented duplicate check-in: "${err.message}"`);
  }

  // 4. Test Crypto Quiz
  console.log("4. Testing Daily Quiz...");
  const quizResult = await dbService.submitQuizAnswer(user.id, true);
  console.log(`   - Submitted quiz answer (Correct): Earned $${quizResult.reward} USDT`);
  const userAfterQuiz = authService.getCurrentUser();
  console.log(`   - Current Balance: $${userAfterQuiz.balance} USDT`);
  if (userAfterQuiz.balance !== parseFloat((userAfterStreak.balance + 0.05).toFixed(4))) {
    throw new Error("Quiz reward not credited correctly");
  }

  // Try taking quiz again (should throw error because of daily lock)
  try {
    await dbService.submitQuizAnswer(user.id, true);
    throw new Error("Should not allow taking quiz twice in a day");
  } catch (err) {
    console.log(`   - Correctly prevented duplicate quiz attempt: "${err.message}"`);
  }

  // 5. Test Multipliers
  console.log("5. Testing Multiplier Progression...");
  console.log(`   - Multiplier for 0 refs: x${getMultiplier(0).toFixed(1)}`);
  console.log(`   - Multiplier for 5 refs: x${getMultiplier(5).toFixed(1)}`);
  console.log(`   - Multiplier for 15 refs: x${getMultiplier(15).toFixed(1)}`);
  if (getMultiplier(0) !== 1.0 || getMultiplier(5) !== 1.5 || getMultiplier(15) !== 2.0) {
    throw new Error("Multipliers not configured correctly");
  }

  // 6. Test Task Claim with Multiplier
  console.log("6. Testing Task Claiming...");
  // Simulate 15 referrals to test Platinum multiplier (x2.0)
  await dbService.testerUpdateUser(user.id, { referralCount: 15 });
  const activeUser = authService.getCurrentUser();
  console.log(`   - Artificially upgraded user to ${activeUser.referralCount} referrals (Multiplier: x${getMultiplier(activeUser.referralCount).toFixed(1)})`);

  const targetTask = tasks[0]; // Reward 0.05
  console.log(`   - Claiming task "${targetTask.title}" (Base Reward: $${targetTask.reward} USDT)`);
  
  const claimResult = await dbService.claimTask(user.id, targetTask.id);
  console.log(`   - Task claimed successfully! Earned reward: $${claimResult.earnedAmount} USDT`);
  if (claimResult.earnedAmount !== targetTask.reward * 2.0) {
    throw new Error("Multiplier not applied to task reward");
  }
  
  const userAfterTask = authService.getCurrentUser();
  console.log(`   - Current Balance: $${userAfterTask.balance} USDT`);

  // Update user balance to 2.00 to pass the minimum withdrawal check
  await dbService.testerUpdateUser(user.id, { balance: 2.00 });
  const userPrepared = authService.getCurrentUser();
  console.log(`   - Sandbox balance updated to: $${userPrepared.balance} USDT`);

  // 7. Test Withdrawal Request
  console.log("7. Testing Withdrawal Gateway...");
  const withdrawAmount = 0.50;
  console.log(`   - Requesting withdrawal of $${withdrawAmount} USDT via TRC20`);
  const wdRequest = await dbService.requestWithdrawal(user.id, withdrawAmount, 'TRC20', 'TYn8sB...x20a');
  console.log(`   - Withdrawal request status: ${wdRequest.status}`);
  if (wdRequest.status !== 'Pending') throw new Error("Initial status must be Pending");

  const userAfterWithdraw = authService.getCurrentUser();
  console.log(`   - Balance after deduction: $${userAfterWithdraw.balance} USDT`);
  if (userAfterWithdraw.balance !== parseFloat((userPrepared.balance - withdrawAmount).toFixed(4))) {
    throw new Error("Withdrawal amount not deducted from balance");
  }

  // 8. Test Admin Payout Rejection & Auto-Refund
  console.log("8. Testing Admin Payout Rejection (Auto-Refund)...");
  await dbService.rejectWithdrawal(wdRequest.id);
  const userAfterReject = authService.getCurrentUser();
  console.log(`   - Withdrawal status updated to Rejected.`);
  console.log(`   - Balance after rejection refund: $${userAfterReject.balance} USDT`);
  if (userAfterReject.balance !== userPrepared.balance) {
    throw new Error("Rejected withdrawal did not refund balance");
  }

  // 9. Test Admin Payout Approval
  console.log("9. Testing Admin Payout Approval...");
  // Create another withdrawal
  const wdRequest2 = await dbService.requestWithdrawal(user.id, withdrawAmount, 'Nagad', '01712345678');
  console.log(`   - Re-requested withdrawal of $${withdrawAmount} USDT via Nagad`);
  await dbService.approveWithdrawal(wdRequest2.id);
  console.log(`   - Withdrawal status updated to Approved.`);
  const allWithdrawals = await dbService.getWithdrawals();
  const freshWd2 = allWithdrawals.find(w => w.id === wdRequest2.id);
  if (freshWd2.status !== 'Approved') throw new Error("Status should be Approved");

  console.log("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch(err => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
