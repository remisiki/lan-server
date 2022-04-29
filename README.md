# lan-share

A localhost server to transfer data within a LAN.

Written with [Scala Play Framework](https://www.playframework.com/) and [React.js](https://ja.reactjs.org/).

## Run

The `public/` folder may not contain the latest frontend version, so first build inside `client/`.

```bash
cd client/
yarn build
cd ../
sbt run
```
