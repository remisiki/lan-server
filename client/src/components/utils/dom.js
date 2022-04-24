function uploadProgressHandler(e, sent, size) {
	const progress_bar = document.getElementById('progress-bar');
	const sent_sum = e.loaded + sent;
	const progress_percent = (sent_sum >= size) ? 100 : (sent_sum / size * 100);
	progress_bar.style.width = `${progress_percent}%`;
}

function clearProgressBar(delay = 0) {
	enableUploadBtn();
	setProgressBarColor('green', delay);
}

function disableUploadBtn() {
	const upload_btn = document.getElementById('upload-btn');
	upload_btn.setAttribute('onclick', '');
}

function enableUploadBtn() {
	const upload_btn = document.getElementById('upload-btn');
	upload_btn.setAttribute('onclick', `document.getElementById('file-upload').click()`);
}

function setProgressBarColor(color, duration = 0) {
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

function setFullProgressBar() {
	const progress_bar = document.getElementById('progress-bar');
	progress_bar.style.width = "100%";
}

function toggleMessageBox(text = "", duration = 2000) {
	const message_box = document.getElementById('message-box');
	message_box.innerText = text;
	message_box.classList.add('slide-in');
	setTimeout(() => {
		message_box.classList.remove('slide-in');
	}, duration);
}

function imgLoadErrorFallback(e, file_type) {
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

export { uploadProgressHandler, clearProgressBar, disableUploadBtn, enableUploadBtn, setProgressBarColor, setFullProgressBar, toggleMessageBox, imgLoadErrorFallback };