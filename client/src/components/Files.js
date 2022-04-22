import React, { useState, useEffect } from 'react';
import { get } from './http/request';
import { timestampToTime } from './utils/time';
import { uploadProgressHandler, clearProgressBar, disableUploadBtn, enableUploadBtn, setProgressBarColor, setFullProgressBar, toggleMessageBox } from './utils/dom';
import axios from 'axios';
import { MessageBox } from './MessageBox';

function File({name, time, type, onClick}) {
	let icon_src;
	switch (type) {
		case 'folder':
			icon_src = 'folder.svg';
			break;
		default:
			icon_src = 'file.svg';
	}
	icon_src = `/assets/${icon_src}`;
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
			  			const url = `/download/${base64}`;
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
	      <div className="title-right" id="upload-btn" style={{content: "url(/assets/upload.png)"}}>
	        <input id="file-upload" type="file" onChange={handleFileInput} style={{display: "none"}} />
	      </div>
      </>
    );
};

export { Files, FileUploader }