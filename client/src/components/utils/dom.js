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
			directory_panel.removeChild(sort_panel);
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
};
