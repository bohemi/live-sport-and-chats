import winston from "winston";

const logger = winston.createLogger({
  level: "info", // Minimum level to log
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(), // Stores logs as JSON for easy searching later
  ),
  transports: [
    // Output to the terminal (like console.log)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // Save errors to a specific file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Save everything to a combined file
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
