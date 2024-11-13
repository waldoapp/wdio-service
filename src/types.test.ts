import { expect, test } from 'vitest';
import { CapabilitiesWithWaldo } from './types.js';

test('Can build capabilities with and without prefix', () => {
    const capabilities: CapabilitiesWithWaldo = {
        'waldo:osVersion': '16.*',
        'waldo:options': {
            automationName: 'xcuitest',
        },
    };

    expect(capabilities).not.toBeNull();
});
