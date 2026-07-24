import { createStore } from 'vuex';
import personal from './modules/personal';
import common from './modules/common';

export default createStore({
    modules: {
        personal,
        common
    }
});
