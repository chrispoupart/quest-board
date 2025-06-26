/**
 * Frontend leveling system utilities
 * Mirrors the backend leveling system
 */

export interface LevelInfo {
  level: number;
  experience: number;
  experienceToNext: number;
  experienceForCurrentLevel: number;
  progressToNext: number; // 0-1 percentage
}

/**
 * Calculate level from total experience
 * Formula: level = floor(sqrt(experience / 100)) + 1
 */
export function calculateLevel(experience: number): number {
  return Math.floor(Math.sqrt(experience / 100)) + 1;
}

/**
 * Calculate experience required for a specific level
 */
export function experienceForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Calculate experience required for the next level
 */
export function experienceToNextLevel(experience: number): number {
  const currentLevel = calculateLevel(experience);
  const nextLevelExp = experienceForLevel(currentLevel + 1);
  return nextLevelExp - experience;
}

/**
 * Calculate experience required for the current level
 */
export function experienceForCurrentLevel(experience: number): number {
  const currentLevel = calculateLevel(experience);
  return experienceForLevel(currentLevel);
}

/**
 * Calculate progress to next level (0-1)
 */
export function progressToNextLevel(experience: number): number {
  const currentLevel = calculateLevel(experience);
  const currentLevelExp = experienceForLevel(currentLevel);
  const nextLevelExp = experienceForLevel(currentLevel + 1);
  const expInCurrentLevel = experience - currentLevelExp;
  const expNeededForLevel = nextLevelExp - currentLevelExp;

  return expInCurrentLevel / expNeededForLevel;
}

/**
 * Get comprehensive level information
 */
export function getLevelInfo(experience: number): LevelInfo {
  const level = calculateLevel(experience);
  const experienceToNext = experienceToNextLevel(experience);
  const experienceForCurrent = experienceForCurrentLevel(experience);
  const progressToNext = progressToNextLevel(experience);

  return {
    level,
    experience,
    experienceToNext,
    experienceForCurrentLevel: experienceForCurrent,
    progressToNext
  };
}

/**
 * Calculate experience reward for completing a quest
 * Base formula: bounty * 10 + difficulty bonus
 */
export function calculateQuestExperience(bounty: number): number {
  const baseExperience = bounty * 10;

  let difficultyBonus = 0;
  if (bounty > 30) {
    difficultyBonus = 150; // Hard
  } else if (bounty > 15) {
    difficultyBonus = 50;  // Medium
  }
  // Easy quests get no bonus

  return baseExperience + difficultyBonus;
}

/**
 * Check if user leveled up after gaining experience
 */
export function checkLevelUp(oldExperience: number, newExperience: number): boolean {
  const oldLevel = calculateLevel(oldExperience);
  const newLevel = calculateLevel(newExperience);
  return newLevel > oldLevel;
}
