import { FC, useRef } from 'react';
import SplitView from '@src/renderer/components/vs/view/SplitView';
import useSplitViewCollection from '@src/renderer/libs/view/useSplitViewCollection';
import StoryBox from '../../_accessories/StoryBox';
import StoryText from '../../_accessories/StoryText';

interface ISplitViewDefaultProps {}

const SplitViewDefault: FC<ISplitViewDefaultProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const collection = useSplitViewCollection({
    containerRef,
    views: [
      { minSize: 100, size: 200, visible: true },
      { minSize: 100, size: 200, visible: true },
    ],
    direction: 'horizontal',
  });

  return (
    <div style={{ width: 200, height: 400 }}>
      <SplitView.Container ref={containerRef}>
        <SplitView.Wrapper collection={collection}>
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
        </SplitView.Wrapper>
      </SplitView.Container>
    </div>
  );
};

export default SplitViewDefault;
