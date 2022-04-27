import { parseResponseToFiles } from './Files';
import { Uploader } from './Uploader';
import { hideSideBar } from './SideBar';
import { SearchBox, toggleSearchBox, hideSearchBox } from './SearchBox';
import { fetchHomeData } from './http/request';
import { sortFiles } from './SortPanel';

export function NavigationBlock(props) {
	const backActionHandler = async () => {
		if (document.getElementById('sidebar')) {
			hideSideBar();
		}
		else {
			if (props.path === '/') {
				hideSearchBox();
				const response = await fetchHomeData();
				const li = parseResponseToFiles(response, props);
				props.setData(sortFiles(li, props.fileSort.by, props.fileSort.descending));
				return;
			}
			let paths_copy = props.paths;
			paths_copy.shift();
			props.setPaths(paths_copy);
			props.setPath(props.paths[0]);
		}
	};
	const homeActionHandler = async () => {
		if (document.getElementById('sidebar')) {
			hideSideBar();
		}
		if (props.path === '/') {
			hideSearchBox();
			const response = await fetchHomeData();
			const li = parseResponseToFiles(response, props);
			props.setData(sortFiles(li, props.fileSort.by, props.fileSort.descending));
			return;
		}
		props.setPaths(['/']);
		props.setPath('/');
	};
	return (
		<div className="wrapper nav-block">
			<div className="left-container">
				<div className="title-left" id="back-btn" onClick={backActionHandler} style={{content: "url(/assets/back.svg)"}}></div>
				<div className="title-left" id="current-folder">
				</div>
			</div>
			<SearchBox {...props} />
			<div className="right-action-container">
				<div className="title-right" id="search-btn" onClick={toggleSearchBox} style={{content: "url(/assets/search.svg)"}}></div>
				<div className="title-right" id="home-btn" onClick={homeActionHandler} style={{content: "url(/assets/home.svg)"}}></div>
				<Uploader />
			</div>
			<div id="progress-bar"></div>
		</div>
	);
}
