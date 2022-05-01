package types

import play.api.libs.json._

class Code(file: java.io.File) extends File(file) {
	def this(path: String) = 
		this(new File(path))

	def getLines(): Int = {
		val src = scala.io.Source.fromFile(this.file)
		try {
			src.getLines().size
		} catch {
			case e: Exception => -1
		} finally {
			src.close()
		}
	}

	override def getMetaData(): JsObject = {
		val file: File = new File(this.file)
		var jsonData: JsObject = file.getMetaData()
		try {
			val lineCount: Int = this.getLines()
			if (lineCount >= 0) {
				jsonData = jsonData + ("line" -> Json.toJson(lineCount))
			}
			jsonData
		}
		catch {
			case e: Exception => jsonData
		}
	}
}