import { fakeRequestApp, mock } from '../request.js';
import { COMMON, GET_MY_INFO } from '@/apis/fakeData/apiApp.js';

mock.onGet('v1/me/info').reply(200, GET_MY_INFO);
mock.onPost('v1/logout').reply(200, COMMON);

export default fakeRequestApp;
