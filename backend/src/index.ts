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
} from "./lib/connection";
import { validateIP } from "./lib/util";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import http from "http";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const client = new ModbusRTU();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Server: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

let IP = "";
let moxaPort = "";
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
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
  } catch (error) {
    console.log(error);
    res.json({ connected: false });
  }
});

app.get("/api/connection", async (_req: Request, res: Response) => {
  const ret = client.isOpen
    ? { connected: client.isOpen, ip: IP, port: moxaPort }
    : { connected: client.isOpen };
  res.json(ret);
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
