import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { faker } from '@faker-js/faker';
import env from '../config/env.js';

let browser;

BeforeAll(async function () {
    browser = await chromium.launch({ headless: env.headless });
});

Before(async function () {
    this.context = await browser.newContext();
    const page = await this.context.newPage();
    this.initPageObjects(page);

    // Fresh fake customer data per scenario (not shared/reused across the whole run).
    this.customer = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        zipCode: faker.location.zipCode(),
    };
});

After(async function ({ result }) {
    if (result?.status === Status.FAILED && this.page) {
        const screenshot = await this.page.screenshot();
        await this.attach(screenshot, 'image/png');
    }
    await this.context?.close();
});

AfterAll(async function () {
    await browser?.close();
});
