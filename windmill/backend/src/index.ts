import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import ModbusRTU from "modbus-serial";
import {
  deviceName,
  connect,
  firmware,
  getSpeed,
  macAddress,
  modelName,
  setSpeed,
  emergencyStop,
  setStop,
  restart,
} from "./lib/connection";
import { validateIP } from "./lib/util";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import http from "http";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;
const socketPort = 1337;

const server = http.createServer(app);

let client = new ModbusRTU();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

let IP = "";
let moxaPort = "";
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});


app.use(async (req: Request, _: Response, next) => {
  const skipRoutes = ["api/connection"];
  if (skipRoutes.includes(req.path)) {
    return next();
  }
  const p = parseInt(port as string)
  try {
    console.log("reading status before allowing endpoint")
    client.setTimeout(500)
    await getSpeed(client);
  } catch (error) {
    console.log("reconnecting", error)
    client.destroy(() => { })
    client = new ModbusRTU();
    try {
      await connect(client, IP, p);
      console.log("connected: awesome")
    } catch (e) {
      console.log("not: awesome")
    }
  }
  next();
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

server.listen(socketPort);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Server: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  setInterval(async () => {
    console.log("send");
    if (!client.isOpen) return;
    ws.send(await getSpeed(client));
  }, 1000);
});

app.post("/api/connection", async (req: Request, res: Response) => {
  try {
    const ip = req.query.ip as string;
    const port = req.query.port as string;
    if (!validateIP(ip)) throw "cant validate ip";
    res.json({
      connected: await connect(client, ip, parseInt(port)),
      ip: ip,
      port: port,
    });
    IP = ip;
    moxaPort = port;
    setStop(client, 4096);
  } catch (error) {
    console.log(error);
    res.json({ connected: false });
  }
});

app.get("/api/connection", async (_req: Request, res: Response) => {
  try {
    const ret = client.isOpen
      ? { connected: client.isOpen, ip: IP, port: moxaPort }
      : { connected: client.isOpen };
    res.json(ret);
  } catch (error) {
    console.log(error)
    res.json({ error: error })
  }
});

app.post("/api/speed", async (req: Request, res: Response) => {
  try {
    res.json({ speed: await setSpeed(client, parseInt(req.body.speed)) });
  } catch (error) {
    console.log(error);
    res.json({ error: "error" });
  }
});

app.get("/api/speed", async (req: Request, res: Response) => {
  try {
    res.json({ speed: await getSpeed(client) });
  } catch (error) {
    console.log(error);
    res.json({ error: "error" });
  }
});

app.get("/api/firmware", async (req: Request, res: Response) => {
  try {
    res.json({ firmware: await firmware(client) });
  } catch (error) {
    console.log(error);
    res.json({ error: "error" });
  }
});

app.get("/api/device-name", async (req: Request, res: Response) => {
  try {
    res.json({ deviceName: await deviceName(client) });
  } catch (error) {
    console.log(error);
    res.json({ error: "error" });
  }
});

app.get("/api/model", async (req: Request, res: Response) => {
  try {
    res.json({ model: await modelName(client) });
  } catch (error) {
    console.log(error);
    res.json({ error: "error" });
  }
});

app.get("/api/mac-address", async (req: Request, res: Response) => {
  try {
    res.json({ mac: await macAddress(client) });
  } catch (error) {
    console.log(error);
    res.json({ error: "error" });
  }
});

app.post("/api/emergency-stop", async (req: Request, res: Response) => {
  try {
    res.json({ success: await emergencyStop(client) });
  } catch (error) {
    res.json({ success: false });
  }
});

app.post("/api/restart", async (req: Request, res: Response) => {
  try {
    res.json({ success: await restart(client) });
  } catch (error) {
    res.json({ success: false });
  }
});
