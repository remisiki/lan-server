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
	while (x > 0.9) {
		multiplier ++;
		x /= 1024;
	}
	return `${(x * 1024).toFixed(1)} ${unit[multiplier]}`;
}

export function durationFormat(duration) {
	let x = Math.round(duration);
	let duration_str = `${x % 60}`;
	while (x / 60 >= 1) {
		x = Math.floor(x / 60);
		duration_str = `${completeTime(x)}:${duration_str}`;
	}
	if (duration_str.indexOf(':') < 0) {
		duration_str += 's';
	}
	return duration_str;
}

export function trim(s, c = '/') {
	let _s = s;
	for (let i = 0; i < _s.length; i ++) {
		if (_s[i] === c) {
			_s = _s.slice(1);
		}
		else {
			break;
		}
	}
	for (let i = _s.length - 1; i > 0; i --) {
		if (_s[i] === c) {
			_s = _s.slice(0, _s.length - 1);
		}
		else {
			break;
		}
	}
	return _s;
}

export function completePath(path) {
	return `/${path}/`;
}

export function pathIsEqual(a, b) {
	return trim(a) === trim(b)
}

export function hashToPath() {
	const path = trim(decodeURIComponent(window.location.hash), '#');
	return path ? path : '/';
}