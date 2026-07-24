// ─── Group tree (hierarchical) ────────────────────────────────────────────────
export const GROUP_TREE = {
    result_code: 200,
    data: [
        {
            id: 1, displayName: 'Taiwan HQ', deviceCount: 18,
            children: [
                {
                    id: 11, displayName: 'Taipei Office', deviceCount: 10,
                    children: [
                        { id: 111, displayName: 'Engineering', deviceCount: 5, children: [] },
                        { id: 112, displayName: 'Marketing',   deviceCount: 3, children: [] },
                        { id: 113, displayName: 'Sales',       deviceCount: 2, children: [] }
                    ]
                },
                {
                    id: 12, displayName: 'Hsinchu Lab', deviceCount: 8,
                    children: [
                        { id: 121, displayName: 'R&D',         deviceCount: 5, children: [] },
                        { id: 122, displayName: 'QA',          deviceCount: 3, children: [] }
                    ]
                }
            ]
        },
        {
            id: 2, displayName: 'Singapore Branch', deviceCount: 7,
            children: [
                { id: 21, displayName: 'Main Office',  deviceCount: 4, children: [] },
                { id: 22, displayName: 'Remote Team',  deviceCount: 3, children: [] }
            ]
        },
        {
            id: 3, displayName: 'Japan Office', deviceCount: 6,
            children: [
                { id: 31, displayName: 'Tokyo HQ',   deviceCount: 4, children: [] },
                { id: 32, displayName: 'Osaka Team', deviceCount: 2, children: [] }
            ]
        }
    ]
};

// ─── Device list (flat, each item belongs to a leaf group) ───────────────────
export const DEVICE_LIST = [
    // Engineering (111)
    { id: 1,  name: 'BenQ Board RP8603',  groupId: 111, groupName: 'Engineering', status: 'online',  model: 'RP8603', ip: '10.1.1.1',  serial: 'TW-ENG-0001', firmware: '3.1.0.220' },
    { id: 2,  name: 'BenQ Board RM7503',  groupId: 111, groupName: 'Engineering', status: 'online',  model: 'RM7503', ip: '10.1.1.2',  serial: 'TW-ENG-0002', firmware: '2.8.4.110' },
    { id: 3,  name: 'BenQ Board IL430',   groupId: 111, groupName: 'Engineering', status: 'offline', model: 'IL430',  ip: '10.1.1.3',  serial: 'TW-ENG-0003', firmware: '1.5.2.034' },
    { id: 4,  name: 'BenQ Display SL550', groupId: 111, groupName: 'Engineering', status: 'warning', model: 'SL550',  ip: '10.1.1.4',  serial: 'TW-ENG-0004', firmware: '2.0.1.198' },
    { id: 5,  name: 'BenQ Board RP8603',  groupId: 111, groupName: 'Engineering', status: 'online',  model: 'RP8603', ip: '10.1.1.5',  serial: 'TW-ENG-0005', firmware: '3.1.0.220' },
    // Marketing (112)
    { id: 6,  name: 'BenQ Board RP6502',  groupId: 112, groupName: 'Marketing',   status: 'online',  model: 'RP6502', ip: '10.1.2.1',  serial: 'TW-MKT-0001', firmware: '3.0.9.215' },
    { id: 7,  name: 'BenQ Display SL460', groupId: 112, groupName: 'Marketing',   status: 'online',  model: 'SL460',  ip: '10.1.2.2',  serial: 'TW-MKT-0002', firmware: '1.9.3.077' },
    { id: 8,  name: 'BenQ Board RM7503',  groupId: 112, groupName: 'Marketing',   status: 'offline', model: 'RM7503', ip: '10.1.2.3',  serial: 'TW-MKT-0003', firmware: '2.8.4.110' },
    // Sales (113)
    { id: 9,  name: 'BenQ Board IL430',   groupId: 113, groupName: 'Sales',       status: 'online',  model: 'IL430',  ip: '10.1.3.1',  serial: 'TW-SAL-0001', firmware: '1.5.2.034' },
    { id: 10, name: 'BenQ Board RP6502',  groupId: 113, groupName: 'Sales',       status: 'warning', model: 'RP6502', ip: '10.1.3.2',  serial: 'TW-SAL-0002', firmware: '3.0.9.215' },
    // R&D (121)
    { id: 11, name: 'BenQ Board RP8603',  groupId: 121, groupName: 'R&D',         status: 'online',  model: 'RP8603', ip: '10.2.1.1',  serial: 'TW-RND-0001', firmware: '3.1.0.220' },
    { id: 12, name: 'BenQ Board RP8603',  groupId: 121, groupName: 'R&D',         status: 'online',  model: 'RP8603', ip: '10.2.1.2',  serial: 'TW-RND-0002', firmware: '3.1.0.220' },
    { id: 13, name: 'BenQ Board IL430',   groupId: 121, groupName: 'R&D',         status: 'offline', model: 'IL430',  ip: '10.2.1.3',  serial: 'TW-RND-0003', firmware: '1.5.2.034' },
    { id: 14, name: 'BenQ Display SL550', groupId: 121, groupName: 'R&D',         status: 'online',  model: 'SL550',  ip: '10.2.1.4',  serial: 'TW-RND-0004', firmware: '2.0.1.198' },
    { id: 15, name: 'BenQ Board RM7503',  groupId: 121, groupName: 'R&D',         status: 'warning', model: 'RM7503', ip: '10.2.1.5',  serial: 'TW-RND-0005', firmware: '2.8.4.110' },
    // QA (122)
    { id: 16, name: 'BenQ Board RP6502',  groupId: 122, groupName: 'QA',          status: 'online',  model: 'RP6502', ip: '10.2.2.1',  serial: 'TW-QA-0001',  firmware: '3.0.9.215' },
    { id: 17, name: 'BenQ Board IL430',   groupId: 122, groupName: 'QA',          status: 'online',  model: 'IL430',  ip: '10.2.2.2',  serial: 'TW-QA-0002',  firmware: '1.5.2.034' },
    { id: 18, name: 'BenQ Display SL460', groupId: 122, groupName: 'QA',          status: 'offline', model: 'SL460',  ip: '10.2.2.3',  serial: 'TW-QA-0003',  firmware: '1.9.3.077' },
    // Main Office SG (21)
    { id: 19, name: 'BenQ Board RP8603',  groupId: 21,  groupName: 'Main Office', status: 'online',  model: 'RP8603', ip: '172.16.1.1', serial: 'SG-MO-0001',  firmware: '3.1.0.220' },
    { id: 20, name: 'BenQ Board RM7503',  groupId: 21,  groupName: 'Main Office', status: 'online',  model: 'RM7503', ip: '172.16.1.2', serial: 'SG-MO-0002',  firmware: '2.8.4.110' },
    { id: 21, name: 'BenQ Board IL430',   groupId: 21,  groupName: 'Main Office', status: 'warning', model: 'IL430',  ip: '172.16.1.3', serial: 'SG-MO-0003',  firmware: '1.5.2.034' },
    { id: 22, name: 'BenQ Display SL550', groupId: 21,  groupName: 'Main Office', status: 'online',  model: 'SL550',  ip: '172.16.1.4', serial: 'SG-MO-0004',  firmware: '2.0.1.198' },
    // Remote Team SG (22)
    { id: 23, name: 'BenQ Board RP6502',  groupId: 22,  groupName: 'Remote Team', status: 'online',  model: 'RP6502', ip: '172.16.2.1', serial: 'SG-RT-0001',  firmware: '3.0.9.215' },
    { id: 24, name: 'BenQ Board RM7503',  groupId: 22,  groupName: 'Remote Team', status: 'offline', model: 'RM7503', ip: '172.16.2.2', serial: 'SG-RT-0002',  firmware: '2.8.4.110' },
    { id: 25, name: 'BenQ Board IL430',   groupId: 22,  groupName: 'Remote Team', status: 'online',  model: 'IL430',  ip: '172.16.2.3', serial: 'SG-RT-0003',  firmware: '1.5.2.034' },
    // Tokyo HQ (31)
    { id: 26, name: 'BenQ Board RP8603',  groupId: 31,  groupName: 'Tokyo HQ',   status: 'online',  model: 'RP8603', ip: '192.168.1.1', serial: 'JP-TK-0001',  firmware: '3.1.0.220' },
    { id: 27, name: 'BenQ Board RM7503',  groupId: 31,  groupName: 'Tokyo HQ',   status: 'online',  model: 'RM7503', ip: '192.168.1.2', serial: 'JP-TK-0002',  firmware: '2.8.4.110' },
    { id: 28, name: 'BenQ Display SL550', groupId: 31,  groupName: 'Tokyo HQ',   status: 'warning', model: 'SL550',  ip: '192.168.1.3', serial: 'JP-TK-0003',  firmware: '2.0.1.198' },
    { id: 29, name: 'BenQ Board IL430',   groupId: 31,  groupName: 'Tokyo HQ',   status: 'online',  model: 'IL430',  ip: '192.168.1.4', serial: 'JP-TK-0004',  firmware: '1.5.2.034' },
    // Osaka Team (32)
    { id: 30, name: 'BenQ Board RP6502',  groupId: 32,  groupName: 'Osaka Team', status: 'online',  model: 'RP6502', ip: '192.168.2.1', serial: 'JP-OS-0001',  firmware: '3.0.9.215' },
    { id: 31, name: 'BenQ Display SL460', groupId: 32,  groupName: 'Osaka Team', status: 'offline', model: 'SL460',  ip: '192.168.2.2', serial: 'JP-OS-0002',  firmware: '1.9.3.077' }
];
