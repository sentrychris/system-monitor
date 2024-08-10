# System Monitor

A lightweight monitoring dashboard for your server.

## Quick Start

### Requirements

- [psmonitor](https://github.com/sentrychris/psmonitor) (standalone server or full application)

Before you setup this project, you'll need to setup [psmonitor](https://github.com/sentrychris/psutil-websocket-monitor) to provide the data that the dashboard will request and display, you don't need the full application, just the standalone server.

1. Clone the repository
    ```
    git clone git@github.com:sentrychris/system-monitor.git
    ```

2. Install dependencies
    ```
    npm install
    ```

3. Copy `.env.example` to `.env` and configure your environment variables
    ```
    APP_VERSION="v1.0.5-shrouded-arena-6598"              # Set this to whatever you like... Visible in the footer
    VITE_APP_VERSION="v1.0.5-shrouded-arena-6598"         # Set this to whatever you like... Visible in the footer

    VITE_APP_NAME="System Monitor"                        # Visible in the navbar, page headers and the footer

    VITE_API_URL="http://192.168.1.237:4500"              # The URL for the psutil-websocket-monitor server
    VITE_WORKER_URL="http://192.168.1.237:4500"           # The URL for the psutil-websocket-monitor endpoint for fetching a worker
    VITE_WEBSOCKET_URL="ws://192.168.1.237:4500/connect"  # The URL for the psutil-websocket-monitor endpoint for connecting via websocket
    VITE_CONNECTION_TYPE="websocket"                      # "http" for static data, "websocket" for live data
    ```

The application is designed to work with either "static" data served from standard HTTP endpoints, or "live" data served through websocket connections. If you set `VITE_CONNECTION_TYPE` to `websocket`, the dashboard will load with a websocket connection and display live data that updates in real time, if you set the value to `http`, the dashboard will load with data requested from a good old fashioned HTTP request and will not update until you refresh the page.

There is a control switch provided at the top-right on the navbar to toggle the connection type between HTTP (static) and websocket (live).

Enjoy!

---

![image](./screenshot.png)


## License
This software is open-sourced software licensed under the MIT license.
