import http from "http";

const checkBridgeConnectivity = async (ip, user) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      hostname: ip,
      path: `/api/${user}/lights`,
      headers: {},
      maxRedirects: 20,
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        const body = Buffer.concat(chunks);
        resolve(JSON.parse(body.toString()));
      });

      res.on("error", function (error) {
        console.error(error);
        reject(null);
      });
    });

    req.end();
  });
};

const setLightState = async ({ ip, user, light, on }) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "PUT",
      hostname: ip,
      path: `/api/${user}/lights/${light}/state`,
      headers: {
        "Content-Type": "application/json",
      },
      maxRedirects: 20,
    };

    const req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        const body = Buffer.concat(chunks);
        resolve(JSON.parse(body.toString()));
      });

      res.on("error", function (error) {
        reject(null);
      });
    });

    const postData = JSON.stringify({
      on,
    });

    console.log(`light ${light} post ${postData}`);
    req.write(postData);
    req.end();
  });
};

export default class Hue {
  constructor({ bridge, user }) {
    this.bridge = bridge;
    this.user = user;
    this.ready = false;
    this.error = "";

    this.lights = [];
  }

  async init() {
    const bridgeData = await checkBridgeConnectivity(this.bridge, this.user);
    if (!bridgeData) {
      this.error = "Failed to make connection with bridge. Check IP address and user ID.";
      return;
    }

    this.lights = [];
    for (const [key, value] of Object.entries(bridgeData)) {
      const { name, type, state } = value;
      const { on, reachable } = state;
      const thisLight = {
        id: parseInt(key),
        name,
        type,
        reachable,
        on,
      };
      this.lights.push(thisLight);
    }

    this.ready = true;
    this.error = "";
  }

  async toggle(id) {
    await this.init();
    const tl = this.lights.find((f) => f.id === id);
    await setLightState({ ip: this.bridge, user: this.user, light: id, on: !tl.on });
    await this.init();
  }
}
