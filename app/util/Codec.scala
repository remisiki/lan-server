package util

import java.security.MessageDigest
import java.math.BigInteger
import java.util.Base64
import java.net.{URLEncoder, URLDecoder}

package object Codec {

	def getMessageDigest(s: String): String = {
		val byteArray: Array[Byte] = s.getBytes("UTF-8")
		val md5 = MessageDigest.getInstance("MD5")
		val digest = md5.digest(byteArray)
		new BigInteger(1, digest).toString(16)
	}

	def decodeBase64(base64: String): String = {
		val base64Decoded: Array[Byte] = Base64.getDecoder().decode(base64)
		val strDecoded: String = new String(base64Decoded, "UTF-8")
		decodeUri(strDecoded)
	}

	def encodeBase64(s: String): String = {
		val uriEncoded: String = encodeUri(s)
		val base64ByteString: Array[Byte] = Base64.getEncoder().encode(uriEncoded.getBytes("UTF-8"))
		new String(base64ByteString, "UTF-8")
	}

	def encodeUri(uri: String): String = {
		URLEncoder.encode(uri, "UTF-8").replace("+", "%20")
	}

	def decodeUri(str: String): String = {
		URLDecoder.decode(str, "UTF-8")
	}

}