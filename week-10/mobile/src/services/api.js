import axios from 'axios';
import config from '../constants/config';

const api = axios.create({
	baseURL: config.backend_url
});

export default api;