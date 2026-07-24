import StorageConfig from '@/configs/storage';
import apiApp from '@/apis/apiApp';

export default {
    namespaced: true,
    state: () => ({
        isInfoReady: false,
        isLogin: false,
        memberId: '',
        member: {}
    }),
    getters: {
        isInfoReady: (state) => state.isInfoReady,
        isLogin: (state) => state.isLogin,
        memberId: (state) => state.memberId,
        member: (state) => state.member
    },
    mutations: {
        setIsInfoReady(state, value) {
            state.isInfoReady = value;
        },
        setIsLogin(state, value) {
            state.isLogin = value;
        },
        setMemberId(state, value) {
            state.memberId = value;
        },
        setMember(state, value) {
            state.member = value;
        }
    },
    actions: {
        async getMyInfoByApi({ commit }) {
            commit('setMember', { name: '寶寶爸媽', email: 'parents@babytracker.com', id: 'parent-1' });
            commit('setMemberId', 'parent-1');
            commit('setIsLogin', true);
            commit('setIsInfoReady', true);
        },
        logout({ commit }) {
            apiApp.logoutByApi().catch(() => {});
            localStorage.removeItem(StorageConfig.LOCAL_KEY.TOKEN);
            localStorage.removeItem(StorageConfig.LOCAL_KEY.MEMBER_ID);
            commit('setIsLogin', false);
            commit('setMember', {});
        }
    }
};
