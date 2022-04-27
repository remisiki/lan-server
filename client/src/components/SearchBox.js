import { get } from './http/request';
import { hideSideBar } from './SideBar';
import { sortFiles } from './SortPanel';
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

export function hideSearchBox() {
	const search_box_wrapper = document.getElementById('search-box-wrapper');
	const search_btn = document.getElementById('search-btn');
	const folder_caption = document.getElementById('current-folder');
	search_box_wrapper.classList.remove('slide-in');
	search_btn.style.content = 'url(/assets/search.svg)';
	search_btn.classList.remove('no-hover');
	folder_caption.classList.remove('hide');
}

export function toggleSearchBox() {
	const search_btn = document.getElementById('search-btn');
	const search_box_wrapper = document.getElementById('search-box-wrapper');
	const search_box = document.getElementById('search-box');
	const folder_caption = document.getElementById('current-folder');

	if (!search_box_wrapper.classList.contains('slide-in')) {
		search_box_wrapper.classList.add('slide-in');
		search_box.focus();
		search_box.select();
		search_btn.style.content = 'url(/assets/search-black.svg)';
		search_btn.classList.add('no-hover');
		folder_caption.classList.add('hide');
	}
	else {
		hideSearchBox();
	}
}