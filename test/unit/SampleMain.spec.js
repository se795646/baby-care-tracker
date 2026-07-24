import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DashboardOverview from '@/views/Dashboard/Overview.vue';

describe('DashboardOverview', () => {
    it('renders the baby tracker dashboard page', () => {
        const wrapper = mount(DashboardOverview, {
            global: {
                mocks: {
                    $t:  (key) => key,
                    $tm: () => [],
                    $router: { push: () => {} }
                },
                stubs: {
                    LayoutItem: { template: '<div><slot /></div>' },
                    CameraPicker: { template: '<div />' }
                }
            }
        });

        expect(wrapper.find('h1').exists()).toBe(true);
        expect(wrapper.text()).toContain('寶寶作息記錄儀');
    });
});
