/**
 * Generates 14 weeks (14 * 7 = 98 days) of activity heatmap data
 * grouped into columns (weeks) and rows (days of week: Sun-Sat or Mon-Sun).
 */
function generateHeatmapData(entries) {
  // Map of YYYY-MM-DD -> count
  const countMap = {};
  entries.forEach(e => {
    const d = new Date(e.createdAt).toISOString().split('T')[0];
    countMap[d] = (countMap[d] || 0) + 1;
  });

  const totalWeeks = 14;
  const daysInGrid = totalWeeks * 7;
  
  // Find start date: end of current week, going back 14 weeks
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
  
  // End on current week Saturday
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - currentDayOfWeek));
  
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - daysInGrid + 1);

  const days = [];
  const weeks = [];
  let currentWeek = [];

  for (let i = 0; i < daysInGrid; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const count = countMap[dateStr] || 0;

    let intensity = 0;
    if (count === 1) intensity = 1;
    else if (count === 2) intensity = 2;
    else if (count >= 3 && count <= 4) intensity = 3;
    else if (count >= 5) intensity = 4;

    const dayObj = {
      date: dateStr,
      count,
      intensity, // 0 to 4
      dayOfWeek: date.getDay(),
      isFuture: date > today,
    };

    days.push(dayObj);
    currentWeek.push(dayObj);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return {
    weeks,
    days,
    totalEntries: entries.length,
  };
}

module.exports = { generateHeatmapData };
