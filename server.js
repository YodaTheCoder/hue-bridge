import express from "express";
import Hue from "./hue.js";

import dotenv from "dotenv";
dotenv.config();

const { HUE_BRIDGE_IP, HUE_USER } = process.env;

const app = express();
const port = 8080;
const hue = new Hue({
  bridge: HUE_BRIDGE_IP,
  user: HUE_USER,
});

await hue.init();

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.get("/lights", (_, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(hue.lights));
});

app.get("/toggle", async (req, res) => {
  const light = req.query.light;
  res.setHeader("Content-Type", "application/json");
  if (!light) {
    return res.status(400).json({ error: "required light id is missing" });
  }
  await hue.toggle(parseInt(light));
  return res.status(204).end();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Hue-Bridge app listening on port ${port}`);
});
