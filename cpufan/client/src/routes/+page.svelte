<script>
    import { onMount } from "svelte";
    import { toasts, ToastContainer, FlatToast, BootstrapToast }  from "svelte-toasts";

    const showSuccessToast = () => {
      const toastSuccess = toasts.add({
        title: 'Connceted to the fan',
        description: 'Have fun spinning the fan!',
        duration: 5000, // 0 or negative to avoid auto-remove
        placement: 'top-center',
        type: 'info',
        theme: 'dark',
        placement: 'top-center',
        type: 'success',
        theme: 'dark',
        onClick: () => {},
        onRemove: () => {},
        // component: BootstrapToast, // allows to override toast component/template per toast
      });
    };
    const showFailToast = () => {
      const toastError = toasts.add({
        title: 'Could not connect to fan',
        description: 'Please check the IP address and try again.',
        duration: 5000, // 0 or negative to avoid auto-remove
        placement: 'top-center',
        type: 'info',
        theme: 'dark',
        placement: 'top-center',
        type: 'error',
        theme: 'dark',
        onClick: () => {},
        onRemove: () => {},
        // component: BootstrapToast, // allows to override toast component/template per toast
      });
    };
    const showDisconnectToast = () => {
      const toastError = toasts.add({
        title: 'Disconnected from fan',
        description: 'You can connect to a new IP or reconnect to the same one.',
        duration: 5000, // 0 or negative to avoid auto-remove
        placement: 'top-center',
        type: 'info',
        theme: 'dark',
        placement: 'top-center',
        type: 'success',
        theme: 'dark',
        onClick: () => {},
        onRemove: () => {},
        // component: BootstrapToast, // allows to override toast component/template per toast
      });
    };

let fanState = "";
let connected = false;
let ip = "";
let loading = false

onMount(async () => {
  try {
    await isConnected();
    if (connected) {
      await getStatus();
      connected = true
    }
  } catch (error) {
    
  }
});

async function isConnected(){
  fetch("http://localhost:3000/is-connected")
    .then((response) => response.json())
    .then((data) => connected = data.message)
      .then(() => {
      if (connected) {
        getStatus();
        ip = localStorage.getItem("ip");
        return connected;
    }
    return connected
  });
}

async function connect() {
  loading = true
  fetch(`http://localhost:3000/connect?ip=${ip}`)
    .then((response) => response.json())
    .then((data) => {
      connected = data.message;
    }).then(() => {
      console.log(connected)
      if (connected) {
        loading = false
        console.log(connected)
        getStatus();
        localStorage.setItem("ip", ip);
        showSuccessToast();
        return connected;
      }
      else {
        loading = false
        console.log("hi")
        showFailToast();
        return connected;
      }
    })
}

async function startFan() {
  fetch("http://localhost:3000/start")
    .then((response) => response.json())
    .then((data) => {
      fanState = data.message;
    });
}

function stopFan() {
  fetch("http://localhost:3000/stop")
    .then((response) => response.json())
    .then((data) => {
      fanState = data.message;
    });
}

async function slowDownFan() {
  fetch("http://localhost:3000/speed1")
    .then((response) => response.json())
    .then((data) => {
      fanState = data.message;
    });
}

async function speedUpFan() {
  fetch("http://localhost:3000/speed2")
    .then((response) => response.json())
    .then((data) => {
      fanState = data.message;
    });
}

async function getStatus() {
  fetch("http://localhost:3000/status")
    .then((response) => response.json())
    .then((data) => {
      fanState = data.message;
    });
}

function toggleFan() {
  if (fanState == "ON" || fanState == "FASTER") {
    stopFan();
  } else {
    startFan();
  }
}

function toggleFanSpeed() {
  if (fanState == "ON") {
    speedUpFan();
  } else if (fanState == "FASTER") {
    slowDownFan();
  }
}

async function disconnect() {
  fetch("http://localhost:3000/disconnect")
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      connected = data.message;
    }).then(() => {
      localStorage.removeItem("ip");
      ip = "";
      fanState = "";
      showDisconnectToast();
    });
}

async function callScript(scriptNumber) {
  fetch(`http://localhost:3000/run-script?script=${scriptNumber}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
    });
}

</script>
<div class="splitter">
  <div class="app">

    <img src="txone.png" class="logo" alt="" width="300px">
    
    <div class="box">
      <form on:submit|preventDefault={connect}>
        <input bind:value={ip} disabled={connected} />
      </form>
    </div>
    {#if loading }
      <h4>Loading...</h4>
    {/if }
    {#if connected }
      <h4>Connected</h4>
      <div class="box">
        <button on:click={disconnect}>Disconnect</button>
      </div>
    {/if}
    {#if !connected }
      <h4>Not connected</h4>
    {/if}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="runner">
      <button on:click={() => callScript(1)}>run python1</button>
      <p>description 1</p>
    </div>
    <div class="runner">
      <button on:click={() => callScript(2)}>run python2</button>
      <p>description 2</p>
    </div>
    <div class="runner">
      <button on:click={() => callScript(3)}>run python3</button>
      <p>description 3</p>
    </div>
    <div class="runner">
      <button on:click={() => callScript(4)}>run python4</button>
      <p>description 4</p>
    </div>
    {#if fanState == "OFF"}
      <div class="box">
        <button on:click={toggleFan}>Start fan</button>
      </div>
    {/if}
    {#if fanState == "ON" || fanState == "FASTER"}
      <div class="box">
        <button on:click={toggleFan}>Stop fan</button>
      </div>
    {/if}
    
    {#if fanState == "ON"}
      <div class="box">
        <button on:click={toggleFanSpeed}>Speed up fan</button>
      </div>
    {/if}
    {#if fanState == "FASTER"}
    <div class="box">
      <button on:click={toggleFanSpeed}>Slow down fan</button>
    </div>
    {/if}
  </div>
  <div class="fan-box">
    <img class={fanState + " fan"} src="fan.svg" width="300px" alt="">
    {#if fanState == "OFF"}
      <h4 >Live status: Fan is {fanState}</h4>
    {/if}
  
  {#if fanState == "ON"}
    <h4>Live status: Fan is ON, running slow</h4>
  {/if}
  {#if fanState == "FASTER"}
  <h4>Live status: Fan is ON, running at high speed</h4>
  {/if}
  </div>
</div>


<ToastContainer placement="top-center" let:data={data}>
    <FlatToast {data} /> <!-- Provider template for your toasts -->
</ToastContainer>

<style>

  @media (max-aspect-ratio: 1/1) {
    .splitter {
      flex-direction: column; 
      gap: 50px;
    }
  }

  .splitter {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    margin-top: 60px;
  }

  .fan-box{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .app{
    display: flex;
    align-items: self-start;
    flex-direction: column;
  }
  p {
    font-weight: bold;
    font-size: 20px;
  }

  h4 {
    font-size: 30px;
    font-weight: bold;
    color: white;
  }

  input {
    padding: 20px;
    min-width: 80%;
    border-radius: 10px;
    border: none;
    background-color: #d9d9d9;
    margin: 10px;
    color: #1b0b38;
    font-weight: bold;
    font-size: 20px;
  }

  button {
    padding: 20px;
    border-radius: 10px;
    width: 300px;
    border: none;
    background-color: #d9d9d9;
    margin: 10px;
    color: #1b0b38;
    font-weight: bold;
    font-size: 20px;
  }



  /* disabled input */
  input:disabled {
    background-color: #260f51;
    color: white;
  }

  input:focus {
    outline: none;
  }

  .logo{

  }

  .box{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .ON{
    animation: spin 3s linear infinite;
    transition: animation 0.5s ease; 
  }

  .FASTER {
    animation: spin 0.5s linear infinite;
    transition: animation 0.5s ease;

  }

  .OFF{
    animation: none;
    transition: animation 0.5s ease; 
  }

  .fan-box > p {
    max-width: 300px;
  }

  .runner{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;

  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>