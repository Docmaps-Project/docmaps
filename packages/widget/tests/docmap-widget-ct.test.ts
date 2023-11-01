import { test, expect } from '@sand4rt/experimental-ct-web';
import {DocmapsWidget} from '../src';

test('render props', async ({ mount }) => {
  const component = await mount(DocmapsWidget, {
    props: {
      doi: 'test-doi',
    },
  });
  await expect(component).toContainText('test-doi');
});