package types

import types.{File, Image, Video}
import util.Codec
import java.nio.file.{Path, Paths, Files}

abstract class Media(file: java.io.File) extends File(file) {

}

object Media {

	def generateThumbnail(filePath: String, outputPath: String): String = {
		val file: File = new File(filePath)
		val md5: String = Codec.getMessageDigest(s"${filePath}${file.lastModified}")
		var paths: Array[String] = Array.empty
		val depth: Int = 2
		for (i <- 0 until depth) {
			paths = paths :+ md5.substring(i * 2, i * 2 + 2)
		}
		var cacheFilePath: String = Paths.get(outputPath).toString()
		for (path <- paths) {
			cacheFilePath = Paths.get(cacheFilePath, path).toString()
		}
		Files.createDirectories(Paths.get(cacheFilePath))
		cacheFilePath = Paths.get(cacheFilePath, md5.substring(depth * 2)).toString()
		cacheFilePath += ".jpg"
		val cacheFile: File = new File(cacheFilePath)
		val fileType: String = File.getFileType(filePath)
		if (!cacheFile.exists()) {
			fileType match {
				case "image" => {
					val image = new Image(file)
					if (image.generateThumbnail(cacheFilePath))
						cacheFilePath
					else
						null
				}
				case "video" => {
					val video = new Video(file)
					if (video.generateThumbnail(cacheFilePath))
						cacheFilePath
					else
						null
				} 
				case "audio" => {
					val audio = new Audio(file)
					if (audio.generateThumbnail(cacheFilePath))
						cacheFilePath
					else
						null
				} 
				case _ => {
					null
				}
			}
		}
		else {
			cacheFilePath
		}
	}
}