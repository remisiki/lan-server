package util

import java.security.MessageDigest
import java.math.BigInteger
import java.io.File
import java.nio.file.{Path, Paths, Files}
import java.util.Base64
import java.nio.charset.StandardCharsets
import java.net.{URLEncoder, URLDecoder}
import java.util.stream.Stream;
import scala.util.matching.Regex
import net.coobird.thumbnailator.Thumbnails

import org.bytedeco.javacv.{FFmpegFrameGrabber, Java2DFrameConverter, Frame}
import javax.imageio.ImageIO
import java.awt.image.BufferedImage

import com.mpatric.mp3agic.Mp3File

package object util {

	val extensionPattern: Regex = "(\\.[^.]+)$".r
	val imageExt: Array[String] = Array(".jpe", ".jpeg", ".jpg", ".png", ".bmp", ".gif", ".tiff", ".ico", ".svg")
	val videoExt: Array[String] = Array(".mp4", ".avi", ".flv", ".m4v", ".mkv", ".wmv", ".vob", ".mpg", ".mpeg", ".mpe", ".mov", ".3gp")
	val audioExt: Array[String] = Array(".mp3", ".m4a", ".aac", ".flac", ".ogg", ".voc", ".wav", ".wma")
	val codeExt: Array[String] = Array(".c", ".cpp", ".h", ".hpp", ".java", ".jar", ".dll", ".so", ".class", ".scala", ".py", ".pyc", ".pyd", ".asm", ".s", ".v", ".sv", ".svh", ".js", ".jsx", ".jsp", ".ts", ".tsx", ".html", ".htm", ".css", ".scss", ".json", ".csv", ".tsv", ".mtx", ".db", ".sql", ".sqlite3", ".bat", ".sh", ".ps1", ".inf", ".ini", ".inl", ".conf", ".xml", ".pas", ".sbl", ".php", ".dat", ".log", ".lock", ".cgi", ".pl", ".asp", ".aspx", ".rss", ".xhtml", ".swift", ".vb", ".bak", ".cfg", ".cab", ".dmp", ".sys", ".cmd", ".cs", ".csx", ".cmake", ".cob", ".clj", ".coffee", ".lisp", ".cu", ".pyx", ".elm", ".erl", ".fs", ".f77", ".go", ".hs", ".hsc", ".ipynb", ".kt", ".lua", ".mak", ".m", ".r", ".rb", ".rs", ".sbt", ".bash", ".tex", ".bib", ".vhdl", ".vue", ".yml", ".yaml", ".md", ".rst")
	val extensionMap: Map[String, String] = {
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
	val thumbableType: Array[String] = Array("image", "video")

	def getMessageDigest(s: String): String = {
		val byteArray: Array[Byte] = s.getBytes("UTF-8")
		val md5 = MessageDigest.getInstance("MD5")
		val digest = md5.digest(byteArray)
		new BigInteger(1, digest).toString(16)
	}

	def generateThumbnail(filePath: String, outputPath: String): String = {
		val file: File = new File(filePath)
		val cacheFileName: String = getMessageDigest(s"${filePath}${file.lastModified}") + ".jpg"
		val cacheFilePath: String = Paths.get(outputPath, cacheFileName).toString()
		val cacheFile: File = new File(cacheFilePath)
		val fileType: String = this.getFileType(filePath)
		if (!cacheFile.exists()) {
			fileType match {
				case "image" => {
					try {
						Thumbnails.of(file)
							.size(640, 480)
							.outputFormat("jpg")
							.toFile(cacheFilePath)
						cacheFilePath
					} catch {
						case e: Exception => ""
					}
				}
				case "video" => {
					val videoCaptured: Boolean = this.screenshotVideo(file, cacheFilePath)
					if (!videoCaptured)
						""
					else
						try {
							Thumbnails.of(cacheFilePath)
								.size(640, 480)
								.outputFormat("jpg")
								.toFile(cacheFilePath)
							cacheFilePath
						} catch {
							case e: Exception => ""
						}
				} 
				case _ => {
					""
				}
			}
		}
		else {
			cacheFilePath
		}
	}

	def isImage(fileName: String): Boolean = {
		val ext: String = getExt(fileName)
		this.imageExt.contains(ext)
	}

	def isVideo(fileName: String): Boolean = {
		val ext: String = getExt(fileName)
		this.videoExt.contains(ext)
	}

	def isAudio(fileName: String): Boolean = {
		val ext: String = getExt(fileName)
		this.videoExt.contains(ext)
	}

	def getFileType(fileName: String): String = {
		val ext: String = getExt(fileName)
		this.extensionMap.getOrElse(ext, "file")
	}

	def fileHasThumb(fileType: String): Boolean = {
		this.thumbableType.contains(fileType)
	}

	def getExt(fileName: String): String = {
		this.extensionPattern.findFirstMatchIn(fileName).getOrElse("").toString().toLowerCase()
	}

	def decodeBase64(base64: String): String = {
		val base64Decoded: Array[Byte] = Base64.getDecoder().decode(base64)
		val strDecoded: String = new String(base64Decoded, StandardCharsets.UTF_8)
		decodeUri(strDecoded)
	}

	def encodeBase64(s: String): String = {
		val uriEncoded: String = encodeUri(s)
		val base64ByteString: Array[Byte] = Base64.getEncoder().encode(uriEncoded.getBytes(StandardCharsets.UTF_8))
		new String(base64ByteString, StandardCharsets.UTF_8)
	}

	def encodeUri(uri: String): String = {
		URLEncoder.encode(uri, StandardCharsets.UTF_8).replace("+", "%20")
	}

	def decodeUri(str: String): String = {
		URLDecoder.decode(str, StandardCharsets.UTF_8)
	}

	def screenshotVideo(file: File, cacheFilePath: String): Boolean = {
		try {
			val frameGrabber: FFmpegFrameGrabber = new FFmpegFrameGrabber(file)
			frameGrabber.start()
			val frameLength: Int = frameGrabber.getLengthInFrames()
			frameGrabber.setFrameNumber(java.lang.Math.round(frameLength * 0.1).toInt)
			val aa: Java2DFrameConverter = new Java2DFrameConverter()
			val f: Frame = frameGrabber.grabKeyFrame()
			val bi: BufferedImage = aa.convert(f)
			ImageIO.write(bi, "jpg", new File(cacheFilePath))
			frameGrabber.stop()
			true
		} catch {
			case e: Exception => {
				println(e)
				false
			}
		}
	}

	def getAudioMeta() = {
		val file: Mp3File = new Mp3File("")
		if (file.hasId3v2Tag()) {
			val id3v2Tag = file.getId3v2Tag()
			println(file.getLengthInSeconds())
			val imageData: Array[Byte] = id3v2Tag.getAlbumImage()
			println(imageData)
			if (imageData != null) {
				val mimeType: String = id3v2Tag.getAlbumImageMimeType()
				Files.write(Paths.get(s"C:/Users/dell/Downloads/a.${mimeType}"), imageData)
			}
		}
	}

	def findFilesByName(path: String, fileName: String): Array[Object] = {
		var result: Array[Object] = Array.empty;
		try {
			val pathStream: Stream[Path] = Files.find(
				Paths.get(path),
				Integer.MAX_VALUE,
				(p, _) => {
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

	def getRelativePath(path: String, rootPath: String): String = {
		val fileName: String = (new File(path)).getName()
		val translatedPath: String = path.replace("\\", "/")
		val translatedRootPath: String = rootPath.replace("\\", "/")
		translatedPath
			.replace(translatedRootPath, "")
			.replace(fileName, "")
	}
}