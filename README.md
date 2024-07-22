# Pi Monitor

A lightweight monitoring dashboard for your server, works with [psutil-websocket-monitor](https://github.com/sentrychris/psutil-websocket-monitor).

![image](https://i.imgur.com/kxryKYY.png)

## Setup

1. Clone and setup the [API](https://github.com/sentrychris/pi-monitor-api)
    ```sh
    git clone https://github.com/sentrychris/pi-monitor-api.git
    ```
2. Clone and setup the [Websocket Server](https://github.com/sentrychris/pi-monitor-wss)
    ```sh
    git clone https://github.com/sentrychris/pi-monitor-wss.git
    ```
3. Clone this repository
    ```sh
    git clone https://github.com/sentrychris/pi-monitor-v3.git
    ```

The application is designed to work with either "static" data served from a standard HTTP endpoint, or "realtime" data served through a websocket connection.

Set your environment variables in `.env`:

```sh
VITE_API_URL="http://192.168.1.100:4500"
VITE_WS_URL="ws://192.168.1.100:4500/connect"
VITE_CONNECTION_TYPE="websocket"
```

![image](https://i.imgur.com/RI57qJ2.png)


## License
This software is open-sourced software licensed under the MIT license.
