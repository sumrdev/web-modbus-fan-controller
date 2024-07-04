import ModbusRTU from "modbus-serial";
import { chb, clb, bytesToASCII, insert } from "./util";

const firmware = async (client: ModbusRTU) => {
  const { data } = await client.readInputRegisters(5029, 4);
  return `v${data[0] & 0xff}.${(data[0] >> 8) & 0xff}\
 Build: ${chb(data[2])}${clb(data[2])}${chb(data[3])}${clb(data[3])}`;
};

const modelName = async (client: ModbusRTU) => {
  const { data } = await client.readInputRegisters(5000, 4);
  return bytesToASCII(data);
};

const macAddress = async (client: ModbusRTU) => {
  const { data } = await client.readInputRegisters(5024, 4);
  return data
    .reduce<string[]>((acc: string[], data) => {
      return [...acc, insert(data.toString(16).padStart(4, "0"), 2, ":")];
    }, [])
    .join(":");
};

const deviceName = async (client: ModbusRTU) => {
  const { data } = await client.readInputRegisters(5040, 8);
  return bytesToASCII(data);
};

const connect = async (client: ModbusRTU, ip: string, port = 502) => {
  await client.connectTCP(ip, { port });
  return client.isOpen;
};

const getSpeed = async (client: ModbusRTU) => {
  return (await client.readHoldingRegisters(1024, 1)).data[0];
};

const setSpeed = async (client: ModbusRTU, value: number) => {
  const cleanNumber = Math.max(Math.min(value, 4096), 0);
  await client.writeRegister(1024, cleanNumber);
  return await getSpeed(client);
};
const setStop = async (client: ModbusRTU, value: number) => {
  const cleanNumber = Math.max(Math.min(value, 4096), 0);
  await client.writeRegister(1025, cleanNumber);
  return await getSpeed(client);
};

const emergencyStop = async (client: ModbusRTU) => {
  setSpeed(client, 0);
  setStop(client, 0);
  return "stopped";
};
const restart = async (client: ModbusRTU) => {
  setSpeed(client, 0);
  setStop(client, 4096);
  return "started";
};

export {
  connect,
  firmware,
  deviceName,
  modelName,
  macAddress,
  getSpeed,
  setSpeed,
  setStop,
  emergencyStop,
  restart,
};
