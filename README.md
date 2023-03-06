# Pi Monitor

A lightweight monitor for your raspberry pi, works with the [API](https://github.com/chrisrowles/pi-monitor-api) and the [Websocket Server](https://github.com/chrisrowles/pi-monitor-wss).

![image](https://i.imgur.com/PNIYBTk.png)

## Getting Started

1. Clone and setup the [API](https://github.com/chrisrowles/pi-monitor-api)
    ```sh
    git clone https://github.com/chrisrowles/pi-monitor-api.git
    ```
2. Clone and setup the [Websocket Server](https://github.com/chrisrowles/pi-monitor-wss)
    ```sh
    git clone https://github.com/chrisrowles/pi-monitor-wss.git
    ```
3. Clone this repository
    ```sh
    git clone https://github.com/chrisrowles/pi-monitor-v3.git
    ```

The application is designed to work with either "static" data served from a standard HTTP endpoint to a typical API, or "realtime" data served through a websocket connection to a [tornado](https://www.tornadoweb.org/en/stable/) server.

Set your environment variables in `.env`:

```sh
VITE_API_URL="http://192.168.1.100:8080"
VITE_WS_URL="ws://192.168.1.100:4200/ws"
VITE_CONNECTION_TYPE="websocket"
```

- `VITE_API_URL`: The URL to the API you set up in step one, if you used the apache configuration from the docs then you can use a local domain, if you're running the api directly through Python then you can use the ip/port.
- `VITE_WS_URL`: The URL to the websocket server
- `VITE_CONNECTION_TYPE`: If you set this to `http`, the websocket server will not be used, instead the dashboard will be displayed with "static" data from the API. If you set this to `websocket`, then the websocket server will be used and you will see live data updating in realtime. In any case the API is always used, if you are using the websocket server for realtime data, then the API will act as an initialiser/fallback.

## Contributing

Feel free to contribute to this project, or the [Pi Monitor Websocket Server](https://github.com/chrisrowles/pi-monitor-wss), or the [Pi Monitor API](https://github.com/chrisrowles/pi-monitor-api).

I'm alaways looking for help and new ideas, this is a fun personal project and so if you're a bit new of a bit anxious about contributing to projects, then please feel free to get in tocuh with me and we'll find a way to get you started, we all start somewhere! :)


## License
This software is open-sourced software licensed under the MIT license.
