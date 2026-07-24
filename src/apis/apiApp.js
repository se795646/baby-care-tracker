import { httpRequestApp } from './request';

// TODO: Switch to httpRequestApp when real API is ready
// For now, use fake API
import fakeApiApp from './fake/apiApp';

const USE_FAKE = true;
const api = USE_FAKE ? fakeApiApp : httpRequestApp;

export default {
    getMyInfoByApi() {
        return api.get('v1/me/info');
    },
    logoutByApi() {
        return api.post('v1/logout');
    }
};
