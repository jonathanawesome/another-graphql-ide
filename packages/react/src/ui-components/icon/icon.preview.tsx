import { Icon } from './icon';
import type { IconProps } from './icon.types';
import { createPreview } from '../../create-preview';

const preview = createPreview<IconProps>({
  title: 'Icon',
  component: Icon,
  category: 'UI Components',
  variants: [
    {
      name: 'Default',
      props: { name: 'BookOpenText' },
    },
    {
      name: 'Rotated 90°',
      props: { name: 'BookOpenText', rotate: '90' },
    },
    {
      name: 'Rotated 180°',
      props: { name: 'BookOpenText', rotate: '180' },
    },
    {
      name: 'Rotated 270°',
      props: { name: 'BookOpenText', rotate: '270' },
    },
  ],
});

export default preview;
