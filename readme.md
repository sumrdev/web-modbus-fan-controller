# EZ web modbus fan controller 

Simple web interface to control a fan via modbus.

You need a modbus controller with a fan on coil 0 and speed control on coil 1

You also ned to have [nodejs](https://nodejs.org/en) installed and npm 


## Installation

```bash
git clone https://github.com/sumrdev/web-modbus-fan-controller

cd web-modbus-fan-controller

npm install && npm run setup && npm run start

#note if you want to just start it without the setup you can use
npm run start
```

## Configuration
Put in the IP of the modbus controller

enjoy

## Running scripts.
You can run python scripts by calling them 1script.py or 2script.py and so on and putting them in /server/scripts
