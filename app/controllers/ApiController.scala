package controllers

import javax.inject._
import java.io.File
import java.nio.file.{Paths, Files}
import java.util.Date
import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.json.Json
import play.api.http.HttpEntity
import akka.util.ByteString
import com.typesafe.config.{Config, ConfigFactory}

@Singleton
class ApiController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  val applicationConf: Config = ConfigFactory.load("application.conf")
  val sharePath = applicationConf.getString("sharePath")

  def getFileList(path: String) = Action {
    implicit request: Request[AnyContent] => {
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
        if (directory.exists && directory.isDirectory) {
          val allItems: Array[File] = directory.listFiles
          val folders: List[JsObject] = allItems.filter(_.isDirectory).toList.map(x => 
            Json.obj(
              "name" -> x.getName(),
              "time" -> x.lastModified
            )
          )
          val files: List[JsObject] = allItems.filter(_.isFile).toList.map(x => 
            Json.obj(
              "name" -> x.getName(),
              "time" -> x.lastModified
            )
          )
          val jsonData: JsObject = Json.obj("empty" -> false, "folders" -> folders, "files" -> files)
          Ok(jsonData)
        } else {
          Ok(Json.obj({"empty" -> true}))
        }
      }
    }
  }
}
