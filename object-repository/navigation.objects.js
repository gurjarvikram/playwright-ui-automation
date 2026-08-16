/**
 * Navigation drawer.
 *
 * Documented exception to the data-test rule, and worth reading before changing anything
 * here. The drawer is rendered by react-burger-menu, a third party. Its open/close controls
 * carry `data-test="open-menu"` and `data-test="close-menu"` on a decorative <img>, while
 * the real control is a transparent sibling <button> stretched over the whole icon. Driving
 * the img therefore fails every time: the button sits above it and intercepts the click.
 *
 * The buttons do expose a proper accessible name, so they are addressed by role instead —
 * which is the more robust choice anyway, since it asserts the control is reachable the way
 * a user or a screen reader reaches it.
 */
export const navigationObjects = Object.freeze({
    openMenuButton: 'role=button[name="Open Menu"]',
    closeMenuButton: 'role=button[name="Close Menu"]',

    // The individual links are the application's own markup, so these follow the normal rule.
    allItemsLink: '[data-test="inventory-sidebar-link"]',
    aboutLink: '[data-test="about-sidebar-link"]',
    logoutLink: '[data-test="logout-sidebar-link"]',
    resetAppStateLink: '[data-test="reset-sidebar-link"]',

    // Needed only to assert on the drawer's contents as an ordered set. react-burger-menu
    // owns this wrapper and emits no data-test attribute on it.
    drawerItem: '.bm-item.menu-item',
});
