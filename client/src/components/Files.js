import React, { useState, useEffect } from 'react';
import { get } from './http/request';
import { imgLoadErrorFallback, getIconOfFileType } from './utils/util';
import { createSideBar, hideSideBar } from './SideBar';
import { hideSearchBox } from './SearchBox';
import { toggleSortPanel, sortDirectionSelector, sortFiles } from './SortPanel';

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

export function Files(props) {
	useEffect(() => {
		hideSideBar();
		hideSearchBox();
		const url = '/api/v1/file_list';
		const params = {
			path: props.path
		};
		const worker = async () => {
			const response = await get(url, params);
			const li = parseResponseToFiles(response, props);
			props.setData(sortFiles(li, props.fileSort.by, props.fileSort.descending));
		}
		worker();
	}, [props.path]);
	useEffect(() => {
		if (!props.data) return;
		props.setData(sortFiles(props.data, props.fileSort.by, props.fileSort.descending));
	}, [props.fileSort]);
	
	useEffect(() => {
		// const sort_selector = document.getElementById('sort-selector');
		// sort_selector.addEventListener('click', () => props.setSortPanel(true));

	}, [props.sortPanel]);
	return (
		<div id="directory-panel">
			<div id="sort-selector" className="float" onClick={() => toggleSortPanel({fileSort: props.fileSort, setFileSort: props.setFileSort})}>
				Sort by time
			</div>
			<div id="sort-direction" className="float" style={{'backgroundImage': 'url(/assets/down-arrow.svg)'}} onClick={() => sortDirectionSelector({fileSort: props.fileSort, setFileSort: props.setFileSort})}>
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
	}
	if (response.files) {
		for (const file of response.files) {
			const thumb = (file.thumb) ? (file.thumb) : null;
			const downloadAction = () => {
				const path = `${props.path}${file.name}`;
				const base64 = window.btoa(encodeURIComponent(path));
				const url = `/download/${base64}`;
				window.open(url, '_blank').focus();
			};
			li.push(
				<File
					key={`f-${file.name}-${file.path}`}
					name={file.name}
					time={file.time}
					fileType={file.fileType}
					thumb={thumb}
					onClick={(e) => {
						createSideBar(file, downloadAction);
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
	for (const cell of cells) {
		cell.classList.add('narrow');
	}
	for (const cell_container of cell_containers) {
		cell_container.classList.add('narrow');
	}
	top_btn.classList.add('narrow');
}

export function hideNarrowFilePanel() {
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
