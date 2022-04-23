package util

import java.security.MessageDigest
import java.math.BigInteger
import java.io.File
import java.nio.file.{Paths, Files}
import java.util.Base64
import java.nio.charset.StandardCharsets
import java.net.{URLEncoder, URLDecoder}
import scala.util.matching.Regex
import net.coobird.thumbnailator.Thumbnails

package object util {
	def getMessageDigest(s: String): String = {
		val byteArray: Array[Byte] = s.getBytes("UTF-8")
		val md5 = MessageDigest.getInstance("MD5")
		val digest = md5.digest(byteArray)
		new BigInteger(1, digest).toString(16)
	}

	def generateThumbnail(filePath: String, outputPath: String): String = {
		val file: File = new File(filePath)
		val cacheFileName: String = getMessageDigest(filePath) + ".jpg"
		val cacheFilePath: String = Paths.get(outputPath, cacheFileName).toString()
		val cacheFile: File = new File(cacheFilePath)
		if (!cacheFile.exists()) {
			Thumbnails.of(file)
	      .size(640, 480)
	      .outputFormat("jpg")
	      .toFile(cacheFilePath)
    }
    cacheFilePath
	}

	def isImage(fileName: String): Boolean = {
		val ext: String = getExt(fileName)
		val supportedExt: Array[String] = Array(".jpe", ".jpeg", ".jpg", ".png", ".bmp", ".gif", ".tiff")
		supportedExt.contains(ext)
	}

	def getExt(fileName: String): String = {
		val extensionPattern: Regex = "(\\.[^.]+)$".r
		extensionPattern.findFirstMatchIn(fileName).getOrElse("").toString().toLowerCase()
	}

	def decodeBase64(base64: String): String = {
		val base64Decoded: Array[Byte] = Base64.getDecoder().decode(base64)
    val strDecoded: String = new String(base64Decoded, StandardCharsets.UTF_8)
    URLDecoder.decode(strDecoded, StandardCharsets.UTF_8)
	}

	def encodeBase64(s: String): String = {
		val uriEncoded: String = encodeUri(s)
		val base64ByteString: Array[Byte] = Base64.getEncoder().encode(uriEncoded.getBytes(StandardCharsets.UTF_8))
		new String(base64ByteString, StandardCharsets.UTF_8)
	}

	def encodeUri(uri: String): String = {
		URLEncoder.encode(uri, StandardCharsets.UTF_8).replace("+", "%20")
	}
}