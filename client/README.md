# Client Side

This directory contains source code for web browser client side, built with [React.js](https://ja.reactjs.org/).

## Build

```bash
yarn build
```

All image files are placed under `public/assests/` in the root directory (instead of in this directory). Build process will not overwrite things in `public/assests/`.


## Run

```bash
yarn start
```

Default server side port is on `localhost:9000`. Change `package.json` for a different server in development mode:

```json
{
	"proxy": "http://192.168.0.112:8080"
}
```
