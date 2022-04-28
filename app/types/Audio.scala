package types

import java.io.File
import java.nio.file.{Path, Paths, Files}
import play.api.libs.json._
import com.mpatric.mp3agic.Mp3File

class Audio(file: File) extends Media(file) {
	def this(path: String) = 
		this(new File(path))

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
}