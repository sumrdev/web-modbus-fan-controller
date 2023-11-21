import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';


const app = express();
const APP_PORT = 3000;

import ModbusRTU from "modbus-serial";
const client = new ModbusRTU();

// allow cross-origin requests from any domain and any port
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};

const pythonScript = 'script.py'

app.use(cors(corsOptions));

app.listen(APP_PORT, () =>
  console.log(`Modbus API Backend running on port ${APP_PORT}!`),
);

async function connect(ip, port = 502) {
    await client.connectTCP(ip, { port: port })
}

function parseCoilData(data) {
    let result = ""
    if(data.data[0] == 0) {
        result = "OFF"
    } else if (data.data[0] == 1) {
        result = "ON"
    } 
    if (data.data[1] == 1 && result == "ON") {
        result = "FASTER"
    } else if (data.data[1] == 1 && result == "OFF") {
        result = "DESYNCED"   
    }
    return result
}

async function readCoils() {
    let res = await client.readCoils(0, 2)
    return parseCoilData(res)
}

async function startFan() {
    await client.writeCoil(0, true)
}

async function stopFan() {
    await client.writeCoil(0, false)
    await client.writeCoil(1, false)
}

async function setToSpeed1() {
    await client.writeCoil(0, true)
    await client.writeCoil(1, false)
}

async function setToSpeed2() {
    await client.writeCoil(0, true)
    await client.writeCoil(1, true)
}

function isOpen(){
    try {
        return client.isOpen
    }
    catch (e) {
        return false
    }
}

app.get('/is-connected', async (req, res) => {
    let value = isOpen()
    res.json({ message: value})
})

app.get('/connect', async (req, res) => {
    // get the ?ip= parameter from the query string
    const ip = req.query.ip;
    try {
        await connect(ip)
        res.json({ message: client.isOpen })
    }
    catch (e) {
        res.json({ message: false })
    }
});

app.get('/disconnect', async (req, res) => {
    client.close()
    let open = isOpen()
    res.json({ message: false })
});

app.get('/start', async (req, res) => {
    await startFan()
    res.json({ message: await readCoils() })
})

app.get('/stop', async (req, res) => {
    await stopFan()
    res.json({ message: await readCoils() })
})

app.get('/speed1', async (req, res) => {
    await setToSpeed1()
    res.json({ message: await readCoils() })
})

app.get('/speed2', async (req, res) => {
    await setToSpeed2()
    res.json({ message: await readCoils() })
})

app.get('/status',  async (req, res) => {
    res.json({ message: await readCoils() })
})

app.get('/run-script', async (req, res) => {
    const script = req.query.script;

    // if script is not a number
    if (isNaN(script)) {
        res.json({ message: "Script is not a number" })
        return
    }

    const command = `python ${script+pythonScript}`;
    res.json({ message: "Script ran successfully" })
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }
    });
})