import { get } from './http/request';
import { createSideBar, setFileSelected, hideSideBar } from './utils/dom';
import { sortFiles } from './utils/sort';
import { parseResponseToFiles } from './Files';

async function searchHandler(e, props) {
	if (e.keyCode === 13) {
		e.preventDefault();
		const search_qs = document.getElementById('search-box').value;
		if (!search_qs) return;
		hideSideBar();
		const url = '/api/v1/file_list';
		const params = {
			path: props.path,
			search: encodeURIComponent(search_qs)
		};
		const response = await get(url, params);
		const li = parseResponseToFiles(response, props);
		props.setData(sortFiles(li, props.fileSort.by, props.fileSort.descending));
		return false;
	}
}

export function SearchBox(props) {
	return (
		<div id="search-box-wrapper">
			<input
				id="search-box"
				className="no-scroll-bar"
				onKeyDown={(e) => searchHandler(e, props)}
			/>
		</div>
	);
}