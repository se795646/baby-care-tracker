/**
 * Tree + Table page — column definitions.
 * Same { KEY, TITLE_KEY } pattern as deviceTable.js.
 */
export const TREE_TABLE_COLUMNS = {
    STATUS:   { KEY: 'status',   TITLE_KEY: 'treeTable.columns.status'   },
    NAME:     { KEY: 'name',     TITLE_KEY: 'treeTable.columns.name'     },
    SERIAL:   { KEY: 'serial',   TITLE_KEY: 'treeTable.columns.serial'   },
    GROUP:    { KEY: 'group',    TITLE_KEY: 'treeTable.columns.group'    },
    MODEL:    { KEY: 'model',    TITLE_KEY: 'treeTable.columns.model'    },
    FIRMWARE: { KEY: 'firmware', TITLE_KEY: 'treeTable.columns.firmware' },
    IP:       { KEY: 'ip',       TITLE_KEY: 'treeTable.columns.ip'       }
};

export const TREE_TABLE_STATUS = {
    ONLINE:  'online',
    OFFLINE: 'offline',
    WARNING: 'warning'
};

export const TREE_TABLE_STATUS_CONFIG = {
    [TREE_TABLE_STATUS.ONLINE]:  { LABEL_KEY: 'treeTable.status.online',  color: 'success' },
    [TREE_TABLE_STATUS.OFFLINE]: { LABEL_KEY: 'treeTable.status.offline', color: 'error'   },
    [TREE_TABLE_STATUS.WARNING]: { LABEL_KEY: 'treeTable.status.warning', color: 'warning' }
};
