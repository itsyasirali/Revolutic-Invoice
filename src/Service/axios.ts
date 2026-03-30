import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true; // This is crucial for sending cookies
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {

        // Handle specific error cases
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

        if (error.response?.status === 404) {
            console.error('Resource not found (404)');
        } else if (error.response?.status === 401) {
            console.error('Unauthorized (401)');
        } else if (error.response?.status === 500) {
            console.error('Internal Server Error (500)');
        }

        // Show error to user (you might want to use a toast here instead of alert in a real app)
        if (error.response?.status !== 401) { // Optionally skip alert for 401 if it triggers a redirect
            alert(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default axios;
