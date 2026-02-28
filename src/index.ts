import { config } from "dotenv";
import chalk from "chalk";

let cachedEnv: unknown = null;

type ValueType = "number" | "string" | "boolean";
interface EnvConfig {
  [key: string]: ValueType;
}

const loadEnv = (path: string) => {
  if (cachedEnv) return cachedEnv;
  const result = config({ path });

  if (result?.error) {
    throw new Error(
      chalk.bgRed.white.bold(" ERROR ") + " " + chalk.red(result.error.message),
    );
  }

  console.log(
    chalk.bgGreen.white.bold(" SUCCESS ") +
      " " +
      chalk.green(`Successfully loaded ${chalk.blue(path)} file`),
  );
  return result.parsed;
};

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
  cachedEnv = loadEnv(path);

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
