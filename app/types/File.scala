package types

import scala.util.matching.Regex
import java.nio.file.{Path, Paths, Files}
import java.util.stream.Stream
import play.api.libs.json._
import com.typesafe.config.{Config, ConfigFactory}

class File(path: String) extends java.io.File(path) {
	private val size: Long = this.length.toLong

	def this(file: java.io.File) = this(file.getAbsolutePath())

	def getSize(): Long = this.size

	def getTime(): Long = this.lastModified

	def getMetaData(): JsObject = {
		val jsonData: JsObject = Json.obj(
			"size" -> this.size,
			"time" -> this.lastModified,
		)
		jsonData
	}
}

object File {
	private val extensionPattern: Regex = "(\\.[^.]+)$".r
	private val imageExt: Array[String] = Array(".jpe", ".jpeg", ".jpg", ".png", ".bmp", ".gif", ".tiff", ".ico", ".svg", ".webp")
	private val videoExt: Array[String] = Array(".mp4", ".avi", ".flv", ".m4v", ".mkv", ".wmv", ".vob", ".mpg", ".mpeg", ".mpe", ".mov", ".3gp")
	private val audioExt: Array[String] = Array(".mp3", ".m4a", ".aac", ".flac", ".ogg", ".voc", ".wav", ".wma")
	private val codeExt: Array[String] = Array(".c", ".cpp", ".h", ".hpp", ".java", ".jar", ".dll", ".so", ".class", ".scala", ".py", ".pyc", ".pyd", ".asm", ".s", ".v", ".sv", ".svh", ".js", ".jsx", ".jsp", ".ts", ".tsx", ".html", ".htm", ".css", ".scss", ".json", ".csv", ".tsv", ".mtx", ".db", ".sql", ".sqlite3", ".bat", ".sh", ".ps1", ".inf", ".ini", ".inl", ".conf", ".xml", ".pas", ".sbl", ".php", ".dat", ".log", ".lock", ".cgi", ".pl", ".asp", ".aspx", ".rss", ".xhtml", ".swift", ".vb", ".bak", ".cfg", ".cab", ".dmp", ".sys", ".cmd", ".cs", ".csx", ".cmake", ".cob", ".clj", ".coffee", ".lisp", ".cu", ".pyx", ".elm", ".erl", ".fs", ".f77", ".go", ".hs", ".hsc", ".ipynb", ".kt", ".lua", ".mak", ".m", ".r", ".rb", ".rs", ".sbt", ".bash", ".tex", ".bib", ".vhdl", ".vue", ".yml", ".yaml", ".md", ".rst")
	private val previewableExt: Array[String] = this.imageExt ++ Array(".mp4", ".mp3", ".pdf")
	private val extensionMap: Map[String, String] = {
		var map: Map[String, String] = Map.empty
		for (key <- imageExt) {
			map += (key -> "image")
		}
		for (key <- videoExt) {
			map += (key -> "video")
		}
		for (key <- audioExt) {
			map += (key -> "audio")
		}
		for (key <- codeExt) {
			map += (key -> "code")
		}
		map ++= Seq(
			".exe" -> "binary",
			".msi" -> "binary",
			".bin" -> "binary",
			".apk" -> "binary",
			".dmg" -> "binary",
			".deb" -> "binary",
			".rpm" -> "binary",
			".pdf" -> "pdf",
			".zip" -> "archieve",
			".gz" -> "archieve",
			".tar" -> "archieve",
			".rar" -> "archieve",
			".7z" -> "archieve",
			".doc" -> "msword",
			".docx" -> "msword",
			".docm" -> "msword",
			".ppt" -> "mspowerpoint",
			".pptx" -> "mspowerpoint",
			".pptm" -> "mspowerpoint",
			".xls" -> "msexcel",
			".xlsx" -> "msexcel",
			".xlsm" -> "msexcel",
		)
		map
	}
	private val thumbableType: Array[String] = Array("image", "video", "audio")
	private val mimeTypes: Map[String, String] = Map(
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

	private val applicationConf: Config = ConfigFactory.load("application.conf")
	private val sharePath = applicationConf.getString("sharePath")

	def getExt(fileName: String): String = {
		this.extensionPattern.findFirstMatchIn(fileName).getOrElse("").toString().toLowerCase()
	}

	def isImage(fileName: String): Boolean = {
		val ext: String = this.getExt(fileName)
		this.imageExt.contains(ext)
	}

	def isVideo(fileName: String): Boolean = {
		val ext: String = this.getExt(fileName)
		this.videoExt.contains(ext)
	}

	def isAudio(fileName: String): Boolean = {
		val ext: String = this.getExt(fileName)
		this.audioExt.contains(ext)
	}

	def isCode(fileName: String): Boolean = {
		val ext: String = this.getExt(fileName)
		this.codeExt.contains(ext)
	}

	def isPreviewable(fileName: String): Boolean = {
		val ext: String = this.getExt(fileName)
		this.previewableExt.contains(ext)
	}

	def getFileType(fileName: String): String = {
		val ext: String = this.getExt(fileName)
		this.extensionMap.getOrElse(ext, "file")
	}

	def fileHasThumb(fileType: String): Boolean = {
		this.thumbableType.contains(fileType)
	}

	def findFilesByName(path: String, fileName: String): Array[Object] = {
		var result: Array[Object] = Array.empty
		try {
			val pathStream: Stream[Path] = Files.find(
				Paths.get(path),
				Integer.MAX_VALUE,
				(p, _) => {
					this.isParent(path, p.getParent().toString()) &&
					p.toFile().isFile() &&
					p
						.getFileName()
						.toString()
						.toLowerCase()
						.contains(fileName.toLowerCase())
				}
			)
			result = pathStream.toArray()
		} catch {
			case _: Exception => ()
		}
		result
	}

	def getMimeType(fileName: String): String = {
		val ext: String = this.getExt(fileName)
		mimeTypes.getOrElse(ext, "application/octet-stream")
	}

	def getLines(fileName: String): Int = {
		val file = new java.io.File(fileName)
		val src = scala.io.Source.fromFile(file)
		try {
			src.getLines().size
		} catch {
			case e: Exception => -1
		}
	}

	def getMetaData(fileName: String): JsObject = {
		val file = new File(fileName)
		if (!(file.exists() && file.isFile())) {
			Json.obj("error" -> true)
		}
		else {
			if (this.isImage(fileName)) {
				val image = new Image(fileName)
				image.getMetaData()
			}
			else if (this.isVideo(fileName)) {
				val video = new Video(fileName)
				video.getMetaData()
			}
			else if (this.isAudio(fileName)) {
				val audio = new Audio(fileName)
				audio.getMetaData()
			}
			else if (this.isCode(fileName)) {
				val code = new Code(fileName)
				code.getMetaData()
			}
			else {
				file.getMetaData()
			}
		}
	}

	def translatePath(path: String): String = {
		path.replace("\\", "/")
	}

	def getRelativePath(path: String, rootPath: String): String = {
		val translatedPath: String = this.translatePath(path)
		val translatedRootPath: String = this.translatePath(rootPath)
		translatedPath.replace(translatedRootPath, "")
	}

	def isParent(parentPath: String, childPath: String): Boolean = {
		val translatedParentPath: String = this.translatePath(parentPath)
		val translatedChildPath: String = this.translatePath(childPath)
		translatedChildPath.startsWith(translatedParentPath)
	}

	def isSharePath(path: String): Boolean = {
		val translatedPath: String = this.translatePath(path)
		val translatedRootPath: String = this.translatePath(Paths.get(this.sharePath).normalize().toString())
		translatedPath.startsWith(translatedRootPath)
	}

	def getRootPath(): Array[String] = {
		java.io.File.listRoots().map(_.getAbsolutePath())
	}
}