export function sanitizeData(data: any): any {
  if (!data || typeof data !== "object") return data;

  const sensitiveFields = [
    "password",
    "pwd",
    "secret",
    "token",
    "accessToken",
    "refreshToken",
  ];
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = "***REDACTED***";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
}
