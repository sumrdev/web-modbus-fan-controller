# Modbus Project

This project contains scripts to manage and run CPU fan and windmill controllers using Modbus protocol.

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/sumrdev/web-modbus-fan-controller
   ```

2. Navigate to the project directory:

   ```sh
   cd web-modbus-fan-controller
   ```

3. Set up dependencies for both CPU fan and windmill controllers:
   ```sh
   npm run setup-cpu-fan && npm run setup-windmill
   ```

### Running the Project

#### CPU Fan Controller

To start the CPU fan controller (both client and server):

```sh
npm run start-cpu-fan
```

To start the windmill controller run

```sh
npm run start-windmill
```
