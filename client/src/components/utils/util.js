export function imgLoadErrorFallback(e, file_type) {
	const img = e.target;
	let icon_src;
	switch (file_type) {
		case 'image':
			icon_src = '/assets/image.svg';
			break;
		case 'video':
			icon_src = '';
			break;
		case 'audio':
			icon_src = '/assets/audio.svg';
			break;
		default:
			icon_src = '';
	}
	img.src = icon_src;
}

export function defaultImage(file_type) {
	let icon_src;
	switch (file_type) {
		case 'image':
			icon_src = '/assets/image.svg';
			break;
		case 'video':
			icon_src = '/assets/play.svg';
			break;
		case 'audio':
			icon_src = '/assets/audio.svg';
			break;
		default:
			icon_src = '/assets/file.svg';
	}
	return icon_src;
}

export function getIconOfFileType(file_type, thumb) {
	let icon_src;
	switch (file_type) {
		case 'folder':
			icon_src = '/assets/folder.svg';
			break;
		case 'image':
		case 'video':
			icon_src = `/api/v1/thumb?path=${thumb}`;
			break;
		case 'audio':
			icon_src = `/api/v1/thumb?path=${thumb}`;
			break;
		case 'binary':
			icon_src = '/assets/puzzle.svg';
			break;
		case 'pdf':
			icon_src = '/assets/pdf.svg';
			break;
		case 'archieve':
			icon_src = '/assets/archieve.svg';
			break;
		case 'msword':
			icon_src = '/assets/msword.svg';
			break;
		case 'mspowerpoint':
			icon_src = '/assets/mspowerpoint.svg';
			break;
		case 'msexcel':
			icon_src = '/assets/msexcel.svg';
			break;
		case 'code':
			icon_src = '/assets/code.svg';
			break;
		case 'file':
		default:
			icon_src = '/assets/file.svg';
	}
	return icon_src;
}
