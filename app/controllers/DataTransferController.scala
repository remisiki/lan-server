package controllers

import util.util
import javax.inject._
import java.io.{File, FileOutputStream}
import java.nio.file.{Paths, Files}
import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.http.HttpEntity
import akka.stream.scaladsl.{FileIO, Source}
import akka.util.ByteString
import scala.concurrent.ExecutionContext
import scala.util.matching.Regex
import com.typesafe.config.{Config, ConfigFactory}

@Singleton
class DataTransferController @Inject()(val controllerComponents: ControllerComponents)(implicit ec: ExecutionContext) extends BaseController {

  val applicationConf: Config = ConfigFactory.load("application.conf")
  val sharePath = applicationConf.getString("sharePath")

  def downloadFile(base64: String) = Action {
    implicit request: Request[AnyContent] => {
      val uriDecoded: String = util.decodeBase64(base64)
      val absolutePath: String = Paths.get(sharePath, uriDecoded).normalize().toString()
      val topPath: String = Paths.get(sharePath).normalize().toString()
      if (!absolutePath.startsWith(topPath)) {
        Result(
          header = ResponseHeader(403, Map.empty),
          body = HttpEntity.Strict(ByteString("You do not have the permission to visit this directory."), Some("text/plain"))
        )
      }
      else {
        val file: File = new File(absolutePath)
        val uriEncodedFileName: String = util.encodeUri(file.getName())
        val source: Source[ByteString, _] = FileIO.fromFile(file)
        val mimeTypes = Map(
          ".txt" -> "text/plain",
          ".html" -> "text/html",
          ".js" -> "text/javascript",
          ".css" -> "text/css",
          ".csv" -> "text/csv",
          ".xml" -> "text/xml",
          ".json" -> "application/json",
          ".png" -> "image/png",
          ".jpg" -> "image/jpeg",
          ".jpe" -> "image/jpeg",
          ".jpeg" -> "image/jpeg",
          ".gif" -> "image/gif",
          ".bmp" -> "image/bmp",
          ".svg" -> "image/svg+xml",
          ".tiff" -> "image/tiff",
          ".wav" -> "audio/wav",
          ".mp3" -> "audio/mpeg",
          ".mid" -> "audio/midi",
          ".midi" -> "audio/midi",
          ".mp4" -> "video/mp4",
          ".avi" -> "video/avi",
          ".3gp" -> "video/3gp",
          ".woff" -> "application/font-woff",
          ".ttf" -> "application/font-ttf",
          ".eot" -> "application/vnd.ms-fontobject",
          ".otf" -> "application/font-otf",
          ".wasm" -> "application/wasm",
          ".pdf" -> "application/pdf",
          ".zip" -> "application/zip",
          ".tar" -> "application/x-tar",
          ".tar.gz" -> "application/x-tar"
        )
        val ext: String = util.getExt(absolutePath)
        val contentType: String = mimeTypes getOrElse(ext, "application/octet-stream")
        Result(
          header = ResponseHeader(200, Map(
            CONTENT_DISPOSITION -> s"attachment; filename=${uriEncodedFileName}"
          )),
          body = HttpEntity.Streamed(source, Some(file.length()), Some(contentType))
        )
      }
    }
  }

  def uploadFile() = Action {
    implicit request: Request[AnyContent] => {
      val formData = request.body.asMultipartFormData.get
      if (formData.badParts.length > 0) {
        Ok(Json.obj({"error" -> true}))
      }
      else if ((formData.files != None) && (formData.files.length > 0)) {
        val uploadDone: Boolean = (formData.dataParts.getOrElse("done", Seq("true"))(0) == "true")
        val base64: String = formData.dataParts.getOrElse("name", Seq("TmV3JTIwRmlsZQ=="))(0)
        val fileName: String = util.decodeBase64(base64)
        var publicPath: String = s"${sharePath}public/"
        var filePath = s"${publicPath}${fileName}"
        val progressFilePath = s"${publicPath}${fileName}.scupload"
        val file = formData.files(0).ref
        val progressFile = new File(progressFilePath)
        if (!progressFile.exists()) {
          file.moveTo(Paths.get(progressFilePath), replace = true)
        }
        else {
          val byteArray: Array[Byte] = Files.readAllBytes(file)
          val outputFile = new FileOutputStream(progressFilePath, true)
          outputFile.write(byteArray)
          outputFile.close()
        }
        if (uploadDone) {
          var newFileName: String = fileName
          var ext: String = ""
          var fileBaseName: String = ""
          var renameCount: Int = 1
          val dotPosition = newFileName.lastIndexOf(".")
          if (dotPosition > 0) {
            ext = newFileName.substring(dotPosition, newFileName.length)
            fileBaseName = newFileName.substring(0, dotPosition)
          }
          while (!progressFile.renameTo(new File(filePath))) {
            filePath = s"${publicPath}${fileBaseName}_${renameCount}${ext}"
            renameCount += 1;
          }
        }
        Ok(Json.obj({"error" -> false}))
      }
      else {
        Ok(Json.obj({"error" -> true}))
      }
    }
  }

}
