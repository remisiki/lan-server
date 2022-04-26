package controllers

import util.util
import javax.inject._
import java.io.File
import java.nio.file.{Paths, Files}
import java.util.Date
import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.http.HttpEntity
import akka.util.ByteString
import com.typesafe.config.{Config, ConfigFactory}
import akka.stream.scaladsl.{FileIO, Source}

@Singleton
class ApiController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  val applicationConf: Config = ConfigFactory.load("application.conf")
  val sharePath = applicationConf.getString("sharePath")

  def getFileList(path: String) = Action {
    implicit request: Request[AnyContent] => {
      // util.getAudioMeta()
      val absolutePath: String = Paths.get(sharePath, path).normalize().toString()
      val topPath: String = Paths.get(sharePath).normalize().toString()
      if (!absolutePath.startsWith(topPath)) {
        Result(
          header = ResponseHeader(403, Map.empty),
          body = HttpEntity.Strict(ByteString("You do not have the permission to visit this directory."), Some("text/plain"))
        )
      }
      else {
        val directory: File = new File(absolutePath)
        val imagePath: String = Paths.get(absolutePath, "public").normalize().toString()
        if (directory.exists && directory.isDirectory) {
          val allItems: Array[File] = directory.listFiles
          val folders: List[JsObject] = allItems.filter(_.isDirectory).toList.map(x => 
            Json.obj(
              "name" -> x.getName(),
              "time" -> x.lastModified
            )
          )
          val files: List[JsObject] = allItems.filter(_.isFile).toList.map(x => {
            val fileName: String = x.getName()
            val fileType: String = util.getFileType(fileName)
            Json.obj(
              "name" -> fileName,
              "time" -> x.lastModified,
              "fileType" -> fileType,
              "size" -> x.length,
              "thumb" -> {
                if (util.fileHasThumb(fileType))
                  util.encodeBase64(x.getAbsolutePath())
                else
                  false
              }
            )
          })
          val jsonData: JsObject = Json.obj("empty" -> false, "folders" -> folders, "files" -> files)
          Ok(jsonData)
        } else {
          Ok(Json.obj({"empty" -> true}))
        }
      }
    }
  }

  def getThumbnail(path: String) = Action {
    implicit request: Request[AnyContent] => {
      val filePath: String = util.decodeBase64(path)
      val tmpPath: String = Paths.get(System.getProperty("java.io.tmpdir"), ".com.remisiki.lan.server", "thumnail").toString()
      Files.createDirectories(Paths.get(tmpPath))
      val cacheFilePath: String = util.generateThumbnail(filePath, tmpPath)
      val image: File = new File(cacheFilePath)
      if (!image.exists()) {
        NotFound("Thumbnail Not Found")
      }
      else {
        val source: Source[ByteString, _] = FileIO.fromPath(Paths.get(cacheFilePath))
        Result(
          header = ResponseHeader(200, Map()),
          body = HttpEntity.Streamed(source, Some(image.length()), Some("image/jpeg"))
        )
      }
    }
  }
}
