package controllers

import util.Codec
import user.Admin
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
import types.Audio

@Singleton
class ApiController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

	private val applicationConf: Config = ConfigFactory.load("application.conf")
	private val sharePath = applicationConf.getString("sharePath")

	def getFileList(path: String, search: String) = Action {
		implicit request: Request[AnyContent] => {
			val isAdmin: Boolean = Admin.verifyCookie(request.cookies)
			val absolutePath: String = Admin.getRealPath(path, isAdmin)
			if (!isAdmin && !types.File.isSharePath(absolutePath)) {
				Forbidden("")
			}
			else if (isAdmin && path == "/") {
				val rootPaths: Array[String] = types.File.getRootPath()
				val jsonData: JsObject = {
					var folders: Array[JsObject] = Array(
						Json.obj(
							"name" -> this.sharePath,
							"time" -> 0,
							"alias" -> "share"
						)
					)
					for (path <- rootPaths) {
						folders = folders :+ Json.obj(
							"name" -> path.replace("\\", ""),
							"time" -> 0
						)
					}
					Json.obj("empty" -> folders.isEmpty, "folders" -> folders)
				}
				Ok(jsonData)
			}
			else if (search != null) {
				val uriDecoded: String = Codec.decodeUri(search)
				val searchResult: List[File] = types.File
					.findFilesByName(absolutePath, uriDecoded)
					.toList
					.map(x => new File(x.toString()))
				val jsonData: JsObject = this.parseFileInfo(searchResult, isAdmin)
				Ok(jsonData)
			}
			else {
				val directory: File = new File(absolutePath)
				if (directory.exists() && directory.isDirectory()) {
					val fileList: Array[File] = directory.listFiles
					val jsonData: JsObject = this.parseFileInfo(fileList, isAdmin)
					Ok(jsonData)
				} else {
					NotFound("")
				}
			}
		}
	}

	def getThumbnail(path: String) = Action {
		implicit request: Request[AnyContent] => {
			val isAdmin: Boolean = Admin.verifyCookie(request.cookies)
			val filePath: String = Admin.getRealPath(Codec.decodeBase64(path), isAdmin)
			val tmpPath: String = Paths.get(System.getProperty("java.io.tmpdir"), ".com.remisiki.lan.server", "thumnail").toString()
			Files.createDirectories(Paths.get(tmpPath))
			val cacheFilePath: String = {
				if (types.File.isParent(tmpPath, filePath)) {
					filePath
				}
				else {
					Media.generateThumbnail(filePath, tmpPath)
				}
			}
			if (cacheFilePath == null) {
				NotFound("Thumbnail Not Found")
			}
			else {
				val image: File = new File(cacheFilePath)
				val source: Source[ByteString, _] = FileIO.fromPath(Paths.get(cacheFilePath))
				Result(
					header = ResponseHeader(200, Map()),
					body = HttpEntity.Streamed(source, Some(image.length()), Some("image/jpeg"))
				)
			}
		}
	}

	def getMetaData(path: String) = Action {
		implicit request: Request[AnyContent] => {
			val isAdmin: Boolean = Admin.verifyCookie(request.cookies)
			val filePath: String = Codec.decodeBase64(path)
			val absolutePath: String = Admin.getRealPath(filePath, isAdmin)
			val jsonData: JsObject = types.File.getMetaData(absolutePath)
			Ok(jsonData)
		}
	}

	def checkAdmin() = Action {
		implicit request: Request[AnyContent] => {
			val jsonData: JsObject = Json.obj(
				"admin" -> Admin.verifyCookie(request.cookies)
			)
			Ok(jsonData)
		}
	}

	def test() = Action {
		implicit request: Request[AnyContent] => {
			// println(types.File.getMetaData("./app/controllers/ApiController.scala"))
			// Admin.getRootPath().foreach(println)
			
			// println(Admin.verifyCookie(request.cookies))
			// types.File.findFilesByName("D:/Scala/lan-share/app", "a.txt").foreach(println)
			println(types.File.getMetaData("a.jpg"))
			Ok("")
		}
	}

	private def parseFolder(x: File): JsObject = {
		Json.obj(
			"name" -> x.getName(),
			"time" -> x.lastModified
		)
	}

	private def parseFile(x: File, isAdmin: Boolean): JsObject = {
		val thumbPath: String = {
			if (isAdmin) {
				types.File.translatePath(x.getAbsolutePath())
			}
			else {
				types.File.getRelativePath(x.getAbsolutePath(), this.sharePath)
			}
		}
		val fileName: String = x.getName()
		val fileType: String = types.File.getFileType(fileName)
		Json.obj(
			"name" -> fileName,
			"time" -> x.lastModified,
			"fileType" -> fileType,
			"size" -> x.length,
			"thumb" -> {
				if (types.File.fileHasThumb(fileType))
					Codec.encodeBase64(thumbPath)
				else
					false
			},
			"path" -> Codec.encodeUri(thumbPath.replace(fileName, ""))
		)
	}

	def parseFileInfo(resultList: List[File], isAdmin: Boolean): JsObject = {
		val folders: List[JsObject] = resultList
			.filter(_.isDirectory)
			.toList
			.map(this.parseFolder)
		val files: List[JsObject] = resultList
			.filter(_.isFile)
			.map(x => this.parseFile(x, isAdmin))
		val jsonData: JsObject = Json.obj("empty" -> (files.isEmpty && folders.isEmpty), "folders" -> folders, "files" -> files)
		jsonData
	}

	def parseFileInfo(resultList: Array[File], isAdmin: Boolean): JsObject = {
		val folders: List[JsObject] = resultList
			.filter(_.isDirectory)
			.toList
			.map(this.parseFolder)
		val files: List[JsObject] = resultList
			.filter(_.isFile)
			.toList
			.map(x => this.parseFile(x, isAdmin))
		val jsonData: JsObject = Json.obj("empty" -> (files.isEmpty && folders.isEmpty), "folders" -> folders, "files" -> files)
		jsonData
	}
}
