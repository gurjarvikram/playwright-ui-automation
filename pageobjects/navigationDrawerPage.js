import BasePage from './basePage.js';

export default class NavigationDrawerPage extends BasePage {
    constructor(page) {
        super(page);
        this.menuIcon = '#react-burger-menu-btn';
        this.drawerItemMenu = '.bm-item.menu-item';
        this.aboutMenuLink = '#about_sidebar_link';
        this.closeBtn = '#react-burger-cross-btn';
        this.logoutLink = '#logout_sidebar_link';
    }

    async openDrawer() {
        const menuIconLocator = this.page.locator(this.menuIcon);
        await menuIconLocator.waitFor({ state: 'visible' });
        await menuIconLocator.click();
    }

    async getMenuItemTexts() {
        return this.getAllTexts(this.drawerItemMenu);
    }

    async logout() {
        await this.click(this.logoutLink);
    }

    async closeDrawer() {
        await this.click(this.closeBtn);
    }

    async isDrawerHidden() {
        return this.page.locator(this.drawerItemMenu).first().isHidden();
    }
}
