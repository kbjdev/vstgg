import { ButtonHTMLAttributes, forwardRef, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

interface IButtonProps {
  $isActive: boolean;
  $direction: 'top' | 'left' | 'bottom' | 'right';
}

const Button = styled.button<IButtonProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 10px;
  padding: 3px;
  cursor: pointer;
  color: ${({ theme, $isActive }) =>
    $isActive
      ? theme.colors['activityBar.foreground']
      : theme.colors['activityBar.inactiveForeground']};
  fill: ${({ theme, $isActive }) =>
    $isActive
      ? theme.colors['activityBar.foreground']
      : theme.colors['activityBar.inactiveForeground']};
  ${({ theme, $direction, $isActive }) => css`
    padding-${$direction}: 1px;
    border-${$direction}: 2px solid transparent;
    border-${$direction}-color: ${$isActive ? theme.colors['activityBar.foreground'] : 'transparent'};
  `}

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover,
  &:active {
    color: ${({ theme, disabled }) =>
      disabled
        ? theme.colors['activityBar.inactiveForeground']
        : theme.colors['activityBar.foreground']};
    fill: ${({ theme, disabled }) =>
      disabled
        ? theme.colors['activityBar.inactiveForeground']
        : theme.colors['activityBar.foreground']};
  }

  &:active {
    border-left-color: transparent;
  }
`;

const Label = styled.span`
  margin-top: 2px;
`;

interface IActivityBarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  isActive?: boolean;
  direction?: 'top' | 'left' | 'right' | 'bottom';
}

const ActivityBarButton = forwardRef<HTMLButtonElement, PropsWithChildren<IActivityBarButtonProps>>(
  ({ label, isActive = false, direction = 'left', type = 'button', children, ...props }, ref) => (
    <Button $isActive={isActive} $direction={direction} type={type} {...props}>
      {children}
      {label && <Label>{label.toUpperCase()}</Label>}
    </Button>
  )
);

ActivityBarButton.displayName = 'ActivityBarButton';

export default ActivityBarButton;
