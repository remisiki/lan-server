import React, { useState, useEffect } from "react";
import { FileUploader } from './Files';

export function NavigationBlock(props) {
	const backActionHandler = () => {
		if (props.path === '/') return;
		let paths_copy = props.paths;
		paths_copy.shift();
		props.setPaths(paths_copy);
		props.setPath(props.paths[0]);
	};
	const homeActionHandler = () => {
		props.setPaths(['/']);
		props.setPath('/');
	}
	return (
		<div className="wrapper nav-block">
			<div className="left-container">
			</div>
			<div className="guide-container">
			</div>
			<div className="right-action-container">
				<div className="title-right" id="back-btn" onClick={backActionHandler} style={{content: "url(/assets/back.svg)"}}></div>
				<div className="title-right" id="home-btn" onClick={homeActionHandler} style={{content: "url(/assets/home.svg)"}}></div>
				<FileUploader />
			</div>
			<div id="progress-bar"></div>
		</div>
	);
}
