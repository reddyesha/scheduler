import moment from 'moment';

export function formatDate(timestamp) {
	return moment(new Date(timestamp)).format('dddd, MMMM Do YYYY, h:mm:ss a')
}