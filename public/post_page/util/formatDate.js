export function formatDate(timestamp) {
  // Convert to Date object
  const date = new Date(timestamp);

  // Extract the date part
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return formatDate;
}
