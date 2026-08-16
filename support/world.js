import { setWorldConstructor, World } from '@cucumber/cucumber';
import { faker } from '@faker-js/faker';
import BasePage from '../pageobjects/basePage.js';
import LoginPage from '../pageobjects/loginPage.js';
import InventoryPage from '../pageobjects/inventoryPage.js';
import CartPage from '../pageobjects/cartPage.js';
import CheckoutInformationPage from '../pageobjects/checkoutInformationPage.js';
import CheckoutOverviewPage from '../pageobjects/checkoutOverviewPage.js';
import NavigationDrawerPage from '../pageobjects/navigationDrawerPage.js';

/**
 * One World is constructed per scenario, so anything hung off `this` is scenario-scoped and
 * cannot leak into the next scenario — which is what keeps the suite safe to run in parallel.
 */
export default class CustomWorld extends World {
    constructor(options) {
        super(options);

        /** @type {import('playwright').Page | null} */
        this.page = null;
        /** @type {import('playwright').BrowserContext | null} */
        this.context = null;
    }

    /** Wires the page objects to the freshly opened page. Called from the Before hook. */
    initPageObjects(page) {
        this.page = page;

        // The shared chrome — error banner, page heading, cart badge — belongs to no single
        // page, so steps that assert on it talk to this instance rather than picking an
        // arbitrary page object and implying the element lives there.
        this.commonPage = new BasePage(page);

        this.loginPage = new LoginPage(page);
        this.inventoryPage = new InventoryPage(page);
        this.cartPage = new CartPage(page);
        this.checkoutInformationPage = new CheckoutInformationPage(page);
        this.checkoutOverviewPage = new CheckoutOverviewPage(page);
        this.navigationDrawerPage = new NavigationDrawerPage(page);
    }

    /**
     * Fresh customer details for this scenario.
     *
     * Generated per scenario rather than at module level: module-level data is created once
     * per process and would then be shared by every scenario that worker runs, which is the
     * classic way a parallel suite starts failing in ways it cannot reproduce serially.
     */
    newCustomer() {
        this.customer = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            postalCode: faker.location.zipCode(),
        };

        return this.customer;
    }
}

setWorldConstructor(CustomWorld);
