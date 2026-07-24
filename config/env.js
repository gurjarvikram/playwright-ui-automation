import 'dotenv/config';

export default {
    baseUrl: process.env.SAUCE_BASE_URL || 'https://www.saucedemo.com',
    username: process.env.SAUCE_USERNAME || 'standard_user',
    password: process.env.SAUCE_PASSWORD || 'secret_sauce',
    headless: process.env.HEADLESS !== 'false',
};
