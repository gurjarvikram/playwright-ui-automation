/**
 * Barrel for the object repository.
 *
 * Page objects import from here, never from an individual file, so that moving a selector
 * between repository files is not a breaking change for the layer above.
 */
export { commonObjects } from './common.objects.js';
export { loginObjects } from './login.objects.js';
export { inventoryObjects } from './inventory.objects.js';
export { cartObjects } from './cart.objects.js';
export { checkoutObjects } from './checkout.objects.js';
export { navigationObjects } from './navigation.objects.js';
