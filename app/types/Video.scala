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
	def this(path: String) = 
		this(new File(path))

	private val grab: Option[FrameGrab] = {
		try {
			val _grab: FrameGrab = FrameGrab.createFrameGrab(NIOUtils.readableChannel(file))
			Some(_grab)
		} catch {
			case e: Exception => None
		}
	}
	
	private val metaData: Option[DemuxerTrackMeta] = {
		this.grab match {
			case Some(_grab) => {
				Some(_grab.getVideoTrack().getMeta())
			}
			case None => {
				None
			} 
		}
	}

	def getFrame(): Option[Int] = {
		this.metaData match {
			case Some(_meta) => {
				Some(_meta.getTotalFrames())
			}
			case None => {
				None
			} 
		}
	}

	def getDuration(): Option[Double] = {
		this.metaData match {
			case Some(_meta) => {
				Some(_meta.getTotalDuration())
			}
			case None => {
				None
			} 
		}
	}

	def getWidth(): Option[Int] = {
		this.grab match {
			case Some(_grab) => {
				Some(_grab.getMediaInfo().getDim().getWidth())
			}
			case None => {
				None
			} 
		}
	}

	def getHeight(): Option[Int] = {
		this.grab match {
			case Some(_grab) => {
				Some(_grab.getMediaInfo().getDim().getHeight())
			}
			case None => {
				None
			} 
		}
	}

	def getFrameRate(): Option[Double] = {
		try {
			Some(math.rint(this.getFrame().get / this.getDuration().get * 100) / 100)
		} catch {
			case e: Exception => None
		}
	}

	override def getMetaData(): JsObject = {
		val file: types.File = new types.File(this.file)
		var jsonData: JsObject = file.getMetaData()
		if (this.grab != None) {
			jsonData = jsonData ++ Json.obj(
				"frame" -> this.getFrame().get,
				"duration" -> this.getDuration().get,
				"rate" -> this.getFrameRate().get,
				"width" -> this.getWidth().get,
				"height" -> this.getHeight().get
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
			image.generateThumbnail(outputPath)
		}
		else {
			false
		}
	}
}