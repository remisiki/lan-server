# lan-share

A localhost server to transfer data within a LAN.

Written with [Scala Play Framework](https://www.playframework.com/) and [React.js](https://ja.reactjs.org/).

## Usage

### sbt

The `public/` folder may not contain the latest frontend version, so first build inside `client/`.

```shell
# cd client/
# yarn build
# cd ../
sbt run
```

To run in production mode:

```shell
sbt runProd
```

Configurations may be modified in `conf/application.conf`.

```apacheconf
# Custom Config

# For production mode only
play.server.http.port = 9000
play.server.http.port = ${?PLAY_HTTP_PORT}

# Basic share path
sharePath = "/home/setsunayyw/Documents"
sharePath = ${?LAN_SHARE_PATH}

# Extra path that will show up when logged in as admin, 
# can specify displaying name by changing `alias`. 
# The value of `extraPath` can either be a list of config 
# objects, or a JSON-like string.
extraPath = [
  {
    path = "/home/setsunayyw/Downloads",
    alias = "downloads"
  },
]
extraPath = ${?LAN_SHARE_EXTRA_PATH}

# The admin password
app.user.admin.key = "my_new_admin_key"
app.user.admin.key = ${?ADMIN_KEY}
```

Or set environment properties in sbt:

```scala
eval System.setProperty("PLAY_HTTP_PORT", "8000")
eval System.setProperty("ADMIN_KEY", "another_key")
eval System.setProperty("LAN_SHARE_PATH", "/home/user/Videos")
eval System.setProperty("LAN_SHARE_EXTRA_PATH", """[{"path":"/","alias":"root"},{"path":"/home/","alias":"home"}]""")
```

### Fat JAR

No scala environment is required to run the fat jar. JDK 8 should be installed, other versions of Java may also work but not tested.

```shell
java -DPLAY_HTTP_PORT=1234 -DADMIN_KEY='hogehoge' -DLAN_SHARE_PATH='C:/Users/user/Documents' -DLAN_SHARE_EXTRA_PATH='"""[{""""path"""":""""E:/game"""",""""alias"""":""""game""""}]"""' -jar lan-share-assembly-1.0-SNAPSHOT.jar
```

## Cache

To clear image thumbnail cache, clear `.com.remisiki.lan.share/thumbnail/` under the system temp directory.