import React, { useState, useEffect } from 'react';
import { get } from './http/request';
import { timestampToTime } from './utils/time';

function File({name, time, type, onClick}) {
	let icon_src;
	switch (type) {
		case 'folder':
			icon_src = 'folder.svg';
			break;
		default:
			icon_src = 'file.svg';
	}
	icon_src = `http://192.168.0.112:9000/assets/${icon_src}`;
  return (
    <div className="cell" onClick={onClick}>
    	<div className="img-container">
    		<img src={icon_src} alt="" />
      </div>
      <span className="title">{name}</span>
      <br />
      <span className="content">{timestampToTime(time)}</span>
    </div>
  );
}

function Files(props) {
	const [data, setData] = useState(false);
	useEffect(() => {
		const url = 'http://192.168.0.112:9000/api/v1/file_list';
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
			  		type="folder"
			  		onClick={folderOpener}
		  		/>);
		  }
		  for (const file of response.files) {
		  	li.push(
		  		<File
			  		key={`f-${file.name}`}
			  		name={file.name}
			  		time={file.time}
			  		type="file"
			  		onClick={() => {
			  			const path = `${props.path}${file.name}`;
			  			const base64 = window.btoa(encodeURIComponent(path));
			  			const url = `http://192.168.0.112:9000/download/${base64}`;
			  			window.open(url, '_blank').focus();
			  		}}
		  		/>);
		  }
		  setData(li);
		}
		worker();
  }, [props.path]);
  return (
  	<>
  		{data && 
  			<div className="cell-container">
  				{data}
  			</div>
  		}
  	</>
	);
}

function FileUploader ({selectFile}) {
    const handleFileInput = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > (1 << 30)) {
				alert("File size cannot exceed more than 1 GB.");
      }
      else {
      	selectFile(file);
      }
    }

    return (
      <div className="title-right" id="upload-btn" onClick={() => document.getElementById('file-upload').click()}>
        <input id="file-upload" type="file" onChange={handleFileInput} style={{display: "none"}} />
      </div>
    );
};

export { Files, FileUploader }