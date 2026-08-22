/**
 * Barrel for the test data layer.
 *
 * Everything the suite feeds the application comes from here: fixed accounts from a data
 * file, generated checkout details from a builder. Step definitions import from this barrel
 * and pass values down, so no page object ever knows where its data came from — which is what
 * lets the same page object serve a hard-coded fixture, a generated record or, later, one
 * created through an API.
 */
export { getUser } from './users.js';
export { buildCustomer } from './customer.js';
