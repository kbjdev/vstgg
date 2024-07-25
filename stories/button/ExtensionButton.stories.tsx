import ExtensionButton from '@src/renderer/components/vs/button/ExtensionButton';
import { Meta, StoryObj } from '@storybook/react/*';
import { fn } from '@storybook/test';
import StoryComponentFrame from '../ComponentFrame';

type Story = StoryObj<typeof ExtensionButton>;

const meta: Meta<typeof ExtensionButton> = {
  title: 'button/ExtensionButton',
  tags: ['autodocs'],
  argTypes: {
    onDropdownClick: {
      type: 'MouseEventHandler<HTMLButtonElement>' as any,
      table: { defaultValue: { summary: 'undefined' } },
    },
  },
};

export const Default: Story = {
  render: () => (
    <StoryComponentFrame>
      <ExtensionButton onClick={() => alert('Extension button clicked!')}>Install</ExtensionButton>
    </StoryComponentFrame>
  ),
};

export const WithDropdown: Story = {
  render: () => (
    <StoryComponentFrame>
      <ExtensionButton
        onClick={() => alert('Extension button clicked!')}
        onDropdownClick={() => alert('Dropdown button clicked!')}
      >
        Install
      </ExtensionButton>
    </StoryComponentFrame>
  ),
};

export default meta;
