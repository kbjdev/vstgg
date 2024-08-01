import { FC, PropsWithChildren, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled, { css } from 'styled-components';

type CardinalPoints = 'e' | 'w' | 's' | 'n';
type HorizontalPosition = 'top' | 'bottom' | 'center';
type VerticalPosition = 'left' | 'right' | 'center';
type Position = HorizontalPosition | VerticalPosition;

type TooltipPosition = `${CardinalPoints}-${Position}` extends `${infer CP}-${Position}`
  ? CP extends 'e' | 'w'
    ? `${CP}-${HorizontalPosition}`
    : `${CP}-${VerticalPosition}`
  : never;

interface ITooltipProps {
  position: TooltipPosition;
  content: string;
  withArrow?: boolean;
}

const calculatePosition = (position: TooltipPosition) => {
  switch (position) {
    case 'e-top':
      return css`
        left: 100%;
        top: 0;
        padding-left: 3px;
      `;
    case 'e-center':
      return css`
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        padding-left: 3px;
      `;
    case 'e-bottom':
      return css`
        left: 100%;
        bottom: 0;
        padding-left: 3px;
      `;
    case 'w-top':
      return css`
        right: 100%;
        top: 0;
        padding-right: 3px;
      `;
    case 'w-center':
      return css`
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        padding-right: 3px;
      `;
    case 'w-bottom':
      return css`
        right: 100%;
        bottom: 0;
        padding-right: 3px;
      `;
    case 's-left':
      return css`
        left: 0;
        bottom: 0;
        transform: translateY(100%);
        padding-top: 3px;
      `;
    case 's-center':
      return css`
        left: 50%;
        bottom: 0;
        transform: translate(-50%, 100%);
        padding-top: 3px;
      `;
    case 's-right':
      return css`
        right: 0;
        bottom: 0;
        transform: translateY(100%);
        padding-top: 3px;
      `;
    case 'n-left':
      return css`
        left: 0;
        top: 0;
        transform: translateY(-100%);
        padding-bottom: 3px;
      `;
    case 'n-center':
      return css`
        left: 50%;
        top: 0;
        transform: translate(-50%, -100%);
        padding-bottom: 3px;
      `;
    case 'n-right':
      return css`
        right: 0;
        top: 0;
        transform: translateY(-100%);
        padding-bottom: 3px;
      `;
  }
};

const calculateArrowPosition = (position: TooltipPosition) => {
  switch (position) {
    case 'e-top':
      return css`
        left: 0;
        top: 9px;
      `;
    case 'e-center':
      return css`
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      `;
    case 'e-bottom':
      return css`
        left: 0;
        bottom: 9px;
      `;
    case 'w-top':
      return css`
        right: 0;
        top: 9px;
      `;
    case 'w-center':
      return css`
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      `;
    case 'w-bottom':
      return css`
        right: 0;
        bottom: 9px;
      `;
    case 's-left':
      return css`
        left: 9px;
        top: 0;
      `;
    case 's-center':
      return css`
        left: 50%;
        top: 0;
        transform: translate(-50%);
      `;
    case 's-right':
      return css`
        right: 9px;
        top: 0;
      `;
    case 'n-left':
      return css`
        left: 9px;
        bottom: 0;
      `;
    case 'n-center':
      return css`
        left: 50%;
        bottom: 0;
        transform: translate(-50%);
      `;
    case 'n-right':
      return css`
        right: 9px;
        bottom: 0;
      `;
  }
};

const calculateArrowBorder = (position: TooltipPosition) => {
  switch (position) {
    case 'e-top':
    case 'e-center':
    case 'e-bottom':
      return css`
        border-right: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
        border-bottom: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
      `;
    case 'w-top':
    case 'w-center':
    case 'w-bottom':
      return css`
        border-left: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
        border-top: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
      `;
    case 's-left':
    case 's-center':
    case 's-right':
      return css`
        border-left: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
        border-bottom: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
      `;
    case 'n-left':
    case 'n-center':
    case 'n-right':
      return css`
        border-right: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
        border-top: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
      `;
  }
};

const Wrapper = styled.div`
  position: relative;
  width: max-content;
  height: max-content;
`;

const Container = styled(motion.div)<{ $position: TooltipPosition }>`
  position: absolute;
  ${({ $position }) => calculatePosition($position)};
  z-index: 1555;
`;

const ContentBox = styled.div`
  padding: 2px 8px;
  width: max-content;
  max-width: 700px;
  background-color: ${({ theme }) => theme.colors['editorHoverWidget.background']};
  border: 1px solid ${({ theme }) => theme.colors['editorHoverWidget.border']};
  border-radius: 3px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors['widget.shadow']};

  font-size: 12px;
  color: ${({ theme }) => theme.colors['editorHoverWidget.foreground']};
  line-height: 17px;
  word-wrap: break-word;
`;

const ArrowWrapper = styled.div<{ $position: TooltipPosition }>`
  position: absolute;
  ${({ $position }) => calculateArrowPosition($position)};
`;

const ArrowBox = styled.div<{ $position: TooltipPosition }>`
  ${({ $position }) => calculateArrowBorder($position)};
  width: 6px;
  height: 6px;
  transform: rotate(135deg);
  background-color: ${({ theme }) => theme.colors['editorHoverWidget.background']};
`;

const Tooltip: FC<PropsWithChildren<ITooltipProps>> = ({
  children,
  content,
  position,
  withArrow,
}) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  const onMouseEnter = () => setIsHover(true);
  const onMouseLeave = () => setIsHover(false);

  return (
    <Wrapper onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
      <AnimatePresence>
        {isHover && (
          <Container
            $position={position}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, easings: ['linear'] }}
          >
            <ContentBox>{content}</ContentBox>
            {withArrow && (
              <ArrowWrapper $position={position}>
                <ArrowBox $position={position} />
              </ArrowWrapper>
            )}
          </Container>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default Tooltip;
