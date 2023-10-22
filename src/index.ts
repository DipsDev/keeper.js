import { type RequestHandler, Request } from "express";
import crypto from "node:crypto";
import Adapter from "./adapters/adapter";

interface KeeperConfig {
  unauthorizedMessage?: string;
  adapter: Adapter;
  overrideKeyGeneration?: () => string;
}

interface KeeperFunction {
  adapter: Adapter;
  methods: {
    create: (
      validator: (req: Request, userId: string) => Promise<boolean>
    ) => RequestHandler;
    revoke: (
      validator: (req: Request, key: string) => Promise<boolean>
    ) => RequestHandler;
    auth: () => RequestHandler;
  };
}

export function getApiKey(req: Request) {
  return req.headers["authorization"]?.split(" ")[1];
}

export function Keeper(config: KeeperConfig): KeeperFunction {
  return {
    adapter: config.adapter,
    methods: {
      create: (validator) => async (req, res) => {
        const userId = req.body?.userId;
        if (!userId) {
          return res.status(400).json({ message: "Missing userId parameter" });
        }

        if (!(await validator(req, userId))) {
          return res
            .status(401)
            .json({ message: "Unauthorized: `Validator` method was rejected" });
        }

        const key = config.overrideKeyGeneration
          ? config.overrideKeyGeneration()
          : crypto.randomUUID();
        await config.adapter
          .createKey(key, userId)
          .then(() => {
            res.status(201).json({ message: "OK", key });
          })
          .catch((error: string) => {
            res.status(500).json({ message: "Error Occured", error });
          });
      },
      revoke: (validator) => async (req, res) => {
        const key = getApiKey(req);
        if (!key) {
          return res
            .status(401)
            .json({ message: "Unauthorized: `Key` is undefined" });
        }
        if (!(await validator(req, key))) {
          console.error("Unauthorized: `Validator` method was rejected");
          return res
            .status(401)
            .json({ message: "Unauthorized: `Validator` method was rejected" });
        }
        await config.adapter.revokeKey(key);
        return res.status(200).json({ message: "OK" });
      },
      auth: () => async (req, res, next) => {
        const apiKey = getApiKey(req);
        if (!apiKey) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const isValid = await config.adapter.checkKey(apiKey);
        if (!isValid) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        next();
      },
    },
  };
}
