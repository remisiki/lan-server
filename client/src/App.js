import { useState, useEffect } from 'react';
import { NavigationBlock } from './components/NavigationBlock';
import { Files } from './components/Files';
import { ScrollHandler } from './components/utils/scroll';

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
			<ScrollHandler />
		</div>
	);
}

export default App;
