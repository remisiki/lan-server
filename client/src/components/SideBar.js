import { showNarrowFilePanel, hideNarrowFilePanel, clearFileSelected } from './Files';
import { getIconOfFileType, defaultImage } from './utils/util';
import { timeFormat, sizeFormat, durationFormat } from './utils/format';
import { fetchMetaData } from './http/request';

function createSideOption(name, icon, onClick) {
	const option_container = document.createElement('div');
	const before_option = document.createElement('div');
	const option = document.createElement('div');

	option_container.classList.add('option-container');
	before_option.classList.add('before-option');
	before_option.style.backgroundImage = `url(${icon})`;

	option.innerText = name;
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

	const relative_path = `/${decodeURIComponent(file.path)}`;
	const meta_type = ['image', 'video', 'audio'];
	if (meta_type.includes(file.fileType)) {
		const path = window.btoa(`${relative_path}${encodeURIComponent(file.name)}`);
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
	for (const info of infos) {
		sidebar.appendChild(info);
	}
	sidebar.appendChild(file_meta_info_wrapper);
	sidebar.appendChild(path);
	sidebar.appendChild(createSideOption('Download', '/assets/download.svg', downloadAction));
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