package user

import java.nio.file.{Paths, Files}
import com.typesafe.config.{Config, ConfigFactory}
import play.api.mvc.Cookies

class Admin extends Object {

}

object Admin {
	private val applicationConf: Config = ConfigFactory.load("application.conf")
	private val sharePath = applicationConf.getString("sharePath")
	private val key: String = applicationConf.getString("app.user.admin.key")

	def getRealPath(path: String, isAdmin: Boolean): String = {
		if (isAdmin) {
			(new java.io.File(path)).getAbsolutePath()
		}
		else {
			Paths.get(this.sharePath, path).normalize().toString()
		}
	}

	private def getEncryptedKey(): String = {
		util.Codec.encodeBase64(util.Codec.getMessageDigest(this.key))
	}

	def verifyCookie(cookies: Cookies): Boolean = {
		cookies.get("_user") match {
			case Some(cookie) => cookie.value.equals(this.getEncryptedKey())
			case None => false
		}
	}
}