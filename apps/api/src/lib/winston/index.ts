import Elysia from "elysia";
import { logger } from "./winston";

export const winston = new Elysia().decorate("logger", logger);
