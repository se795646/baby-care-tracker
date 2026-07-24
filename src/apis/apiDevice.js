import { httpRequestApp } from './request';
import fakeApiDevice from './fake/apiDevice';

const USE_FAKE = true;
const api = USE_FAKE ? fakeApiDevice : httpRequestApp;

export default {
    getDeviceListByApi(params) {
        return api.post('v1/device/list', params);
    }
};
