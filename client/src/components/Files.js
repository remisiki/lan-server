import React, { useState, useEffect } from 'react';
import { imgLoadErrorFallback, getIconOfFileType } from './utils/util';
import { trim, hashToPath } from './utils/format';
import { createSideBar, hideSideBar } from './SideBar';
import { hideSearchBox } from './SearchBox';
import { toggleSortPanel, sortDirectionSelector, sortFiles } from './SortPanel';
import { fetchData } from './http/request';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function File({name, time, fileType, thumb, onClick}) {
	const icon_src = getIconOfFileType(fileType, thumb);
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
		</div>
	);
}

function hashChangeHandler(props) {
	hideSideBar();
	hideSearchBox();
	setPathDisplay();
	refreshPage(props);
}

export function Files(props) {
	useEffect(() => {
		window.addEventListener('hashchange', () => {
			hashChangeHandler(props);
		});
		hashChangeHandler(props);
	}, []);
	useEffect(() => {
		if (!props.data) return;
		props.setData(sortFiles(props.data, props.fileSort.by, props.fileSort.descending));
	}, [props.fileSort]);
	return (
		<div id="directory-panel">
			<div id="sort-selector" className="float" onClick={() => toggleSortPanel({fileSort: props.fileSort, setFileSort: props.setFileSort, theme: props.theme})}>
				Sort by time
			</div>
			<div id="sort-direction" className="float" style={{'backgroundImage': `url(/assets/down-arrow${(props.theme === 'dark') ? '-white' : ''}.svg)`}} onClick={() => sortDirectionSelector({fileSort: props.fileSort, setFileSort: props.setFileSort})} />
			<div id="right-control-panel">
				<img
					id="refresh-btn"
					src="/assets/refresh.svg"
					onClick={() => {
						hideSideBar();
						refreshPage(props);
					}}
					alt="reload"
				/>
			</div>
			{props.data && 
				<div className="cell-container">
					{props.data}
				</div>
			}
		</div>
	);
}

export function parseResponseToFiles(response, props) {
	let li = [];
	if (response.empty) {
		return li;
	}
	if (response.folders) {
		for (const folder of response.folders) {
			const folderOpener = () => {
				window.location.hash += `${folder.name}/`;
			};
			li.push(
				<File
					key={`d-${folder.name}`}
					name={folder.alias ?? folder.name}
					time={folder.time}
					fileType="folder"
					onClick={folderOpener}
				/>);
		}
	}
	if (response.files) {
		for (const file of response.files) {
			const thumb = (file.thumb) ? (file.thumb) : null;
			li.push(
				<File
					key={`f-${file.name}-${file.path}`}
					name={file.name}
					time={file.time}
					fileType={file.fileType}
					thumb={thumb}
					onClick={(e) => {
						createSideBar(file, props);
						setFileSelected(e);
					}}
				/>);
		}
	}
	return li;
}

export function showNarrowFilePanel() {
	const cells = document.getElementsByClassName('cell');
	const cell_containers = document.getElementsByClassName('cell-container');
	const top_btn = document.getElementById('totop');
	const right_control_panel = document.getElementById('right-control-panel');
	for (const cell of cells) {
		cell.classList.add('narrow');
	}
	for (const cell_container of cell_containers) {
		cell_container.classList.add('narrow');
	}
	top_btn.classList.add('narrow');
	right_control_panel.classList.add('narrow');
}

export function hideNarrowFilePanel() {
	const cells = document.getElementsByClassName('cell');
	const cell_containers = document.getElementsByClassName('cell-container');
	const top_btn = document.getElementById('totop');
	const right_control_panel = document.getElementById('right-control-panel');
	for (const cell of cells) {
		cell.classList.remove('narrow');
	}
	for (const cell_container of cell_containers) {
		cell_container.classList.remove('narrow');
	}
	top_btn.classList.remove('narrow');
	right_control_panel.classList.remove('narrow');
}

export function setFileSelected(e) {
	const files = e.currentTarget.parentNode.children;
	for (const file of files) {
		if (file === e.currentTarget) {
			file.classList.add('selected');
		}
		else {
			file.classList.remove('selected');
		}
	}
}

export function clearFileSelected() {
	const selected_files = document.querySelectorAll('.cell.selected');
	for (const file of selected_files) {
		file.classList.remove('selected');
	}
}

export async function refreshPage(props) {
	const path = hashToPath();
	const response = await fetchData(path);
	const li = parseResponseToFiles(response, props);
	props.setData(sortFiles(li, props.fileSort.by, props.fileSort.descending));
}

function setPathDisplay() {
	const path = hashToPath();
	let folder_name = trim(path);
	if (folder_name) {
		folder_name = folder_name.slice(folder_name.lastIndexOf('/') + 1, folder_name.length);
	}
	else {
		folder_name = 'share';
	}
	document.getElementById('current-folder').innerText = folder_name;
}