package types

import types.Media

import java.io.File
import play.api.libs.json._

import net.coobird.thumbnailator.Thumbnails

class Image(file: File) extends Media(file) {
	def this(path: String) = 
		this(new File(path))

	def generateThumbnail(outputPath: String): Boolean = {
		try {
			Thumbnails.of(this.file)
				.size(640, 480)
				.outputFormat("jpg")
				.toFile(outputPath)
			true
		} catch {
			case e: Exception => false
		}
	}
}