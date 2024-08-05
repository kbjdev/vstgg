import { FC } from 'react';
import styled from 'styled-components';
import ArrowDownIcon from '@resources/icons/arrow-down.svg?react';
import ArrowUpIcon from '@resources/icons/arrow-up.svg?react';
import BellIcon from '@resources/icons/bell.svg?react';
import ErrorIcon from '@resources/icons/error.svg?react';
import InfoIcon from '@resources/icons/info.svg?react';
import ListUnordered from '@resources/icons/list-unordered.svg?react';
import QuestionIcon from '@resources/icons/question.svg?react';
import SourceControlIcon from '@resources/icons/source-control.svg?react';
import SyncIcon from '@resources/icons/sync.svg?react';
import WarningIcon from '@resources/icons/warning.svg?react';

import StatusBarItem from './StatusBarItem';
import Tooltip from '../../tooltip/Tooltip';

const Container = styled.footer`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  width: 100vw;
  height: 22px;
  padding-right: 10px;
  background-color: ${({ theme }) => theme.colors['statusBar.background']};
  border-top: 1px solid ${({ theme }) => theme.colors['statusBar.border']};
`;

const ItemWrapper = styled.div`
  display: flex;
  column-gap: 6px;
`;

const StatusBar: FC = () => (
  <Container>
    <ItemWrapper>
      <Tooltip position="n-left" withArrow content="Current Branch: main">
        <StatusBarItem>
          <SourceControlIcon />
          {' main*'}
        </StatusBarItem>
      </Tooltip>
      <StatusBarItem>
        <SyncIcon />
        {' 0'}
        <ArrowDownIcon />
        {' 0'}
        <ArrowUpIcon />
      </StatusBarItem>
      <StatusBarItem>
        <ErrorIcon />
        {' 0 '}
        <WarningIcon />
        {' 0 '}
        <InfoIcon />
        {' 0'}
      </StatusBarItem>
    </ItemWrapper>
    <ItemWrapper>
      <Tooltip position="n-center" withArrow content="Activity Logs">
        <StatusBarItem>
          <ListUnordered />
        </StatusBarItem>
      </Tooltip>
      <StatusBarItem>
        <QuestionIcon />
        {' Support'}
      </StatusBarItem>
      <Tooltip position="n-right" withArrow content="Current Client Version: 0.1.0-alpha">
        <StatusBarItem>{'0.1.0-alpha'}</StatusBarItem>{' '}
      </Tooltip>
      <Tooltip position="n-right" withArrow content="No Notifications">
        <StatusBarItem>
          <BellIcon />
        </StatusBarItem>
      </Tooltip>
    </ItemWrapper>
  </Container>
);

export default StatusBar;
