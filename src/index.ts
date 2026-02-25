import { config } from "dotenv";

type ValueType = "number" | "string" | "boolean";
interface EnvConfig {
  [key: string]: ValueType;
}

function parseValue(key: string, value: string, type: ValueType) {
  let parsedValue: unknown;
  if (type === "number") {
    parsedValue = Number(value);
    if (Number.isNaN(parsedValue)) {
      throw new Error(`${key} must be a valid ${type}`);
    }
  } else if (type === "boolean") {
    if (value.toLowerCase() === "true") {
      parsedValue = true;
    } else if (value.toLowerCase() === "false") {
      parsedValue = false;
    } else {
      throw new Error(`${key} must be a valid ${type}`);
    }
  }

  return parsedValue;
}

export const validateEnv = (
  schema: EnvConfig,
  envLocation?: { path: string; load: boolean },
) => {
  config({ path: (envLocation?.load && envLocation?.path) || ".env" });

  for (const key in schema) {
    let value: any = process.env[key];
    if (!value || value === undefined || value === null)
      throw new Error(`Missing env variable: ${key}`);
    console.log(typeof schema[key]);

    if (schema[key] !== "string") value = parseValue(key, value, schema[key]!);
    schema[key] = value;
  }
  return schema;
};