import { parseResponseToFiles } from './Files';
import { Uploader } from './Uploader';
import { hideSideBar, createSettingSideBar } from './SideBar';
import { SearchBox, toggleSearchBox, hideSearchBox } from './SearchBox';
import { fetchHomeData } from './http/request';
import { sortFiles } from './SortPanel';

export function NavigationBlock(props) {
	const backActionHandler = () => {
		if (document.getElementById('sidebar')) {
			hideSideBar();
		}
		else {
			window.history.back();
		}
	};
	const homeActionHandler = () => {
		window.location.hash = '';
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
				<div className="title-right" id="setting-btn" onClick={() => createSettingSideBar(props)} style={{content: "url(/assets/setting.svg)"}}></div>
				<Uploader />
			</div>
			<div id="progress-bar"></div>
		</div>
	);
}
