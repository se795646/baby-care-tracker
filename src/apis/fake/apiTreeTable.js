import { fakeRequestApp, mock } from '../request.js';
import { GROUP_TREE, DEVICE_LIST } from '@/apis/fakeData/apiTreeTable.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Collect all descendant group IDs (inclusive) from the tree */
function collectGroupIds(tree, rootId) {
    const ids = new Set();

    function walk(nodes) {
        for (const node of nodes) {
            if (node.id === rootId || ids.has(node.id)) {
                // Found root or already inside — collect this and all children
                collectAll(node, ids);
            } else if (node.children?.length) {
                walk(node.children);
            }
        }
    }

    function collectAll(node, set) {
        set.add(node.id);
        node.children?.forEach((c) => collectAll(c, set));
    }

    walk(tree);
    return ids;
}

// ─── Mock endpoints ───────────────────────────────────────────────────────────

mock.onGet('v1/tree-table/groups').reply(200, GROUP_TREE);

mock.onPost('v1/tree-table/devices').reply((config) => {
    const body = JSON.parse(config.data || '{}');
    const { group_id, start = 0, length = 10 } = body;

    let filtered;
    if (!group_id || group_id === -1) {
        filtered = DEVICE_LIST;
    } else {
        const ids = collectGroupIds(GROUP_TREE.data, group_id);
        filtered = DEVICE_LIST.filter((d) => ids.has(d.groupId));
    }

    const paged = filtered.slice(start, start + length);

    return [200, {
        result_code: 200,
        records_total: filtered.length,
        data: paged
    }];
});

export default fakeRequestApp;
