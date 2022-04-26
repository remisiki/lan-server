import { timeFormat, sizeFormat } from './format';

export function uploadProgressHandler(e, sent, size) {
	const progress_bar = document.getElementById('progress-bar');
	const sent_sum = e.loaded + sent;
	const progress_percent = (sent_sum >= size) ? 100 : (sent_sum / size * 100);
	progress_bar.style.width = `${progress_percent}%`;
}

export function clearProgressBar(delay = 0) {
	enableUploadBtn();
	setProgressBarColor('green', delay);
}

export function disableUploadBtn() {
	const upload_btn = document.getElementById('upload-btn');
	upload_btn.setAttribute('onclick', '');
}

export function enableUploadBtn() {
	const upload_btn = document.getElementById('upload-btn');
	upload_btn.setAttribute('onclick', `document.getElementById('file-upload').click()`);
}

export function setProgressBarColor(color, duration = 0) {
	let r, g, b;
	switch (color) {
		case 'green':
			r = 51;
			g = 255;
			b = 153;
			break;
		case 'red':
			r = 237;
			g = 67;
			b = 55;
			break;
		default:
			r = 51;
			g = 255;
			b = 153;
	}
	const progress_bar = document.getElementById('progress-bar');
	if (duration === 0) {
		const temp = progress_bar.style.transition;
		progress_bar.style.transition = '';
		progress_bar.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
		progress_bar.style.transition = temp;
		return;
	}
	progress_bar.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 1.0)`;
	setTimeout(() => {
		progress_bar.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.0)`;
	}, duration);
	setTimeout(() => {
		progress_bar.style.width = 0;
	}, duration + 600);
	setTimeout(() => {
		progress_bar.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
	}, duration + 700);
}

export function setFullProgressBar() {
	const progress_bar = document.getElementById('progress-bar');
	progress_bar.style.width = "100%";
}

export function toggleMessageBox(text = "", duration = 2000) {
	const message_box = document.getElementById('message-box');
	message_box.innerText = text;
	message_box.classList.add('slide-in');
	setTimeout(() => {
		message_box.classList.remove('slide-in');
	}, duration);
}

export function imgLoadErrorFallback(e, file_type) {
	const img = e.target;
	let icon_src;
	switch (file_type) {
		case 'image':
			icon_src = '/assets/image.svg';
			break;
		case 'video':
			icon_src = '';
			break;
		default:
			icon_src = '';
	}
	img.src = icon_src;
}

export function toggleSortPanel(props) {
	const directory_panel = document.getElementById('directory-panel');
	let sort_panel = document.getElementById('sort-panel');
	if (!sort_panel) {
		sort_panel = document.createElement('div');
		sort_panel.id = 'sort-panel';
		sort_panel.classList.add('float');

		const sort_options = ['time', 'name', 'type'];
		for (const option of sort_options) {
			const sort_option = createSortOption(option, props);
			sort_panel.appendChild(sort_option);
		}

		directory_panel.appendChild(sort_panel);

		setTimeout(() => {
			sort_panel.classList.add('slide-in');
		}, 0);
	}
	else {
		sort_panel.classList.remove('slide-in');
		setTimeout(() => {
			sort_panel.remove();
		}, 200);
	}
}

function createSortOption(name, props) {
	const option_container = document.createElement('div');
	const before_option = document.createElement('div');
	const sort_option = document.createElement('div');

	option_container.classList.add('option-container');
	before_option.classList.add('before-option');
	if (name === props.fileSort.by) {
		before_option.style.backgroundImage = 'url(/assets/select.svg)';
	}

	sort_option.innerText = `Sort by ${name}`;
	sort_option.classList.add('option');

	option_container.id = `sort-by-${name}`;
	option_container.appendChild(before_option);
	option_container.appendChild(sort_option);
	option_container.addEventListener('click', () => {
		setOptionSelected(name, props);
	});

	return option_container;
}

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

function setOptionSelected(name, props) {
	const sort_panel = document.getElementById('sort-panel');
	const sort_selector = document.getElementById('sort-selector');
	for (const sort_option of sort_panel.childNodes) {
		const before_option = sort_option.getElementsByClassName('before-option')[0];
		if (`sort-by-${name}` === sort_option.id) {
			before_option.style.backgroundImage = 'url(/assets/select.svg)';
		}
		else {
			before_option.style.backgroundImage = '';
		}
	}
	props.setFileSort({by: name, descending: props.fileSort.descending});
	sort_selector.innerText = `Sort by ${name}`;
	toggleSortPanel(props);
}

export function sortDirectionSelector(props) {
	const sort_direction = document.getElementById('sort-direction');
	sort_direction.classList.toggle('reverse-z');
	props.setFileSort({by: props.fileSort.by, descending: !props.fileSort.descending});
}

export function getIconOfFileType(file_type, thumb) {
	let icon_src;
	switch (file_type) {
		case 'folder':
			icon_src = '/assets/folder.svg';
			break;
		case 'image':
		case 'video':
			icon_src = `/api/v1/thumb?path=${thumb}`;
			break;
		case 'audio':
			icon_src = '/assets/audio.svg';
			break;
		case 'binary':
			icon_src = '/assets/puzzle.svg';
			break;
		case 'pdf':
			icon_src = '/assets/pdf.svg';
			break;
		case 'archieve':
			icon_src = '/assets/archieve.svg';
			break;
		case 'msword':
			icon_src = '/assets/msword.svg';
			break;
		case 'mspowerpoint':
			icon_src = '/assets/mspowerpoint.svg';
			break;
		case 'msexcel':
			icon_src = '/assets/msexcel.svg';
			break;
		case 'code':
			icon_src = '/assets/code.svg';
			break;
		case 'file':
		default:
			icon_src = '/assets/file.svg';
	}
	return icon_src;
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
	const close_btn = document.createElement('img');

	close_btn.src = '/assets/close.svg';
	close_btn.classList.add('action-btn');
	close_btn.addEventListener('click', hideSideBar);

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

	sidebar.appendChild(close_btn);
	sidebar.appendChild(thumb);
	sidebar.appendChild(name);
	sidebar.appendChild(size);
	sidebar.appendChild(time);
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
			hideNarrowFilePanel();
		}, 100);
	}
}

function showNarrowFilePanel() {
	const cells = document.getElementsByClassName('cell');
	const cell_containers = document.getElementsByClassName('cell-container');
	const top_btn = document.getElementById('totop');
	for (const cell of cells) {
		cell.classList.add('narrow');
	}
	for (const cell_container of cell_containers) {
		cell_container.classList.add('narrow');
	}
	top_btn.classList.add('narrow');
}

function hideNarrowFilePanel() {
	const cells = document.getElementsByClassName('cell');
	const cell_containers = document.getElementsByClassName('cell-container');
	const top_btn = document.getElementById('totop');
	for (const cell of cells) {
		cell.classList.remove('narrow');
	}
	for (const cell_container of cell_containers) {
		cell_container.classList.remove('narrow');
	}
	top_btn.classList.remove('narrow');
}