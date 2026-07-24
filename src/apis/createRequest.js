import emitter from '@/helpers/emitter';
import createHttpClient from '@/foundation/http/createHttpClient';
import AuthConfig from '@/configs/auth';
import ResultCode from '@/configs/resultCode.js';
import StorageConfig from '@/configs/storage.js';
import EventConfig from '@/configs/event';

function createRequest(baseApi) {
    return createHttpClient({
        baseURL: baseApi,
        unauthorizedStatus: ResultCode.RESULT_CODE_401_UNAUTHORIZED,
        getAccessToken: () =>
            localStorage.getItem(StorageConfig.LOCAL_KEY.TOKEN),
        setAccessToken: (token) => {
            localStorage.setItem(StorageConfig.LOCAL_KEY.TOKEN, token);
        },
        clearAccessToken: () => {
            localStorage.removeItem(StorageConfig.LOCAL_KEY.TOKEN);
            emitter.emit(EventConfig.TOKEN_EXPIRED);
        },
        refreshToken: async ({ axiosIns }) => {
            const response = await axiosIns.get(AuthConfig.TOKEN_REFRESH_PATH);
            return response.data.access_token;
        },
        resultCodeHandlers: {
            [ResultCode.RESULT_CODE_40301_TOKEN_EXPIRED]: () => {
                localStorage.removeItem(StorageConfig.LOCAL_KEY.TOKEN);
                emitter.emit(EventConfig.TOKEN_EXPIRED);
            },
            [ResultCode.RESULT_CODE_40303_NO_PERMISSION]: () => {
                emitter.emit(EventConfig.NO_PERMISSION_REDIRECT);
            }
        }
    });
}

export default createRequest;
