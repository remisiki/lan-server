package util

package object Time {
	
	def time[R](before: String, block: => R): R = {
			val t0 = System.nanoTime()
			val result = block
			val t1 = System.nanoTime()
			println(f"${before}: ${(t1 - t0).toDouble / 1000000}%.0f ms, ${result}")
			result
	}
}