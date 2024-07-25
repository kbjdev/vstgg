import ExtensionButton from '@src/renderer/components/vs/button/ExtensionButton';
import { Meta, StoryObj } from '@storybook/react/*';
import { fn } from '@storybook/test';

type Story = StoryObj<typeof ExtensionButton>;

const meta: Meta<typeof ExtensionButton> = {
  component: ExtensionButton,
  title: 'button/ExtensionButton',
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    onDropdownClick: { control: 'boolean' },
  },
};

export const Default: Story = {
  args: {
    children: 'Install',
  },
};

export const WithDropdown: Story = {
  args: {
    children: 'Install',
    onDropdownClick: fn(),
  },
};

export default meta;
