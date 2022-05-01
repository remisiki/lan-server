import { showNarrowFilePanel, hideNarrowFilePanel, clearFileSelected } from './Files';
import { getIconOfFileType, defaultImage } from './utils/util';
import { timeFormat, sizeFormat, durationFormat } from './utils/format';
import { fetchMetaData, verifyAdmin } from './http/request';
import { toggleMessageBox } from './MessageBox';
import { getThemeMode, setThemeMode, getTheme } from './control/dark';
import md5 from 'js-md5';

function createSideOption(content, name, icon, onClick) {
	const option_container = document.createElement('div');
	const before_option = document.createElement('div');
	const option = document.createElement('div');

	option_container.classList.add('option-container');
	before_option.classList.add('before-option');
	before_option.style.backgroundImage = `url(${icon})`;

	option.innerText = content;
	option.classList.add('option');

	option_container.id = `side-option-${name}`;
	option_container.appendChild(before_option);
	option_container.appendChild(option);
	option_container.addEventListener('click', onClick);

	return option_container;
}

function createInfo(content) {
	const info = document.createElement('div');
	info.classList.add('info');
	info.innerText = content;
	return info;
}

async function createMetaInfo(wrapper, path) {
	let infos = [];
	const response = await fetchMetaData(path);
	if (response.duration) {
		infos.push(createInfo(`Length: ${durationFormat(response.duration)}`))
	}
	if (response.width && response.height) {
		infos.push(createInfo(`Resolution: ${response.width}x${response.height}`))
	}
	if (response.rate) {
		infos.push(createInfo(`Frame Rate: ${response.rate} FPS`))
	}
	if (response['javax_imageio_1.0']?.name) {
		infos.push(createInfo(`Color: ${response['javax_imageio_1.0'].name}`))
	}
	if (response.bitRate) {
		infos.push(createInfo(`Bit Rate: ${response.bitRate} kbps`))
	}
	if (response.artist) {
		infos.push(createInfo(`Artist: ${response.artist}`))
	}
	if (response.album) {
		infos.push(createInfo(`Album: ${response.album}`))
	}
	if (response.line) {
		infos.push(createInfo(`Line Count: ${response.line}`))
	}
	for (const info of infos) {
		wrapper.appendChild(info);
	}
}

export function createSideBar(file, downloadAction, props) {
	showNarrowFilePanel();
	const sidebar_exist = document.getElementById('sidebar');
	if (sidebar_exist) {
		sidebar_exist.classList.remove('slide-in');
		setTimeout(() => {
			sidebar_exist.remove();
		}, 100);
	}
	const sidebar = document.createElement('div');
	const directory_panel = document.getElementById('directory-panel');
	const thumb = document.createElement('div');
	const name = document.createElement('div');
	const path = document.createElement('div');
	const path_before = document.createElement('span');
	const path_content = document.createElement('span');
	const close_btn = document.createElement('img');
	const file_meta_info_wrapper = document.createElement('div');
	const wrapper = document.createElement('div');
	let infos = [];

	close_btn.src = '/assets/close.svg';
	close_btn.classList.add('action-btn');
	close_btn.addEventListener('click', () => {
		hideSideBar();
	});

	sidebar.id = 'sidebar';

	const thumb_src = getIconOfFileType(file.fileType, (file.thumb) ? (file.thumb) : null);
	const image = new Image();
	image.src = thumb_src;
	thumb.classList.add('thumb');
	image.addEventListener('load', (e) => {
		thumb.style.backgroundImage = `url(${thumb_src})`;
	});
	image.addEventListener('error', (e) => {
		thumb.style.backgroundImage = `url(${defaultImage(file.fileType)})`;
	});

	name.innerText = file.name;
	name.classList.add('detail');
	name.classList.add('no-scroll-bar');

	infos.push(
		createInfo(`Size: ${sizeFormat(file.size)}`),
		createInfo(`Last Modified: ${timeFormat(file.time)}`),
	)

	let relative_path = decodeURIComponent(file.path);
	if (!relative_path) {
		relative_path = '/';
	}
	const meta_type = ['image', 'video', 'audio', 'code'];
	if (meta_type.includes(file.fileType)) {
		const path = window.btoa(encodeURIComponent(`${relative_path}${file.name}`));
		createMetaInfo(file_meta_info_wrapper, path);
	}

	path_content.innerText = relative_path;
	path_content.classList.add('link-text');
	path_content.addEventListener('click', () => {
		if (props.path !== relative_path) {
			let paths_copy = props.paths;
			paths_copy.unshift(relative_path);
			props.setPaths(paths_copy);
			props.setPath(relative_path);
		}
	})
	path_before.innerText = 'Path: ';
	path.classList.add('info');
	path.appendChild(path_before);
	path.appendChild(path_content);

	sidebar.appendChild(close_btn);
	sidebar.appendChild(thumb);
	sidebar.appendChild(name);

	wrapper.classList.add('detail-wrapper');
	wrapper.classList.add('no-scroll-bar');
	for (const info of infos) {
		wrapper.appendChild(info);
	}
	wrapper.appendChild(file_meta_info_wrapper);
	wrapper.appendChild(path);
	wrapper.appendChild(createSideOption('Download', 'download', '/assets/download.svg', downloadAction));

	sidebar.appendChild(wrapper);
	directory_panel.appendChild(sidebar);
	setTimeout(() => {
		sidebar.classList.add('slide-in');
	}, 100);
}

function loginHandler(e) {
	if (e.keyCode === 13) {
		e.preventDefault();
		login();
		return false;
	}
}

async function login() {
	const input = document.getElementById('password-box');
	const log_in_btn = document.getElementById('side-option-login');
	const password = input.value;
	if (!password) return;
	input.disabled = true;
	input.classList.add('gray');
	log_in_btn.classList.add('hide');
	const user_cookie_value = window.btoa(md5(encodeURIComponent(password)));
	document.cookie = `_user=${user_cookie_value}`;
	const isAdmin = await verifyAdmin();
	if (isAdmin) {
		toggleMessageBox("Welcome!");
		setTimeout(() => {
			window.location.reload();
		}, 2000);
	}
	else {
		toggleMessageBox("Wrong password!");
		input.disabled = false;
		input.classList.remove('gray');
		input.focus();
		log_in_btn.classList.remove('hide');
	}
}

function logout() {
	const log_out_btn = document.getElementById('side-option-logout');
	if (log_out_btn) {
		log_out_btn.remove();
	}
	document.cookie = '_user=;Max-Age=0';
	toggleMessageBox('Logged out');
	setTimeout(() => {
		window.location.reload();
	}, 2000);
}

function createAdminSetting(isAdmin) {
	const wrapper = document.createElement('div');
	const caption_admin = document.createElement('h1');
	caption_admin.innerText = 'Admin Mode';
	wrapper.appendChild(caption_admin);

	if (!isAdmin) {
		const password_wrapper = document.createElement('div');
		const password = document.createElement('input');

		password_wrapper.id = 'password-box-wrapper';
		password.id = 'password-box';
		password.type = 'password';
		password.placeholder = 'Enter Admin Password';
		password.addEventListener('keydown', loginHandler);
		password.classList.add('no-scroll-bar');
		password_wrapper.appendChild(password);

		wrapper.appendChild(password_wrapper);
		wrapper.appendChild(createSideOption('Log in', 'login', '/assets/login.svg', login));
	}
	else {
		const text_admin = document.createElement('h3');
		text_admin.innerText = 'You are logged in as admin.';

		wrapper.appendChild(text_admin);
		wrapper.appendChild(createSideOption('Log out', 'logout', '/assets/logout.svg', logout));
	}

	return wrapper;
}

function selectTheme(e) {
	e.currentTarget.parentNode.getElementsByClassName('option-selected').item(0)?.classList.remove('option-selected');
	e.currentTarget.classList.add('option-selected');
}

function createDarkSetting(setTheme) {
	const mode = getThemeMode();
	const wrapper = document.createElement('div');
	const caption = document.createElement('h1');
	caption.innerText = 'Color Theme';
	wrapper.appendChild(caption);

	const options = [
		createSideOption('Light', 'light', '/assets/sun.svg', (e) => {
			selectTheme(e);
			setThemeMode(0);
			setTheme('light');
		}),
		createSideOption('Dark', 'dark', '/assets/moon.svg', (e) => {
			selectTheme(e);
			setThemeMode(1);
			setTheme('dark');
		}),
		createSideOption('System', 'system', '/assets/auto.svg', (e) => {
			selectTheme(e);
			setThemeMode(2);
			setTheme(getTheme());
		}),
	];

	options[mode].classList.add('option-selected');
	for (const option of options) {
		wrapper.appendChild(option);
	}

	return wrapper;
}

function createSettingInfo() {
	const wrapper = document.createElement('div');
	const caption = document.createElement('h1');
	const paragraph = document.createElement('p');

	caption.innerText = 'About';

	paragraph.innerText = 'Version: 1.0\n© 2022 Remisiki';

	const options = [
		createSideOption('Github', 'github', '/assets/github.svg', (e) => {
			window.open('https://github.com/remisiki/lan-share', '_blank').focus();
		}),
	];

	wrapper.appendChild(caption);
	wrapper.appendChild(paragraph);
	for (const option of options) {
		wrapper.appendChild(option);
	}

	return wrapper;
}

export function createSettingSideBar(props) {
	showNarrowFilePanel();
	const sidebar_exist = document.getElementById('sidebar');
	if (sidebar_exist) {
		sidebar_exist.classList.remove('slide-in');
		setTimeout(() => {
			sidebar_exist.remove();
		}, 100);
	}
	const sidebar = document.createElement('div');
	const directory_panel = document.getElementById('directory-panel');
	const close_btn = document.createElement('img');
	
	close_btn.src = '/assets/close.svg';
	close_btn.classList.add('action-btn');
	close_btn.addEventListener('click', () => {
		hideSideBar();
	});

	sidebar.id = 'sidebar';

	sidebar.appendChild(close_btn);
	sidebar.appendChild(createDarkSetting(props.setTheme));
	sidebar.appendChild(createAdminSetting(props.admin));
	sidebar.appendChild(createSettingInfo());
	directory_panel.appendChild(sidebar);
	setTimeout(() => {
		sidebar.classList.add('slide-in');
	}, 100);
}

export function hideSideBar() {
	const sidebar = document.getElementById('sidebar');
	if (sidebar) {
		sidebar.classList.remove('slide-in');
		setTimeout(() => {
			sidebar.remove();
			clearFileSelected();
			hideNarrowFilePanel();
		}, 100);
	}
}