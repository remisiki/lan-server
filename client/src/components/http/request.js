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
