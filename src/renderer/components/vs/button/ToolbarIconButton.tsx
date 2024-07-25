import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 0 3px;
  height: 22px;
  border-radius: 4px;

  color: ${({ theme }) => theme.colors['icon.foreground']};
  font-size: 11px;

  & > svg {
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.colors['icon.foreground']};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.disabledForeground};

    & > svg {
      fill: ${({ theme }) => theme.colors.disabledForeground};
    }
  }

  &:not(:disabled):hover {
    background-color: ${({ theme }) => theme.colors['toolbar.hoverBackground']};
  }
`;

const Label = styled.div`
  margin-left: 4px;
  font-size: 11px;
`;

interface IToolBarIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  label?: string;
}

const ToolbarIconButton: FC<PropsWithChildren<IToolBarIconButtonProps>> = ({
  children,
  label,
  ...props
}) => (
  <Button type="button" {...props}>
    {children}
    {!!label && <Label>{label}</Label>}
  </Button>
);

export default ToolbarIconButton;
