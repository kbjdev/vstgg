import Button from '@src/renderer/components/vs/button/Button';
import { Meta, StoryObj } from '@storybook/react/*';
import CheckIcon from '@resources/icons/check.svg?react';
import StoryComponentFrame from '../_accessories/ComponentFrame';

type Story = StoryObj<typeof Button>;

const meta: Meta<typeof Button> = {
  title: 'components/Button/Button',
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
    <StoryComponentFrame width={300}>
      <Button onClick={() => alert('Button clicked!')}>Run and Debug</Button>
    </StoryComponentFrame>
  ),
};

export const WithDropdown: Story = {
  render: () => (
    <StoryComponentFrame width={300}>
      <Button
        onClick={() => alert('Button clicked!')}
        onDropdownClick={() => alert('Dropdown button clicked!')}
      >
        <CheckIcon style={{ margin: '0 3.2px' }} />
        Commit
      </Button>
    </StoryComponentFrame>
  ),
};

export default meta;
