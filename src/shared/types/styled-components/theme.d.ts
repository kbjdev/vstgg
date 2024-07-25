import 'styled-components';
import { IVSCTheme } from '../vs/theme';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: IVSCTheme['colors'];
  }
}
