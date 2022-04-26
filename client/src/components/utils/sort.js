export function sortFiles(li, sort_type, descending = true) {
	function compareFile(a, b) {
		if (a.props.fileType === "folder" && b.props.fileType !== "folder") {
			return -1;
		}
		else if (b.props.fileType === "folder" && a.props.fileType !== "folder") {
			return 1;
		}
		else if (sort_type === "type") {
			const ext_a = a.props.name.slice(a.props.name.lastIndexOf('.') + 1, a.props.name.length);
			const ext_b = b.props.name.slice(b.props.name.lastIndexOf('.') + 1, b.props.name.length);
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
