package types

import types.{Media, Image}

import java.io.File
import play.api.libs.json._

import javax.imageio.ImageIO
import java.awt.image.BufferedImage

import org.jcodec.api.{FrameGrab, MediaInfo}
import org.jcodec.common.model.Picture
import org.jcodec.scale.AWTUtil
import org.jcodec.common.io.{NIOUtils, FileChannelWrapper}
import org.jcodec.common.DemuxerTrackMeta

class Video(file: File) extends Media(file) {
	def this(path: String) = 
		this(new File(path))

	private def getGrab(): Option[FrameGrab] = {
		val channel: FileChannelWrapper = NIOUtils.readableChannel(file)
		var result: Option[FrameGrab] = None
		try {
			val _grab: FrameGrab = FrameGrab.createFrameGrab(channel)
			result = Some(_grab)
		} catch {
			case e: Exception => ()
		} finally {
			channel.close()
		}
		result
	}
	
	private def getTrackMeta(grab: FrameGrab): DemuxerTrackMeta = {
		grab.getVideoTrack().getMeta()
	}

	def getFrame(grab: FrameGrab): Int = {
		this.getTrackMeta(grab).getTotalFrames()
	}

	def getDuration(grab: FrameGrab): Double = {
		this.getTrackMeta(grab).getTotalDuration()
	}

	def getWidth(grab: FrameGrab): Int = {
		grab.getMediaInfo().getDim().getWidth()
	}

	def getHeight(grab: FrameGrab): Int = {
		grab.getMediaInfo().getDim().getHeight()
	}

	def getFrameRate(grab: FrameGrab): Double = {
		math.rint(this.getFrame(grab) / this.getDuration(grab) * 100) / 100
	}

	override def getMetaData(): JsObject = {
		val file: types.File = new types.File(this.file)
		var jsonData: JsObject = file.getMetaData()
		var grab: FrameGrab = this.getGrab() match {
			case Some(_grab) => _grab
			case None => null
		}
		if (grab != null) {
			jsonData = jsonData ++ Json.obj(
				"frame" -> this.getFrame(grab),
				"duration" -> this.getDuration(grab),
				"rate" -> this.getFrameRate(grab),
				"width" -> this.getWidth(grab),
				"height" -> this.getHeight(grab)
			)
		}
		jsonData
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
			// false
			image.generateThumbnail(outputPath)
		}
		else {
			false
		}
	}
}