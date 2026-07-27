import Routes from '@/configs/routes';

// ─── Nav item IDs ─────────────────────────────────────────────────────────────
export const NAV_ID = {
    DASHBOARD_OVERVIEW:      1,
    DASHBOARD_GROWTH:        2
};

// ─── i18n key map ─────────────────────────────────────────────────────────────
export const NAV_TITLE_KEYS = {
    HEADING_PATTERNS:        'nav.headingPatterns',
    DASHBOARD_OVERVIEW:      'nav.overview',
    DASHBOARD_GROWTH:        'nav.growth'
};

// ─── Route map ────────────────────────────────────────────────────────────────
export const NAV_ROUTE_MAP = {
    [NAV_ID.DASHBOARD_OVERVIEW]:      Routes.DASHBOARD.OVERVIEW.NAME,
    [NAV_ID.DASHBOARD_GROWTH]:        Routes.DASHBOARD.GROWTH.NAME
};

export const DEFAULT_NAV_ID = NAV_ID.DASHBOARD_OVERVIEW;

/**
 * Returns a translated navList for QHeader.
 * @param {Function} t - Vue I18n $t function
 */
export function getNavList(t) {
    return [
        {
            heading: '寶寶作息記錄',
            items: [
                { id: NAV_ID.DASHBOARD_OVERVIEW,      title: '作息概覽與記錄',      icon: 'action/dashboard', subItems: [] },
                { id: NAV_ID.DASHBOARD_GROWTH,        title: '體重與成長曲線',      icon: 'action/trending-up', subItems: [] }
            ]
        }
    ];
}

