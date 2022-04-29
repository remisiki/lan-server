package types

import java.io.File
import java.nio.file.{Path, Paths, Files}
import javax.imageio.ImageIO
import java.awt.image.BufferedImage
import org.jaudiotagger.audio.{AudioFileIO, AudioFile}
import play.api.libs.json._
import scala.jdk.CollectionConverters._
import scala.util.control.Breaks.{breakable, break}

class Audio(file: File) extends Media(file) {
	def this(path: String) = 
		this(new File(path))

	// def getAudioMeta() = {
	// 	val file: Mp3File = new Mp3File("")
	// 	if (file.hasId3v2Tag()) {
	// 		val id3v2Tag = file.getId3v2Tag()
	// 		println(file.getLengthInSeconds())
	// 		val imageData: Array[Byte] = id3v2Tag.getAlbumImage()
	// 		println(imageData)
	// 		if (imageData != null) {
	// 			val mimeType: String = id3v2Tag.getAlbumImageMimeType()
	// 			Files.write(Paths.get(s"C:/Users/dell/Downloads/a.${mimeType}"), imageData)
	// 		}
	// 	}
	// }

	def generateThumbnail(outputPath: String): Boolean = {
		val audioHasCover: Boolean = this.extractCover(outputPath)
		if (audioHasCover) {
			val image = new Image(outputPath)
			image.generateThumbnail(outputPath)
			true
		}
		else {
			false
		}
	}

	def extractCover(outputPath: String): Boolean = {
		val audio: AudioFile = AudioFileIO.read(file)
		val cover = audio.getTag().getFirstArtwork()
		if (cover == null)
			false
		else {
			try {
				val bufferedImage: BufferedImage = cover.getImage().asInstanceOf[BufferedImage]
				val mimeType: String = cover.getMimeType()
				val ext: String = mimeType match {
					case "image/jpeg" => "jpg"
					case _ => null
				}
				if (ext != null) {
					ImageIO.write(bufferedImage, ext, new File(outputPath))
					true
				}
				else {
					false
				}
			} catch {
				case e: Exception => false
			}
		}
	}

	override def getMetaData(): JsObject = {
		val file: types.File = new types.File(this.file)
		var jsonData: JsObject = file.getMetaData()
		try {
			val audio: AudioFile = AudioFileIO.read(this.file)
			val header = audio.getAudioHeader()
			val tag = audio.getTag()
			jsonData = jsonData ++ Json.obj(
				"bitRate" -> header.getBitRateAsNumber(),
				"duration" -> header.getTrackLength()
			)
			if (!tag.isEmpty()) {
				val tagMap: Map[String, Array[String]] = Map(
					"artist" -> Array("ARTIST", "artist", "aART", "©ART"),
					"album" -> Array("ALBUM", "album", "©alb")
				)
				for ((key, values) <- tagMap) {
					breakable {
						for (value <- values) {
							val tagValue: String = tag.getFirst(value)
							if (tagValue != "") {
								jsonData = jsonData + (key -> Json.toJson(tagValue.replace("\u0000", "")))
								break
							}
						}
					}
				}
			}
			jsonData
		}
		catch {
			case e: Exception => println(e); jsonData
		}
	}
}
