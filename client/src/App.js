import { useState, useEffect } from 'react';
import { NavigationBlock } from './components/NavigationBlock';
import { Files } from './components/Files';
import { ScrollHandler } from './components/utils/scroll';

function App() {
	const [path, setPath] = useState('/');
	const [paths, setPaths] = useState(['/']);
	const [data, setData] = useState(false);
	const [fileSort, setFileSort] = useState({by: "time", descending: true});
	return (
		<div>
			<header>
				{path && <NavigationBlock {...{path: path, setPath: setPath, paths: paths, setPaths: setPaths, data: data, setData: setData, fileSort: fileSort, setFileSort: setFileSort}}/>}
			</header>
			{path && <Files {...{path: path, setPath: setPath, paths: paths, setPaths: setPaths, data: data, setData: setData, fileSort: fileSort, setFileSort: setFileSort}} />}
			<ScrollHandler />
		</div>
	);
}

export default App;
