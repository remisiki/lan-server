import { useState, useEffect } from 'react';
import { NavigationBlock } from './components/NavigationBlock';
import { Files } from './components/Files';

function App() {
	const [path, setPath] = useState('/');
	const [paths, setPaths] = useState(['/']);
	const [sortPanel, setSortPanel] = useState(false);
	return (
		<div onClick={() => setSortPanel(false)}>
			<header>
				{path && <NavigationBlock {...{path: path, setPath: setPath, paths: paths, setPaths: setPaths}}/>}
			</header>
			{path && <Files {...{path: path, setPath: setPath, paths: paths, setPaths: setPaths, sortPanel: sortPanel, setSortPanel: setSortPanel}} />}
		</div>
	);
}

export default App;
