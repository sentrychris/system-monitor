<p align="center">
  <img src="./logo.svg" alt="Vigil" width="120" />
</p>

<h1 align="center">Vigil</h1>

<p align="center">A lightweight monitoring dashboard for your server.</p>

<p align="center">View a <a href="https://status.edcs.app">live example here</a>.</p>

![image](./README.png)

## Quick Start

### Requirements

- [vigil-collector](https://github.com/sentrychris/vigil-collector)

After downloading and running vigil-collector, proceed with the setup.

1. Clone the repository

   ```
   git clone git@github.com:sentrychris/vigil.git
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your environment variables

   ```
   VITE_APP_NAME="Vigil"                                 # Visible in the navbar, above page title
   VITE_APP_TITLE="Metric & Monitoring"                  # Visible in the navbar, page title

   VITE_APP_DEPLOY_REGION=us-central1-a                  # (optional) visible in the footer
   VITE_APP_DEPLOY_INSTANCE=chris-web1                   # (optional) visible in the footer

   VITE_API_URL="http://192.168.1.237:4500"              # URL for vigil-collector
   VITE_WORKER_URL="http://192.168.1.237:4500/worker"    # URL for vigil-collector's endpoint for creating a new websocket connection
   VITE_WEBSOCKET_URL="ws://192.168.1.237:4500/connect"  # URL for vigil-collector's endpoint for connecting to the websocket
   VITE_CONNECTION_TYPE="websocket"                      # Set to "http" for static data, "websocket" for live data
   ```

The application is designed to work with either static data served from standard HTTP endpoints, or live data served through websocket connections.

- If you set `VITE_CONNECTION_TYPE` to `websocket`, the dashboard will load with a websocket connection configured and will display live data that updates in real time.

- If you set `VITE_CONNECTION_TYPE` to `http`, the dashboard will load with data requested from an HTTP endpoint and will poll for updates every 30 seconds.

There is a control switch provided at the top-right on the navbar to toggle the connection type between HTTP and Websocket.

I hope you find this project useful, if you have any questions or feedback, please feel free to raise an [issue here](https://github.com/sentrychris/vigil/issues).

## License

MIT.
