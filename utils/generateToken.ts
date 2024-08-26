export function generateToken() {
  // Get the current timestamp in milliseconds
  const timestamp = Date.now();

  // Generate a random number between 0 and 1
  const randomNumber = Math.random();

  // Get the process ID (PID) of the current process
  const processId = process.pid;

  // Combine the timestamp, random number, and process ID into a string
  const tokenString = `${timestamp}-${randomNumber}-${processId}`;

  return tokenString;
}

