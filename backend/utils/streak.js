/**
 * Calculates current streak and longest streak from a list of entry dates.
 * A streak increments for consecutive calendar days with >= 1 entry.
 */
function calculateStreak(dates) {
  if (!dates || dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique YYYY-MM-DD date strings sorted in descending order
  const uniqueDays = Array.from(
    new Set(
      dates.map(d => {
        const date = new Date(d);
        return date.toISOString().split('T')[0];
      })
    )
  ).sort().reverse();

  if (uniqueDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check if active today or yesterday for current streak
  const mostRecentDay = uniqueDays[0];
  const isCurrentActive = mostRecentDay === today || mostRecentDay === yesterday;

  // Calculate longest streak & current streak
  for (let i = 0; i < uniqueDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(uniqueDays[i - 1]);
      const currDate = new Date(uniqueDays[i]);
      const diffDays = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate active current streak
  if (isCurrentActive) {
    let streakCount = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDate = new Date(uniqueDays[i - 1]);
      const currDate = new Date(uniqueDays[i]);
      const diffDays = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streakCount++;
      } else {
        break;
      }
    }
    currentStreak = streakCount;
  } else {
    currentStreak = 0;
  }

  return { currentStreak, longestStreak };
}

module.exports = { calculateStreak };
