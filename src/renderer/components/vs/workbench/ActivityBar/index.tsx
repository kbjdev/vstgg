import { FC } from 'react';
import styled from 'styled-components';
import AccountIcon from '@resources/icons/account.svg?react';
import FolderOpenedIcon from '@resources/icons/folder-opened.svg?react';
import GitStashPopIcon from '@resources/icons/git-stash-pop.svg?react';
import GitStashIcon from '@resources/icons/git-stash.svg?react';
import PieChartIcon from '@resources/icons/pie-chart.svg?react';
import RepoFetchIcon from '@resources/icons/repo-fetch.svg?react';
import RepoPullIcon from '@resources/icons/repo-pull.svg?react';
import RepoPushIcon from '@resources/icons/repo-push.svg?react';
import SearchIcon from '@resources/icons/search.svg?react';
import SettingsGearIcon from '@resources/icons/settings-gear.svg?react';
import SourceControlIcon from '@resources/icons/source-control.svg?react';
import ToolsIcon from '@resources/icons/tools.svg?react';
import ActivityBarButton from './ActivityBarButton';

const Container = styled.div`
  position: absolute;
  top: calc(35px + 48px);
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 48px;
  height: calc(100% - 35px - 22px - 48px);
  background-color: ${({ theme }) => theme.colors['activityBar.background']};
  border-right: 1px solid ${({ theme }) => theme.colors['activityBar.border']};
`;

const ShortcutContainer = styled.div`
  position: absolute;
  top: 35px;
  left: 0;
  height: 48px;
  width: 100vw;
  background-color: ${({ theme }) => theme.colors['activityBar.background']};
  border-bottom: 1px solid ${({ theme }) => theme.colors['activityBar.border']};
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const ActivityBar: FC = () => (
  <>
    <ShortcutContainer>
      <Center>
        <ActivityBarButton direction="top" label="pull">
          <RepoPullIcon />
        </ActivityBarButton>
        <ActivityBarButton direction="top" label="fetch">
          <RepoFetchIcon />
        </ActivityBarButton>
        <ActivityBarButton direction="top" label="push">
          <RepoPushIcon />
        </ActivityBarButton>
        <ActivityBarButton direction="top" label="stash">
          <GitStashIcon />
        </ActivityBarButton>
        <ActivityBarButton direction="top" label="pop">
          <GitStashPopIcon />
        </ActivityBarButton>
      </Center>
    </ShortcutContainer>
    <Container>
      <div>
        <ActivityBarButton isActive>
          <FolderOpenedIcon />
        </ActivityBarButton>
        <ActivityBarButton>
          <SourceControlIcon />
        </ActivityBarButton>
        <ActivityBarButton>
          <SearchIcon />
        </ActivityBarButton>
        <ActivityBarButton>
          <PieChartIcon />
        </ActivityBarButton>
        <ActivityBarButton>
          <ToolsIcon />
        </ActivityBarButton>
      </div>
      <div>
        <ActivityBarButton>
          <AccountIcon />
        </ActivityBarButton>
        <ActivityBarButton>
          <SettingsGearIcon />
        </ActivityBarButton>
      </div>
    </Container>
  </>
);

export default ActivityBar;
