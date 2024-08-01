import ToolbarIconButton from '@src/renderer/components/vs/button/ToolbarIconButton';
import { Meta, StoryObj } from '@storybook/react/*';
import NewFileIcon from '@resources/icons/new-file.svg?react';
import DebugStepOverIcon from '@resources/icons/debug-step-over.svg?react';
import DebugStepOutIcon from '@resources/icons/debug-step-out.svg?react';

import Tooltip from '@src/renderer/components/vs/tooltip/Tooltip';
import StoryBox from './_accessories/StoryBox';
import Button from '@src/renderer/components/vs/button/Button';
import StoryComponentFrame from './_accessories/ComponentFrame';

type Story = StoryObj<typeof ToolbarIconButton>;

const meta: Meta<typeof Tooltip> = {
  title: 'components/Tooltip',
  tags: ['autodocs'],
  argTypes: {},
};

const positions = [
  ['n-left', <DebugStepOverIcon transform="rotate(-90)" />],
  ['n-center', <DebugStepOutIcon />],
  ['n-right', <DebugStepOverIcon transform="rotate(90) scale(-1 1)" />],

  ['w-top', <DebugStepOverIcon transform="scale(-1 1)" />],
  ['w-center', <DebugStepOutIcon transform="rotate(-90)" />],
  ['w-bottom', <DebugStepOverIcon transform="rotate(180)" />],

  ['e-top', <DebugStepOverIcon />],
  ['e-center', <DebugStepOutIcon transform="rotate(90)" />],
  ['e-bottom', <DebugStepOverIcon transform="rotate(180) scale(-1 1)" />],

  ['s-left', <DebugStepOverIcon transform="rotate(-90) scale(-1 1)" />],
  ['s-center', <DebugStepOutIcon transform="rotate(180)" />],
  ['s-right', <DebugStepOverIcon transform="rotate(90)" />],
] as const;

export const Default: Story = {
  render: () => (
    <StoryBox width="200px" height="100px" color="sideBar.background">
      <Tooltip content="New File..." position="s-center" withArrow>
        <ToolbarIconButton onClick={() => alert('Toolbar button clicked!')}>
          <NewFileIcon />
        </ToolbarIconButton>
      </Tooltip>
    </StoryBox>
  ),
};

export const Positioning: Story = {
  render: () => (
    <StoryComponentFrame>
      <div
        style={{
          display: 'grid',
          margin: '24px 128px',
          width: 156,
          height: 156,
          gap: '4px',
          gridTemplateAreas:
            '".             n-left        n-center      n-right       .            "' +
            '"w-top         .             .             .             e-top        "' +
            '"w-center      .             .             .             e-center     "' +
            '"w-bottom      .             .             .             e-bottom     "' +
            '".             s-left        s-center      s-right       .            "',
        }}
      >
        {positions.map(([position, icon]) => (
          <div style={{ gridArea: position, minWidth: 28, height: 28 }}>
            <Tooltip key={position} withArrow position={position} content={position}>
              <Button onClick={() => alert('Button clicked!')}>{icon}</Button>
            </Tooltip>
          </div>
        ))}
      </div>
    </StoryComponentFrame>
  ),
};

export default meta;
