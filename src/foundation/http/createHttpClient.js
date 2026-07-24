import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

function createApiApp(request) {
    return {
        get(url, params, headers, isBlob, getRaw = false) {
            const config = {
                method: 'get',
                url,
                params: params || {},
                headers: headers || {}
            };

            if (isBlob) {
                config.responseType = 'blob';
            }

            return request(config).then((response) =>
                getRaw ? response : response.data
            );
        },
        post(url, data, headers, getRaw = false) {
            return request({
                method: 'post',
                url,
                data: data || {},
                headers: headers || {}
            }).then((response) => (getRaw ? response : response.data));
        },
        put(url, data, headers, getRaw = false) {
            return request({
                method: 'put',
                url,
                data: data || {},
                headers: headers || {}
            }).then((response) => (getRaw ? response : response.data));
        },
        delete(url, data, headers, getRaw = false) {
            return request({
                method: 'delete',
                url,
                data: data || {},
                headers: headers || {}
            }).then((response) => (getRaw ? response : response.data));
        }
    };
}

function backoff(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay || 1));
}

export default function createHttpClient({
    baseURL,
    getAccessToken,
    setAccessToken,
    clearAccessToken,
    unauthorizedStatus = 401,
    refreshToken,
    resultCodeHandlers = {},
    maxRetry = 3,
    retryDelay = 1000
}) {
    const axiosIns = axios.create({ baseURL });
    const fakeAxiosIns = axios.create({ baseURL });
    const axiosOutside = axios.create();
    const mock = new MockAdapter(fakeAxiosIns);

    axiosIns.interceptors.request.use(
        (config) => {
            const token = getAccessToken?.();

            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    axiosIns.defaults.MAX_RETRY = maxRetry;
    axiosIns.defaults.RETRY_DELAY = retryDelay;

    const handleResultCode = async (resultCode, payload) => {
        const handler = resultCodeHandlers[resultCode];

        if (handler) {
            await handler(payload);
        }
    };

    axiosIns.interceptors.response.use(
        async (response) => {
            const resultCode = response?.data?.result_code;

            if (resultCode) {
                await handleResultCode(resultCode, { response });
            }

            return response;
        },
        async (error) => {
            const originalRequest = error.config || {};
            originalRequest._retryCount = originalRequest._retryCount || 0;

            const response = error.response;
            const status = response?.status;
            const isBadRequest = response ? status < 500 : false;
            const needRetry =
                originalRequest._retryCount < originalRequest.MAX_RETRY &&
                !isBadRequest;

            if (needRetry) {
                originalRequest._retryCount += 1;
                await backoff(originalRequest.RETRY_DELAY);
                return axiosIns(originalRequest);
            }

            if (
                status === unauthorizedStatus &&
                !originalRequest._retry &&
                refreshToken
            ) {
                originalRequest._retry = true;

                try {
                    const nextToken = await refreshToken({
                        axiosIns,
                        error,
                        originalRequest
                    });

                    if (nextToken) {
                        setAccessToken?.(nextToken);
                        await backoff(originalRequest.RETRY_DELAY);
                        return axiosIns(originalRequest);
                    }
                } catch (refreshError) {
                    clearAccessToken?.();
                    return Promise.reject(refreshError);
                }

                clearAccessToken?.();
            }

            const resultCode = response?.data?.result_code;
            if (resultCode) {
                await handleResultCode(resultCode, { error, response });
            }

            return Promise.reject(error);
        }
    );

    return {
        httpRequestApp: createApiApp(axiosIns),
        fakeRequestApp: createApiApp(fakeAxiosIns),
        mock,
        axiosIns,
        axiosOutside
    };
}
