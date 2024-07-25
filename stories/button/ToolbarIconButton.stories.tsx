import ToolbarIconButton from '@src/renderer/components/vs/button/ToolbarIconButton';
import { Meta, StoryObj } from '@storybook/react/*';
import EllipsisIcon from '@resources/icons/ellipsis.svg?react';
import TerminalIcon from '@resources/icons/terminal.svg?react';
import StoryComponentFrame from '../ComponentFrame';

type Story = StoryObj<typeof ToolbarIconButton>;

const meta: Meta<typeof ToolbarIconButton> = {
  title: 'button/ToolbarIconButton',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', type: 'string', table: { defaultValue: { summary: 'undefined' } } },
  },
};

export const Default: Story = {
  render: () => (
    <StoryComponentFrame>
      <ToolbarIconButton onClick={() => alert('Toolbar button clicked!')}>
        <EllipsisIcon />
      </ToolbarIconButton>
    </StoryComponentFrame>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <StoryComponentFrame>
      <ToolbarIconButton onClick={() => alert('Toolbar button clicked!')} label="node">
        <TerminalIcon />
      </ToolbarIconButton>
    </StoryComponentFrame>
  ),
};

export default meta;
