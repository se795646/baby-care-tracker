import { fakeRequestApp, mock } from '../request.js';
import { DEVICE_LIST } from '@/apis/fakeData/apiDevice.js';

mock.onPost('v1/device/list').reply(200, DEVICE_LIST);

export default fakeRequestApp;
