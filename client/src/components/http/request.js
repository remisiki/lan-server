import axios from 'axios';

function getHelper(url, config) {
	return new Promise(function (resolve, reject) {
		axios.get(url, config)
			.then((response) => { resolve(response.data); })
			.catch((error) => { reject(error); });
	});
}

export async function get(url, params) {
	const headers = {
		// headers: {
		//   'Authorization': `Bearer ${decrypted}`
		// }
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