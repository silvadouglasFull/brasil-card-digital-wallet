import {
    utilities as nestWinstonModuleUtilities,
    WinstonModuleOptions,
} from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";

const datePattern = "DD-MM-YYYY-HH-mm";

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike("BrasilCard", {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      level: "error",
      dirname: "logs/errors",
      filename: `%DATE%-error.log`,
      datePattern: datePattern,
      zippedArchive: false,
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    new winston.transports.DailyRotateFile({
      dirname: "logs/combined",
      filename: `%DATE%-combined.log`,
      datePattern: datePattern,
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
      ),
    }),
  ],
};
