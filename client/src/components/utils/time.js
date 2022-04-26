function completeTime(time) {
	return (`0${time}`.substr(-2));
}

export function timestampToTime(timestamp) {
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
