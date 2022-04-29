package types

import types.{File, Image, Video}
import util.Codec
import java.nio.file.{Path, Paths, Files}

abstract class Media(file: java.io.File) extends File(file) {

}

object Media {

	def generateThumbnail(filePath: String, outputPath: String): String = {
		val file: File = new File(filePath)
		val cacheFileName: String = Codec.getMessageDigest(s"${filePath}${file.lastModified}") + ".jpg"
		val cacheFilePath: String = Paths.get(outputPath, cacheFileName).toString()
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