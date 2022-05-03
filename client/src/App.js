import { useState, useEffect } from 'react';
import { NavigationBlock } from './components/NavigationBlock';
import { Files } from './components/Files';
import { ScrollHandler } from './components/utils/scroll';
import { verifyAdmin } from './components/http/request';
import { getTheme, checkThemeMode } from './components/control/dark';

function App() {
	const [data, setData] = useState(false);
	const [fileSort, setFileSort] = useState({by: "time", descending: true});
	const [admin, setAdmin] = useState(null);
	const [theme, setTheme] = useState(getTheme());
	useEffect(() => {
		async function verifyAdminWorker() {
			const isAdmin = await verifyAdmin();
			setAdmin(isAdmin);
		}
		verifyAdminWorker();
	}, []);
	useEffect(() => {
		checkThemeMode();
	}, [theme]);
	return (
		<div>
			<header>
				<NavigationBlock {...{data: data, setData: setData, fileSort: fileSort, setFileSort: setFileSort, admin: admin, theme: theme, setTheme: setTheme}}/>
			</header>
			{(admin !== null) && <Files {...{data: data, setData: setData, fileSort: fileSort, setFileSort: setFileSort, admin: admin, theme: theme, setTheme: setTheme}} />}
			<ScrollHandler />
		</div>
	);
}

export default App;
