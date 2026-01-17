import Elysia from "elysia";
import { logger } from "./winston";

export const winston = new Elysia({ name: "lib_logger" }).decorate(
  "logger",
  logger
);
