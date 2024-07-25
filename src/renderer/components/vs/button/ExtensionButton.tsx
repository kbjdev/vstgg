import { ButtonHTMLAttributes, FC, MouseEventHandler, PropsWithChildren } from 'react';
import styled from 'styled-components';
import ChevronDownIcon from '@resources/icons/chevron-down.svg?react';

const Wrapper = styled.div`
  display: flex;
  height: 16px;
`;

const BaseButton = styled.button`
  height: 100%;
  background-color: ${({ theme }) => theme.colors['extensionButton.background']};

  &:hover {
    background-color: ${({ theme }) => theme.colors['extensionButton.hoverBackground']};
  }
`;

const Button = styled(BaseButton)<{ $hasDropdown: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 5px;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;

  border-top-right-radius: ${({ $hasDropdown }) => ($hasDropdown ? 'none' : '2px')};
  border-bottom-right-radius: ${({ $hasDropdown }) => ($hasDropdown ? 'none' : '2px')};

  font-size: 11px;
  color: ${({ theme }) => theme.colors['extensionButton.prominentForeground']};
`;

const Separator = styled.div`
  display: flex;
  align-items: center;
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors['extensionButton.background']};
  & > div {
    width: 100%;
    height: 10px;
    background-color: ${({ theme }) => theme.colors['extensionButton.separator']};
  }
`;

const DropdownButton = styled(BaseButton)`
  width: 16px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;

  & > svg {
    width: 100%;
    height: 100%;
    color: ${({ theme }) => theme.colors['extensionButton.prominentForeground']};
  }
`;

interface IExtensionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  onDropdownClick?: MouseEventHandler<HTMLButtonElement>;
}

const ExtensionButton: FC<PropsWithChildren<IExtensionButtonProps>> = ({
  children,
  onDropdownClick,
  ...props
}) => (
  <Wrapper>
    <Button type="button" $hasDropdown={!!onDropdownClick} {...props}>
      {children}
    </Button>
    {!!onDropdownClick && (
      <>
        <Separator>
          <div></div>
        </Separator>
        <DropdownButton>
          <ChevronDownIcon />
        </DropdownButton>
      </>
    )}
  </Wrapper>
);

export default ExtensionButton;
