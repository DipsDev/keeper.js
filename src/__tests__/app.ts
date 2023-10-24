import express from "express";
import bodyParser from "body-parser";

import { Keeper } from "..";
import MemoryAdapter from "../adapters/memoryAdapter";
import Adapter from "../adapters/adapter";
export const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const keeper = Keeper({
  adapter: MemoryAdapter(),
});

const whitelistUsers = ["A", "AB"];

app.post(
  "/auth/keys",
  keeper.routes.create(async (_req, userId) => {
    return whitelistUsers.includes(userId);
  })
);
app.delete(
  "/auth/keys",
  keeper.routes.revoke(async (req, key) => {
    const userId = await keeper.adapter.findByKey(key);
    return userId === req.body?.userId;
  })
);

app.get("/authorized-api-keys-only", keeper.routes.protect(), (_req, res) => {
  return res
    .status(200)
    .json({ message: "HII, you got my secret code!", code: "s3cret" });
});
