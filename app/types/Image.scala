package types

import types.Media

import java.io.File
import java.awt.image.BufferedImage
import javax.imageio.{ImageIO, ImageReader}
import javax.imageio.metadata.IIOMetadata
import javax.imageio.stream.ImageInputStream
import play.api.libs.json._
import org.w3c.dom.{Node, NamedNodeMap}

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

	override def getMetaData(): JsObject = {
		val file: types.File = new types.File(this.file)
		var jsonData: JsObject = file.getMetaData()
		try {
			val buffer: BufferedImage = ImageIO.read(this.file)
			val stream: ImageInputStream = ImageIO.createImageInputStream(this.file)
			val readers: java.util.Iterator[ImageReader] = ImageIO.getImageReaders(stream)
			jsonData = jsonData ++ Json.obj("width" -> buffer.getWidth(), "height" -> buffer.getHeight())
			if (readers.hasNext) {
				val reader: ImageReader = readers.next()
				reader.setInput(stream, true)
				val metaData: IIOMetadata = reader.getImageMetadata(0)
				val names: Array[String] = metaData.getMetadataFormatNames()
				for (name <- names) {
					jsonData = jsonData + (name -> this.traversalMetadata(metaData.getAsTree(name)))
				}
			}
			stream.close()
			jsonData
		}
		catch {
			case e: Exception => jsonData
		}
	}

	def traversalMetadata(node: Node): JsObject = {
		this.traversalMetadata(node, 0)
	}

	def traversalMetadata(node: Node, level: Int): JsObject = {
		val map: NamedNodeMap = node.getAttributes()
		var jsonData: JsObject = Json.obj()
		if (map != null) {
			for (i <- 0 until map.getLength()) {
				val attr: Node = map.item(i)
				val value: JsValue = {
					val nodeValue: String = attr.getNodeValue()
					if (nodeValue.toIntOption != None) {
						Json.toJson(nodeValue.toInt)
					}
					else if (nodeValue.toDoubleOption != None) {
						Json.toJson(nodeValue.toDouble)
					}
					else if (nodeValue.toLongOption != None) {
						Json.toJson(nodeValue.toLong)
					}
					else {
						Json.toJson(nodeValue)
					}
				}
				jsonData = jsonData + (attr.getNodeName() -> value)
			}
		}
		var child: Node = node.getFirstChild()
		while (child != null) {
			val childData: JsObject = this.traversalMetadata(child, level + 1)
			jsonData = jsonData ++ childData
			child = child.getNextSibling()
		}
		jsonData
	}
}