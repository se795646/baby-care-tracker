/**
 * Device Table configuration — column definitions, status mapping, and defaults.
 *
 * Pattern (from License Hub):
 *   Each column entry has both KEY (data field name) and TITLE_KEY (i18n key).
 *   In the component, build headers with: { title: this.$t(col.TITLE_KEY), key: col.KEY }
 *   This keeps configs data-only; translation happens at render time in the component.
 */

// ─── Column definitions ────────────────────────────────────────────────────────
export const DEVICE_COLUMNS = {
    STATUS:     { KEY: 'status',      TITLE_KEY: 'deviceList.columns.status'    },
    NAME:       { KEY: 'name',        TITLE_KEY: 'deviceList.columns.name'      },
    MODEL:      { KEY: 'model_name',  TITLE_KEY: 'deviceList.columns.model'     },
    SERIAL:     { KEY: 'serial',      TITLE_KEY: 'deviceList.columns.serial'    },
    IP:         { KEY: 'ip_addr',     TITLE_KEY: 'deviceList.columns.ip'        },
    MAC:        { KEY: 'mac_address', TITLE_KEY: 'deviceList.columns.mac'       },
    GROUP:      { KEY: 'group_name',  TITLE_KEY: 'deviceList.columns.group'     },
    UPDATED_AT: { KEY: 'updated_at',  TITLE_KEY: 'deviceList.columns.updatedAt' },
    ACTION:     { KEY: 'action',      TITLE_KEY: ''                             }
};

// ─── Device status codes ───────────────────────────────────────────────────────
export const DEVICE_STATUS = {
    OFFLINE: 0,
    STANDBY: 1,
    ONLINE:  2
};

// ─── Status display mapping ────────────────────────────────────────────────────
// LABEL_KEY: i18n key for the status label (translated in component via $t)
export const STATUS_CONFIG = {
    [DEVICE_STATUS.OFFLINE]: {
        LABEL_KEY:  'deviceList.status.offline',
        badgeColor: 'bq-color-status-offline',
        dotColor:   'gray'
    },
    [DEVICE_STATUS.STANDBY]: {
        LABEL_KEY:  'deviceList.status.standby',
        badgeColor: 'bq-color-status-standby',
        dotColor:   'fuel-yellow'
    },
    [DEVICE_STATUS.ONLINE]: {
        LABEL_KEY:  'deviceList.status.online',
        badgeColor: 'bq-color-status-online',
        dotColor:   'ocean-green'
    }
};

// ─── Pagination defaults ───────────────────────────────────────────────────────
export const TABLE_DEFAULTS = {
    ITEMS_PER_PAGE:         25,
    ITEMS_PER_PAGE_OPTIONS: [10, 25, 50, 100],
    DEFAULT_SORT:           [{ key: DEVICE_COLUMNS.NAME.KEY, order: 'asc' }]
};
