name := """lan-share"""
organization := "com.remisiki"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.13.8"

resolvers += "OpenIMAJ Maven Repo" at "https://maven.openimaj.org"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "5.0.0" % Test
libraryDependencies ++= Seq(
	"org.scalaj" %% "scalaj-http" % "2.4.2",
	"com.typesafe" % "config" % "1.4.2",
	"net.coobird" % "thumbnailator" % "0.4.17",
	// "org.bytedeco" % "javacv-platform" % "1.5.7",
	"com.mpatric" % "mp3agic" % "0.9.1",
	"org.jcodec" % "jcodec" % "0.2.5",
	"org.jcodec" % "jcodec-javase" % "0.2.5",
)

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.remisiki.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.remisiki.binders._"
assembly / mainClass := Some("play.core.server.ProdServerStart")
assembly / fullClasspath += Attributed.blank(PlayKeys.playPackageAssets.value)
assembly / test := {}

assembly / assemblyMergeStrategy := {
	case r if r.startsWith("reference.conf")          => MergeStrategy.concat
	case manifest if manifest.contains("MANIFEST.MF") =>
		// We don't need manifest files since sbt-assembly will create
		// one with the given settings
		MergeStrategy.discard
	case referenceOverrides if referenceOverrides.contains("reference-overrides.conf") =>
		// Keep the content for all reference-overrides.conf files
		MergeStrategy.concat
	case PathList("META-INF", xs @ _*) => MergeStrategy.discard
	case x => MergeStrategy.first
	// case x =>
	// 	// For all the other files, use the default sbt-assembly merge strategy
	// 	val oldStrategy = (assemblyMergeStrategy in assembly).value
	// 	oldStrategy(x)
}