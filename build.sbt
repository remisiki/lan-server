name := """lan-server"""
organization := "com.remisiki"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.13.8"

resolvers +=  "OpenIMAJ Maven Repo" at "https://maven.openimaj.org"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "5.0.0" % Test
libraryDependencies ++= Seq(
	"org.scalaj" %% "scalaj-http" % "2.4.2",
	"com.typesafe" % "config" % "1.4.2",
	"net.coobird" % "thumbnailator" % "0.4.17",
	"org.bytedeco" % "javacv-platform" % "1.5.7",
	"com.mpatric" % "mp3agic" % "0.9.1",
)

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.remisiki.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.remisiki.binders._"
