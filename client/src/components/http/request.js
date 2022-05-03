import axios from 'axios';

function getHelper(url, config) {
	return new Promise(function (resolve, reject) {
		axios.get(url, config)
			.then((response) => { resolve(response.data); })
			.catch((error) => { resolve({error: true}); });
	});
}

export async function get(url, params = {}) {
	const headers = {
		headers: {
		  // 'Authorization': `Bearer ${decrypted}`
		  'Accept': 'application/json'
		}
	};
	const config = {
		headers: headers,
		params: params
	};
	const res = await getHelper(url, config);
	return res;
}

export async function fetchHomeData() {
	const response = await fetchData('/');
	return response;
}

export async function fetchData(path) {
	const url = '/api/v1/file_list';
	const params = {
		path: path
	};
	const response = await get(url, params);
	return response;
}

export async function fetchMetaData(path) {
	const url = '/api/v1/meta';
	const params = {
		path: path
	};
	const response = await get(url, params);
	return response;
}

export async function verifyAdmin() {
	const url = '/api/v1/admin';
	const response = await get(url);
	return response.admin;
}

export async function deleteFile(base64) {
	const url = '/api/v1/delete';
	const params = {
		base64: base64
	};
	const response = await get(url, params);
	return response;
}