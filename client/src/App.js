import { useState, useEffect } from 'react';
import { NavigationBlock } from './components/NavigationBlock';
import { Files } from './components/Files';

function App() {
  const [path, setPath] = useState('/');
  const [paths, setPaths] = useState(['/']);
  return (
    <>
      <header>
        {path && <NavigationBlock {...{path: path, setPath: setPath, paths: paths, setPaths: setPaths}}/>}
      </header>
      {path && <Files {...{path: path, setPath: setPath, paths: paths, setPaths: setPaths}} />}
    </>
  );
}

export default App;
