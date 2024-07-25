import { ButtonHTMLAttributes, FC, MouseEventHandler, PropsWithChildren } from 'react';
import styled from 'styled-components';
import ChevronDownIcon from '@resources/icons/chevron-down.svg?react';

const Wrapper = styled.div`
  display: flex;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors['button.border']};
`;

const BaseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: ${({ theme }) => theme.colors['button.background']};

  &:hover {
    background-color: ${({ theme }) => theme.colors['button.hoverBackground']};
  }

  & > svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors['button.foreground']};
  }
`;

const MainButton = styled(BaseButton)<{ $hasDropdown: boolean }>`
  padding: 0 5px;
  flex: 1;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;

  border-top-right-radius: ${({ $hasDropdown }) => ($hasDropdown ? 'none' : '2px')};
  border-bottom-right-radius: ${({ $hasDropdown }) => ($hasDropdown ? 'none' : '2px')};

  font-size: 13px;
  color: ${({ theme }) => theme.colors['button.foreground']};
`;

const Separator = styled.div`
  display: flex;
  align-items: center;
  width: 1px;
  height: 100%;
  padding: 4px 0;
  background-color: ${({ theme }) => theme.colors['button.background']};
  & > div {
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors['button.separator']};
  }
`;

const DropdownButton = styled(BaseButton)`
  width: 25px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0 4px;
`;

interface IButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  onDropdownClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button: FC<PropsWithChildren<IButtonProps>> = ({ children, onDropdownClick, ...props }) => (
  <Wrapper>
    <MainButton type="button" $hasDropdown={!!onDropdownClick} {...props}>
      {children}
    </MainButton>
    {!!onDropdownClick && (
      <>
        <Separator>
          <div />
        </Separator>
        <DropdownButton onClick={onDropdownClick}>
          <ChevronDownIcon />
        </DropdownButton>
      </>
    )}
  </Wrapper>
);

export default Button;
