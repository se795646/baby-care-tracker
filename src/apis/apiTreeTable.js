import { httpRequestApp } from './request';
import fakeApi from './fake/apiTreeTable';

const USE_FAKE = true;
const api = USE_FAKE ? fakeApi : httpRequestApp;

export default {
    getGroups() {
        return api.get('v1/tree-table/groups');
    },

    getDevices(params) {
        return api.post('v1/tree-table/devices', params);
    }
};
