import { setWorldConstructor, World } from '@cucumber/cucumber';
import LoginPage from '../pageobjects/loginPage.js';
import InventoryPage from '../pageobjects/inventoryPage.js';
import CartPage from '../pageobjects/cartPage.js';
import CheckoutInformationPage from '../pageobjects/checkoutInformationPage.js';
import CheckoutOverviewPage from '../pageobjects/checkoutOverviewPage.js';
import NavigationDrawerPage from '../pageobjects/navigationDrawerPage.js';

export default class CustomWorld extends World {
    constructor(options) {
        super(options);
        this.page = null;
        this.context = null;
    }

    initPageObjects(page) {
        this.page = page;
        this.loginPage = new LoginPage(page);
        this.inventoryPage = new InventoryPage(page);
        this.cartPage = new CartPage(page);
        this.checkoutInformationPage = new CheckoutInformationPage(page);
        this.checkoutOverviewPage = new CheckoutOverviewPage(page);
        this.navigationDrawerPage = new NavigationDrawerPage(page);
    }
}

setWorldConstructor(CustomWorld);
