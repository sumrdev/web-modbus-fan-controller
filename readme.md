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

#### Windmill

To start the windmill controller run

```sh
npm run start-windmill
```

- In order to change the picture in the windmill controller, you can click the default TX-One image and replace it with a picture of your own
- For it to survive reloads you must however replace the logo with your own file in `/windmill/frontend/public/logo.png`
- To change colorscheme, you need to change a bit in the `/windmill/frontend/src/assets/main.css`
- Goto [shadcn themes][https://www.shadcn-vue.com/themes.html] and press the customize button and choose your style.
- Then click copy code and replace the existing code it where the comments say in `/windmill/frontend/src/assets/main.css`
- Remember you can change between light and dark mode in the bottom of the page!
- To configure the values for the Traffic Light in Windmill, please see the windmill/backend/lib/connection.ts file and change the header constants.
