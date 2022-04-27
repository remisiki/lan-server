import { showNarrowFilePanel, hideNarrowFilePanel, clearFileSelected } from './Files';
import { getIconOfFileType } from './utils/util';
import { timeFormat, sizeFormat } from './utils/format';

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

export function createSideBar(file, downloadAction) {
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
	const time = document.createElement('div');
	const size = document.createElement('div');
	const path = document.createElement('div');
	const close_btn = document.createElement('img');

	close_btn.src = '/assets/close.svg';
	close_btn.classList.add('action-btn');
	close_btn.addEventListener('click', () => {
		hideSideBar();
	});

	sidebar.id = 'sidebar';

	const thumb_src = getIconOfFileType(file.fileType, (file.thumb) ? (file.thumb) : null);
	thumb.style.backgroundImage = `url(${thumb_src})`;
	thumb.classList.add('thumb');

	name.innerText = file.name;
	name.classList.add('detail');
	name.classList.add('no-scroll-bar');

	time.innerText = `Last Modified: ${timeFormat(file.time)}`;
	time.classList.add('info');

	size.innerText = `Size: ${sizeFormat(file.size)}`;
	size.classList.add('info');

	path.innerText = `Path: /${decodeURIComponent(file.path)}`;
	path.classList.add('info');

	sidebar.appendChild(close_btn);
	sidebar.appendChild(thumb);
	sidebar.appendChild(name);
	sidebar.appendChild(size);
	sidebar.appendChild(time);
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