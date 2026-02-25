import { config, configDotenv } from "dotenv";
import chalk from "chalk";

type ValueType = "number" | "string" | "boolean";
interface EnvConfig {
  [key: string]: ValueType;
}

function parseValue(key: string, value: string, type: ValueType) {
  let parsedValue: unknown;
  if (type === "number") {
    parsedValue = Number(value);
    if (Number.isNaN(parsedValue)) {
      throw new Error(
        chalk.bgRed.white.bold(` ERROR `) +
          " " +
          chalk.yellowBright.bold(key) +
          chalk.red(` must be a valid ${type}`),
      );
    }
  } else if (type === "boolean") {
    if (value.toLowerCase() === "true") {
      parsedValue = true;
    } else if (value.toLowerCase() === "false") {
      parsedValue = false;
    } else {
      throw new Error(
        chalk.bgRed.white.bold(` ERROR `) +
          " " +
          chalk.yellowBright.bold(key) +
          chalk.red(` must be a valid ${type}`),
      );
    }
  }

  return parsedValue;
}

export const validateEnv = (
  schema: EnvConfig,
  envLocation?: { path: string; load: boolean },
) => {
  const path = (envLocation?.load && envLocation?.path) || ".env";
  const configResult = config({ path });

  if (configResult?.error) {
    throw new Error(
      chalk.bgRed.white.bold(" ERROR ") +
        " " +
        chalk.red(configResult.error.message),
    );
  }

  console.log(
    chalk.bgGreen.white.bold(" SUCCESS ") +
      " " +
      chalk.green(`Successfully loaded ${chalk.blue(path)} file`),
  );

  for (const key in schema) {
    let value: any = process.env[key];
    if (!value || value === undefined || value === null)
      throw new Error(
        chalk.bgRed.white.bold(" ERROR ") +
          " " +
          chalk.yellowBright.bold(key) +
          chalk.red(" is missing in ") +
          chalk.blue(path) +
          chalk.red(" file"),
      );
    if (schema[key] !== "string") value = parseValue(key, value, schema[key]!);
    schema[key] = value;
  }
  return schema;
};
