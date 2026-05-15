const chairScheduleDays = Array.from(document.querySelectorAll("[data-chair-schedule-day]"));

let chairActiveScheduleDay = chairScheduleDays.find((day) => day.classList.contains("is-selected")) || chairScheduleDays[0];

function buildChairScheduleUrl(day) {
  const params = new URLSearchParams({
    date: day?.dataset.date || ""
  });

  return `selected-schedule.html?${params.toString()}`;
}

function updateChairScheduleSelection(day) {
  if (!day) {
    return;
  }

  chairActiveScheduleDay = day;
  chairScheduleDays.forEach((item) => item.classList.toggle("is-selected", item === day));
}

chairScheduleDays.forEach((day) => {
  day.addEventListener("click", () => {
    const hasSchedule = day.classList.contains("has-duty") || Number(day.dataset.students || 0) > 0;

    if (!hasSchedule) {
      return;
    }

    updateChairScheduleSelection(day);
    window.location.href = buildChairScheduleUrl(day);
  });
});

updateChairScheduleSelection(chairActiveScheduleDay);
