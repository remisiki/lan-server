function completeTime(time) {
	return (`0${time}`.substr(-2));
}

export function timeFormat(timestamp) {
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();
	const time = `${year}/${completeTime(month)}/${completeTime(day)} ${completeTime(hour)}:${completeTime(minute)}`;
	return time;
}

export function sizeFormat(size) {
	let x = size / 1024;
	let multiplier = 0;
	const unit = ['B', 'KB', 'MB', 'GB', 'TB'];
	while (x > 0.5) {
		multiplier ++;
		x /= 1024;
	}
	return `${(x * 1024).toFixed(1)} ${unit[multiplier]}`;
}