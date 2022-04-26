import React, { useState, useEffect } from 'react';
import { get } from './http/request';
import { timestampToTime } from './utils/time';
import { uploadProgressHandler, clearProgressBar, disableUploadBtn, enableUploadBtn, setProgressBarColor, setFullProgressBar, toggleMessageBox, imgLoadErrorFallback, toggleSortPanel, sortDirectionSelector } from './utils/dom';
import { sortFiles } from './utils/sort';
import axios from 'axios';
import { MessageBox } from './MessageBox';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function File({name, time, fileType, thumb, onClick}) {
	let icon_src;
	switch (fileType) {
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
	return (
		<div className="cell float" onClick={onClick}>
			<div className="img-container">
				<LazyLoadImage
					src={icon_src}
					effect={(thumb) ? "blur" : "opacity"}
					onError={(e) => imgLoadErrorFallback(e, fileType)}
				/>
				{(fileType === "video") && <img src="/assets/play.svg" className="play-icon" alt="" />}
			</div>
			<span className="title">{name}</span>
			<br />
			<span className="content">{timestampToTime(time)}</span>
		</div>
	);
}

function Files(props) {
	const [data, setData] = useState(false);
	const [fileSort, setFileSort] = useState({by: "time", descending: true});
	useEffect(() => {
		const url = '/api/v1/file_list';
		const params = {
			path: props.path
		};
		const worker = async () => {
			const response = await get(url, params);
			if (response.empty) return;
			let li = [];
			for (const folder of response.folders) {
				const folderOpener = () => {
					const child = `${props.path}${folder.name}/`;
					let paths_copy = props.paths;
					paths_copy.unshift(child);
					props.setPaths(paths_copy);
					props.setPath(child);
				};
				li.push(
					<File
						key={`d-${folder.name}`}
						name={folder.name}
						time={folder.time}
						fileType="folder"
						onClick={folderOpener}
					/>);
			}
			for (const file of response.files) {
				const thumb = (file.thumb) ? (file.thumb) : null;
				li.push(
					<File
						key={`f-${file.name}`}
						name={file.name}
						time={file.time}
						fileType={file.fileType}
						thumb={thumb}
						onClick={() => {
							const path = `${props.path}${file.name}`;
							const base64 = window.btoa(encodeURIComponent(path));
							const url = `/download/${base64}`;
							window.open(url, '_blank').focus();
						}}
					/>);
			}
			setData(sortFiles(li, fileSort.by, fileSort.descending));
		}
		worker();
	}, [props.path]);
	useEffect(() => {
		if (!data) return;
		setData(sortFiles(data, fileSort.by, fileSort.descending));
	}, [fileSort]);
	
	useEffect(() => {
		// const sort_selector = document.getElementById('sort-selector');
		// sort_selector.addEventListener('click', () => props.setSortPanel(true));

	}, [props.sortPanel]);
	return (
		<div id="directory-panel">
			<div id="sort-selector" className="float" onClick={() => toggleSortPanel({fileSort: fileSort, setFileSort: setFileSort})}>
				Sort by time
			</div>
			<div id="sort-direction" className="float" style={{'backgroundImage': 'url(/assets/down-arrow.svg)'}} onClick={() => sortDirectionSelector({fileSort: fileSort, setFileSort: setFileSort})}>
			</div>
			{data && 
				<div className="cell-container">
					{data}
				</div>
			}
		</div>
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

function FileUploader () {
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
};

export { Files, FileUploader }