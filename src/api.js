export function fetchData() {
	const apiUrl = 'https://scheduler-challenge.herokuapp.com/schedule';
	var proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // dev proxy
  
	return fetch(proxyUrl + apiUrl)
	.then(response => response.json())
	.catch(e => {
	  console.log('There was an issue loading event data: ', e);
	});
}