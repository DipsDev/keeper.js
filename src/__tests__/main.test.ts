import request from "supertest";
import { app } from "./app";

describe("Create Key", () => {
  test("should create your key and return it", async () => {
    const response = await request(app)
      .post("/auth/keys")
      .send({
        userId: "ABCD",
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(response.status).toEqual(401); // Should reject because not whitelisted
  });
  test("should be able to create key, because is whitelisted", async () => {
    const response = await request(app)
      .post("/auth/keys")
      .send({ userId: "A" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(response.status).toEqual(201);
    expect(response.body.key).toBeDefined();
  });
});

describe("Revoke Key", () => {
  test("Should delete key and not be able to use anymore", async () => {
    const keyResponse = await request(app)
      .post("/auth/keys")
      .send({
        userId: "A",
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    const shouldWork = await request(app)
      .get("/authorized-api-keys-only")
      .set("Authorization", `Bearer ${keyResponse.body.key}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(shouldWork.status).toEqual(200);
    expect(shouldWork.body.code).toEqual("s3cret");

    const response = await request(app)
      .delete("/auth/keys")
      .send({
        userId: "A",
      })
      .set("Authorization", `Bearer ${keyResponse.body.key}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);

    const shouldNotWork = await request(app)
      .get("/authorized-api-keys-only")
      .set("Authorization", `Bearer ${keyResponse.body.key}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(shouldNotWork.status).toEqual(401);
  });
});
