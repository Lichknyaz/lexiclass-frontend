export function formatLastPracticedAt(value: string | null | undefined) {
  if (!value) {
    return "Not practiced yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const time = formatTime(date);

  if (isSameCalendarDay(date, new Date())) {
    return `Today, ${time}`;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameCalendarDay(date, yesterday)) {
    return `Yesterday, ${time}`;
  }

  return formatDateTime(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
