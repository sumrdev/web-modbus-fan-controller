import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const app = express();
const APP_PORT = 3000;

import ModbusRTU from "modbus-serial";
let client = new ModbusRTU();
// allow cross-origin requests from any domain and any port
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

const pythonScript = "script.py";

app.use(cors(corsOptions));

app.listen(APP_PORT, () =>
  console.log(`Modbus API Backend running on port ${APP_PORT}!`),
);

let IP;

async function connect(ip, port = 502) {
  try {
    IP = ip;
    await client.connectTCP(ip, { port: port, timeout: 1000 });
  } catch (error) {

  }
}

function parseCoilData(data) {
  let result = "";
  if (data.data[0] == 0) {
    result = "OFF";
  } else if (data.data[0] == 1) {
    result = "ON";
  }
  if (data.data[1] == 0 && result == "ON") {
    result = "FASTER";
  } else if (data.data[1] == 1 && result == "OFF") {
    result = "DESYNCED";
  }
  return result;
}

async function readCoils() {
  let res = await client.readCoils(0, 2);
  return parseCoilData(res);
}

async function startFan() {
  await client.writeCoil(0, true);
}

async function stopFan() {
  await client.writeCoil(0, false);
  await client.writeCoil(1, false);
}

async function setToSpeed1() {
  await client.writeCoil(0, true);
  await client.writeCoil(1, false);
}

async function setToSpeed2() {
  await client.writeCoil(0, true);
  await client.writeCoil(1, true);
}

function isOpen() {
  try {
    return client.isOpen;
  } catch (e) {
    return false;
  }
}

app.use(async (req, res, next) => {
  const skipRoutes = ["/is-connected", "/connect"];
  if (skipRoutes.includes(req.path)) {
    return next();
  }

  try {

    console.log("reading status before allowing endpoint")
    client.setTimeout(500)
    await readCoils();

  } catch (error) {
    console.log("reconnecting", error)
    client.destroy()
    client = new ModbusRTU();
    try {
      await connect(IP);
      console.log("connected: awesome")
    } catch (e) {
      console.log("not: awesome")
    }
  }
  next();
})

app.get("/is-connected", async (req, res) => {
  try {

    let value = isOpen();
    res.json({ message: value });
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
});

app.get("/connect", async (req, res) => {
  // get the ?ip= parameter from the query string
  const ip = req.query.ip;
  try {
    await connect(ip);
    console.log("connected: awesome")
    res.json({ message: client.isOpen });
  } catch (e) {
    console.log("not: awesome")
    res.json({ message: false });
  }
});

app.get("/disconnect", async (req, res) => {
  try {
    client.close();
    let open = isOpen();
    res.json({ message: false });
  } catch (error) {
    console.log(error)
  }
});

app.get("/start", async (req, res) => {
  try {
    await startFan();
    res.json({ message: await readCoils() });
  } catch (error) {
    console.log(erro)
  }
});

app.get("/stop", async (req, res) => {
  try {
    await stopFan();
    res.json({ message: await readCoils() });
  } catch (error) {
    console.log(error)
  }
});

app.get("/speed1", async (req, res) => {
  try {
    await setToSpeed2();
    res.json({ message: await readCoils() });
  } catch (error) {
    console.log(error)
  }
});

app.get("/speed2", async (req, res) => {
  try {
    await setToSpeed1();
    res.json({ message: await readCoils() });
  } catch (error) {
    console.log(error)
  }
});

app.get("/status", async (req, res) => {
  try {
    res.json({ message: await readCoils() });
  } catch (error) {
    handleError(error)
    console.log(error)
  }
});

app.get("/run-script", async (req, res) => {
  try {
    const script = req.query.script;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pathToScript = path.join(__dirname, "scripts/");
    // if script is not a number
    if (isNaN(script)) {
      res.json({ message: "Script is not a number" });
      return;
    }

    const command = `cd ${pathToScript} && python3 ${script + pythonScript}`;
    res.json({ message: "Script ran successfully" });
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      }
    });
  } catch (e) {
    res.json({ message: "Script ran unsuccessfully" });
  }
});
