function toggleTheme(theme) {
	let lis = [];
	lis.push(
		[document.body],
	);
	for (const li of lis) {
		for (const item of li) {
			if (theme === 'dark') {
				item.classList.add('dark-content');
			}
			else if (theme === 'light') {
				item.classList.remove('dark-content');
			}
		}
	}
}

export function getTheme() {
	return translateTheme(getThemeMode());
}

export function getThemeMode() {
	const mode = localStorage.getItem('theme');
	return (mode ?? "2");
}

function translateTheme(mode) {
	if (mode === "2") {
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark';
		}
		else {
			return 'light';
		}
	}
	else if (mode === "1") {
		return 'dark';
	}
	else if (mode === "0") {
		return 'light';
	}
	return null;
}

export function checkThemeMode() {
	const theme = getTheme();
	console.log(theme);
	toggleTheme(theme);
}

export function setThemeMode(mode) {
	localStorage.setItem('theme', mode);
	toggleTheme(translateTheme(mode));
}