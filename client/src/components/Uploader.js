import React, { useState, useEffect } from 'react';
import { MessageBox, toggleMessageBox } from './MessageBox';
import axios from 'axios';

export function Uploader () {
		const [selected_file, setSelectedFile] = useState(null);
		useEffect(() => {
			uploadFile(selected_file);
		}, [selected_file]);
		useEffect(enableUploadBtn, []);
		const handleFileInput = (e) => {
			const file = e.target.files[0];
			if (!file) return;
			if (file.size > (1 << 30)) {
				alert("File size cannot exceed more than 1 GB.");
			}
			else {
				setSelectedFile(file);
			}
		}

		return (
			<>
				<MessageBox text="" />
				<div className="title-right" id="upload-btn" style={{content: "url(/assets/upload.svg)"}}>
					<input id="file-upload" type="file" onChange={handleFileInput} style={{display: "none"}} />
				</div>
			</>
		);
}

function uploadFile(file) {
	if (!file) return;
	clearProgressBar();
	disableUploadBtn();
	const name = window.btoa(encodeURIComponent(file.name));
	const size = file.size;
	const interval = (8 << 20);
	const sendFilePart = async () => {
		let sent = 0;
		let retry = 0;
		const config = {
			headers: {
				'Content-Type':'multipart/form-data',
				// 'Authorization': 'Bearer ' + this.token,
			},
			onUploadProgress: (progressEvent) => uploadProgressHandler(progressEvent, sent, size)
		}
		while (sent < size) {
			const form_data = new FormData();
			const next = (sent + interval > size) ? (size + 1) : (sent + interval);
			const done = (next > size);
			const file_part = file.slice(sent, next);
			form_data.append("name", name);
			form_data.append("file", file_part);
			form_data.append("done", done);
			await axios
				.post('/', form_data, config)
				.then((res) => {
					if (res.data.error) {
						if (retry > 3) {
							toggleMessageBox("Failed", 5000);
							setFullProgressBar();
							setProgressBarColor('red', 5000);
							console.error(`All ${retry} retry fail, abort.`);
							sent = size;
							return;
						}
						retry ++;
						console.error(`Slice ${sent} error, retry ${retry} times...`);
						return;
					}
					sent = next;
					retry = 0;
					if (done) {
						toggleMessageBox("Success", 2000);
						clearProgressBar(300);
					}
				})
				.catch((err) => {
					toggleMessageBox("Failed", 5000);
					setFullProgressBar();
					setProgressBarColor('red', 5000);
				});
		}
	};
	sendFilePart();
}

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
