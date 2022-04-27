export function toggleSortPanel(props) {
	const directory_panel = document.getElementById('directory-panel');
	let sort_panel = document.getElementById('sort-panel');
	if (!sort_panel) {
		sort_panel = document.createElement('div');
		sort_panel.id = 'sort-panel';
		sort_panel.classList.add('float');

		const sort_options = ['time', 'name', 'type'];
		for (const option of sort_options) {
			const sort_option = createSortOption(option, props);
			sort_panel.appendChild(sort_option);
		}

		directory_panel.appendChild(sort_panel);

		setTimeout(() => {
			sort_panel.classList.add('slide-in');
		}, 0);
	}
	else {
		sort_panel.classList.remove('slide-in');
		setTimeout(() => {
			sort_panel.remove();
		}, 200);
	}
}

function createSortOption(name, props) {
	const option_container = document.createElement('div');
	const before_option = document.createElement('div');
	const sort_option = document.createElement('div');

	option_container.classList.add('option-container');
	before_option.classList.add('before-option');
	if (name === props.fileSort.by) {
		before_option.style.backgroundImage = 'url(/assets/select.svg)';
	}

	sort_option.innerText = `Sort by ${name}`;
	sort_option.classList.add('option');

	option_container.id = `sort-by-${name}`;
	option_container.appendChild(before_option);
	option_container.appendChild(sort_option);
	option_container.addEventListener('click', () => {
		setOptionSelected(name, props);
	});

	return option_container;
}

function setOptionSelected(name, props) {
	const sort_panel = document.getElementById('sort-panel');
	const sort_selector = document.getElementById('sort-selector');
	for (const sort_option of sort_panel.childNodes) {
		const before_option = sort_option.getElementsByClassName('before-option')[0];
		if (`sort-by-${name}` === sort_option.id) {
			before_option.style.backgroundImage = 'url(/assets/select.svg)';
		}
		else {
			before_option.style.backgroundImage = '';
		}
	}
	props.setFileSort({by: name, descending: props.fileSort.descending});
	sort_selector.innerText = `Sort by ${name}`;
	toggleSortPanel(props);
}

export function sortDirectionSelector(props) {
	const sort_direction = document.getElementById('sort-direction');
	sort_direction.classList.toggle('reverse-z');
	props.setFileSort({by: props.fileSort.by, descending: !props.fileSort.descending});
}

export function sortFiles(li, sort_type, descending = true) {
	function compareFile(a, b) {
		if (a.props.fileType === "folder" && b.props.fileType !== "folder") {
			return -1;
		}
		else if (b.props.fileType === "folder" && a.props.fileType !== "folder") {
			return 1;
		}
		else if (sort_type === "type") {
			const ext_a = a.props.name.slice(a.props.name.lastIndexOf('.') + 1, a.props.name.length).toLowerCase();
			const ext_b = b.props.name.slice(b.props.name.lastIndexOf('.') + 1, b.props.name.length).toLowerCase();
			if (ext_a < ext_b) {
				return (descending) ? 1 : -1;
			}
			else if (ext_a > ext_b) {
				return (descending) ? -1 : 1;
			}
			else {
				return 0;
			}
		}
		else if (sort_type === "name") {
			const str_a = a.props.name.toLowerCase();
			const str_b = b.props.name.toLowerCase();
			if (str_a < str_b) {
				return (descending) ? 1 : -1;
			}
			else if (str_a > str_b) {
				return (descending) ? -1 : 1;
			}
			else {
				return 0;
			}
		}
		else {
			if (a.props[sort_type] < b.props[sort_type]) {
				return (descending) ? 1 : -1;
			}
			else if (a.props[sort_type] > b.props[sort_type]) {
				return (descending) ? -1 : 1;
			}
			else {
				return 0;
			}
		}
	}
	const li_cp = [...li];
	li_cp.sort(compareFile);
	return li_cp;
}
