/**
 * Sample API module — copy and modify for each domain.
 *
 * Naming convention:
 *   - Actions that directly call API: suffix with "ByApi"
 *   - Example: getUserInfoByApi, updateSettingsByApi
 */
import { httpRequestApp } from './request';

export default {
    getSampleDataByApi() {
        return httpRequestApp.get('v1/sample');
    },
    updateSampleDataByApi(data) {
        return httpRequestApp.put('v1/sample', data);
    }
};
