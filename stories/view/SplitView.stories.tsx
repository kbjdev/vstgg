import { Meta, StoryObj } from '@storybook/react/*';
import StoryComponentFrame from '../_accessories/ComponentFrame';
import SplitView from '@src/renderer/components/vs/view/SplitView';
import StoryBox from '../_accessories/StoryBox';
import StoryText from '../_accessories/StoryText';

type Story = StoryObj<typeof SplitView>;

const meta: Meta<typeof SplitView> = {
  title: 'components/View/SplitView',
  tags: ['autodocs'],
  argTypes: {
    views: {
      type: 'ISplitView[]' as any,
    },
    direction: {
      type: 'horizontal | vertical' as any,
      table: { defaultValue: { summary: 'horizontal' } },
    },
  },
};

export const Default: Story = {
  render: () => (
    <div style={{ width: 200, height: 400 }}>
      <SplitView
        views={[
          { minSize: 100, size: 200, visible: true },
          { minSize: 100, size: 200, visible: true },
        ]}
      >
        <StoryBox color="activityBar.background">
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            1
          </StoryText>
        </StoryBox>
        <StoryBox>
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            2
          </StoryText>
        </StoryBox>
      </SplitView>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: 200, height: 800 }}>
      <SplitView
        views={[
          { minSize: 100, size: 100, visible: true },
          { minSize: 100, size: 200, visible: true },
          { minSize: 100, size: 300, visible: true },
          { minSize: 100, size: 200, visible: true },
        ]}
      >
        <StoryBox color="activityBar.background">
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            1
          </StoryText>
        </StoryBox>
        <StoryBox>
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            2
          </StoryText>
        </StoryBox>
        <StoryBox color="activityBar.background">
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            3
          </StoryText>
        </StoryBox>
        <StoryBox>
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            4
          </StoryText>
        </StoryBox>
      </SplitView>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: 800, height: 200 }}>
      <SplitView
        views={[
          { minSize: 100, size: 100, visible: true },
          { minSize: 100, size: 200, visible: true },
          { minSize: 100, size: 300, visible: true },
          { minSize: 100, size: 200, visible: true },
        ]}
        direction="vertical"
      >
        <StoryBox color="activityBar.background">
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            1
          </StoryText>
        </StoryBox>
        <StoryBox>
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            2
          </StoryText>
        </StoryBox>
        <StoryBox color="activityBar.background">
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            3
          </StoryText>
        </StoryBox>
        <StoryBox>
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            4
          </StoryText>
        </StoryBox>
      </SplitView>
    </div>
  ),
};

export const Nested: Story = {
  render: () => (
    <div style={{ width: 400, height: 400 }}>
      <SplitView
        views={[
          { minSize: 100, size: 100, visible: true },
          { minSize: 100, size: 300, visible: true },
        ]}
        direction="vertical"
      >
        <StoryBox color="sideBar.background">
          <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
            1
          </StoryText>
        </StoryBox>
        <StoryBox>
          <SplitView
            views={[
              { minSize: 100, size: 100, visible: true },
              { minSize: 100, size: 300, visible: true },
            ]}
          >
            <StoryBox color="activityBar.background">
              <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
                2
              </StoryText>
            </StoryBox>
            <StoryBox>
              <StoryText fontWeight={700} fontSize={40} color="descriptionForeground">
                3
              </StoryText>
            </StoryBox>
          </SplitView>
        </StoryBox>
      </SplitView>
    </div>
  ),
};

export default meta;
