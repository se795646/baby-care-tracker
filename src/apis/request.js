import createRequest from './createRequest';

// TODO: Replace with your API base URL (or inject from APP_CONFIG)
const API_BASE_URL = '/api/';

const { httpRequestApp, fakeRequestApp, mock, axiosOutside } =
    createRequest(API_BASE_URL);

export { httpRequestApp, fakeRequestApp, mock, axiosOutside };
