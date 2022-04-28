package controllers

import util.Codec
import types.{Media}
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

	def getFileList(path: String, search: String) = Action {
		implicit request: Request[AnyContent] => {
			val absolutePath: String = Paths.get(this.sharePath, path).normalize().toString()
			val topPath: String = Paths.get(this.sharePath).normalize().toString()
			if (!absolutePath.startsWith(topPath)) {
				Result(
					header = ResponseHeader(403, Map.empty),
					body = HttpEntity.Strict(ByteString("You do not have the permission to visit this directory."), Some("text/plain"))
				)
			}
			else if (search != null) {
				val uriDecoded: String = Codec.decodeUri(search)
				val searchResult: List[File] = types.File
					.findFilesByName(absolutePath, uriDecoded)
					.toList
					.map(x => new File(x.toString()))
				val jsonData: JsObject = this.parseFileInfo(searchResult)
				Ok(jsonData)
			}
			else {
				val directory: File = new File(absolutePath)
				val imagePath: String = Paths.get(absolutePath, "public").normalize().toString()
				if (directory.exists && directory.isDirectory) {
					val fileList: Array[File] = directory.listFiles
					val jsonData: JsObject = this.parseFileInfo(fileList)
					Ok(jsonData)
				} else {
					Ok(Json.obj({"empty" -> true}))
				}
			}
		}
	}

	def getThumbnail(path: String) = Action {
		implicit request: Request[AnyContent] => {
			val filePath: String = Codec.decodeBase64(path)
			val tmpPath: String = Paths.get(System.getProperty("java.io.tmpdir"), ".com.remisiki.lan.server", "thumnail").toString()
			Files.createDirectories(Paths.get(tmpPath))
			val cacheFilePath: String = Media.generateThumbnail(filePath, tmpPath)
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

	private def parseFolder(x: File): JsObject = {
		Json.obj(
			"name" -> x.getName(),
			"time" -> x.lastModified
		)
	}

	private def parseFile(x: File): JsObject = {
		val relativePath: String = types.File.getRelativePath(x.getAbsolutePath(), this.sharePath)
		val fileName: String = x.getName()
		val fileType: String = types.File.getFileType(fileName)
		Json.obj(
			"name" -> fileName,
			"time" -> x.lastModified,
			"fileType" -> fileType,
			"size" -> x.length,
			"thumb" -> {
				if (types.File.fileHasThumb(fileType))
					Codec.encodeBase64(x.getAbsolutePath())
				else
					false
			},
			"path" -> Codec.encodeUri(relativePath)
		)
	}

	def parseFileInfo(resultList: List[File]): JsObject = {
		val folders: List[JsObject] = resultList
			.filter(_.isDirectory)
			.toList
			.map(this.parseFolder)
		val files: List[JsObject] = resultList
			.filter(_.isFile)
			.map(this.parseFile)
		val jsonData: JsObject = Json.obj("empty" -> (files.isEmpty && folders.isEmpty), "folders" -> folders, "files" -> files)
		jsonData
	}

	def parseFileInfo(resultList: Array[File]): JsObject = {
		val folders: List[JsObject] = resultList
			.filter(_.isDirectory)
			.toList
			.map(this.parseFolder)
		val files: List[JsObject] = resultList
			.filter(_.isFile)
			.toList
			.map(this.parseFile)
		val jsonData: JsObject = Json.obj("empty" -> (files.isEmpty && folders.isEmpty), "folders" -> folders, "files" -> files)
		jsonData
	}
}
