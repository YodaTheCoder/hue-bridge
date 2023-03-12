import Hue from "./hue.js";

import dotenv from "dotenv";
dotenv.config();

const { HUE_BRIDGE_IP, HUE_USER } = process.env;

const hue = new Hue({
  bridge: HUE_BRIDGE_IP,
  user: HUE_USER,
  light: 12,
});

await hue.init();
console.log(`ready: ${hue.ready}`);

await hue.toggle(3);
