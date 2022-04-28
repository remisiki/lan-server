package types

import types.{Media, Image}

import java.io.File
import play.api.libs.json._

import javax.imageio.ImageIO
import java.awt.image.BufferedImage

import org.jcodec.api.{FrameGrab, MediaInfo}
import org.jcodec.common.model.Picture
import org.jcodec.scale.AWTUtil
import org.jcodec.common.io.NIOUtils
import org.jcodec.common.DemuxerTrackMeta

class Video(file: File) extends Media(file) {
	private val grab: FrameGrab = FrameGrab.createFrameGrab(NIOUtils.readableChannel(file))
	private val metaData: DemuxerTrackMeta = grab.getVideoTrack().getMeta()
	private val frame: Int = metaData.getTotalFrames()
	private val duration: Double = metaData.getTotalDuration()

	def getFrame(): Int = this.frame

	def getDuration(): Double = this.duration

	def getFrameRate(): Double = math.rint(this.frame / this.duration * 100) / 100

	def asJson(): JsObject = {
		Json.obj(
			"duration" -> this.duration,
			"rate" -> this.getFrameRate()
		)
	}

	def generateKeyFrame(outputPath: String): Boolean = {
		try {
			val picture: Picture = FrameGrab.getFrameFromFile(file, 0)
			val bufferedImage: BufferedImage = AWTUtil.toBufferedImage(picture)
			ImageIO.write(
				bufferedImage,
				"jpg",
				new File(outputPath)
			)
			true
		} catch {
			case e: Exception => false
		}
	}

	def generateThumbnail(outputPath: String): Boolean = {
		val videoCaptured: Boolean = this.generateKeyFrame(outputPath)
		if (videoCaptured) {
			val image = new Image(outputPath)
			image.generateThumbnail(outputPath)
		}
		else {
			false
		}
	}
}