import React, { useState, useEffect } from "react";
import { FileUploader } from './Files';
import axios from 'axios';

function NavigationBlock(props) {
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
  const [selected_file, setSelectedFile] = useState(null);
  useEffect(() => {
    if (!selected_file) return;
    const name = window.btoa(encodeURIComponent(selected_file.name));
    const size = selected_file.size;
    const interval = (1 << 20);
    let sent = 0;
    const sendFilePart = async () => {
      while (sent < size) {
        const form_data = new FormData();
        const next = (sent + interval > size) ? (size + 1) : (sent + interval);
        const done = (next > size);
        const file_part = selected_file.slice(sent, next);
        form_data.append("name", name);
        form_data.append("file", file_part);
        form_data.append("done", done);
        await axios
          .post('/', form_data)
          .then((res) => {
            sent = next;
            console.log(`${sent - 1}/${size} sent.`);
          })
          .catch((err) => {
            alert("File Upload Error");
          });
      }
    };
    sendFilePart();
  }, [selected_file]);
  return (
    <div className="wrapper nav-block">
      <div className="left-container">
      </div>
      <div className="guide-container">
      </div>
      <div className="right-action-container">
        <div className="title-right" id="back-btn" onClick={backActionHandler}></div>
        <div className="title-right" id="home-btn" onClick={homeActionHandler}></div>
        <FileUploader
          selectFile={(file) => setSelectedFile(file)}
        />
      </div>
    </div>
  );
}

export { NavigationBlock };