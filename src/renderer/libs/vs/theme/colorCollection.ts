import type { ColorScheme, IVSCTheme } from '@src/shared/types/vs/theme';
import { Color, parseHex, RGBA } from './color';

export type VSCColors = keyof IVSCTheme['colors'];

export type ColorValue = Color | string | ColorTransform;

export const enum ColorTransformType {
  Darken,
  Lighten,
  Transparent,
  Same,
  LessProminent,
  IfDefinedThenElse,
}

export type ColorTransform =
  | { op: ColorTransformType.Darken; key: VSCColors; factor: number }
  | { op: ColorTransformType.Lighten; key: VSCColors; factor: number }
  | { op: ColorTransformType.Transparent; key: VSCColors; factor: number }
  | { op: ColorTransformType.Same; key: VSCColors }
  | {
      op: ColorTransformType.LessProminent;
      key: VSCColors;
      background: ColorValue;
      factor: number;
      transparency: number;
    }
  | {
      op: ColorTransformType.IfDefinedThenElse;
      if: VSCColors;
      then: ColorValue;
      else: ColorValue;
    };

export type ColorDefaults = {
  [K in ColorScheme]: ColorValue | null;
};

class ColorCollection {
  public readonly collection: Map<VSCColors, ColorDefaults>;

  public constructor() {
    this.collection = new Map();
    this._registerDefaultColor();
  }

  private _registerColor(key: VSCColors, defaults: ColorDefaults | null) {
    this.collection.set(key, defaults ?? { dark: null, hcDark: null, hcLight: null, light: null });
  }

  private _registerDefaultColor() {
    this._registerColor('foreground', {
      dark: '#CCCCCC',
      light: '#616161',
      hcDark: '#FFFFFF',
      hcLight: '#292929',
    });

    this._registerColor('disabledForeground', {
      dark: '#CCCCCC80',
      light: '#61616180',
      hcDark: '#A5A5A5',
      hcLight: '#7F7F7F',
    });

    this._registerColor('errorForeground', {
      dark: '#F48771',
      light: '#A1260D',
      hcDark: '#F48771',
      hcLight: '#B5200D',
    });

    this._registerColor('descriptionForeground', {
      light: '#717171',
      dark: ColorCollection._transparent('foreground', 0.7),
      hcDark: ColorCollection._transparent('foreground', 0.7),
      hcLight: ColorCollection._transparent('foreground', 0.7),
    });

    this._registerColor('icon.foreground', {
      dark: '#C5C5C5',
      light: '#424242',
      hcDark: '#FFFFFF',
      hcLight: '#292929',
    });

    this._registerColor('focusBorder', {
      dark: '#007FD4',
      light: '#0090F1',
      hcDark: '#F38518',
      hcLight: '#006BBD',
    });

    this._registerColor('contrastBorder', {
      light: null,
      dark: null,
      hcDark: '#6FC3DF',
      hcLight: '#0F4A85',
    });

    this._registerColor('contrastActiveBorder', {
      light: null,
      dark: null,
      hcDark: ColorCollection._same('focusBorder'),
      hcLight: ColorCollection._same('focusBorder'),
    });

    this._registerColor('selection.background', null);

    // ------ text link

    this._registerColor('textLink.foreground', {
      light: '#006AB1',
      dark: '#3794FF',
      hcDark: '#21A6FF',
      hcLight: '#0F4A85',
    });

    this._registerColor('textLink.activeForeground', {
      light: '#006AB1',
      dark: '#3794FF',
      hcDark: '#21A6FF',
      hcLight: '#0F4A85',
    });

    this._registerColor('textSeparator.foreground', {
      light: '#0000002e',
      dark: '#ffffff2e',
      hcDark: Color.black,
      hcLight: '#292929',
    });

    // ------ text preformat

    this._registerColor('textPreformat.foreground', {
      light: '#A31515',
      dark: '#D7BA7D',
      hcDark: '#000000',
      hcLight: '#FFFFFF',
    });

    this._registerColor('textPreformat.background', {
      light: '#0000001A',
      dark: '#FFFFFF1A',
      hcDark: '#FFFFFF',
      hcLight: '#09345f',
    });

    // ------ text block quote

    this._registerColor('textBlockQuote.background', {
      light: '#f2f2f2',
      dark: '#222222',
      hcDark: null,
      hcLight: '#F2F2F2',
    });

    this._registerColor('textBlockQuote.border', {
      light: '#007acc80',
      dark: '#007acc80',
      hcDark: Color.white,
      hcLight: '#292929',
    });

    // ------ text code block

    this._registerColor('textCodeBlock.background', {
      light: '#dcdcdc66',
      dark: '#0a0a0a66',
      hcDark: Color.black,
      hcLight: '#F2F2F2',
    });

    // ----- editor

    this._registerColor('editor.background', {
      light: '#ffffff',
      dark: '#1E1E1E',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('editor.foreground', {
      light: '#333333',
      dark: '#BBBBBB',
      hcDark: Color.white,
      hcLight: ColorCollection._same('foreground'),
    });

    this._registerColor(
      'editorStickyScroll.background',
      ColorCollection._defaultSame('editor.background')
    );

    this._registerColor('editorStickyScrollHover.background', {
      dark: '#2A2D2E',
      light: '#F0F0F0',
      hcDark: null,
      hcLight: Color.fromHex('#0F4A85').transparent(0.1),
    });

    this._registerColor('editorStickyScroll.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor(
      'editorStickyScroll.shadow',
      ColorCollection._defaultSame('scrollbar.shadow')
    );

    this._registerColor('editorWidget.background', {
      dark: '#252526',
      light: '#F3F3F3',
      hcDark: '#0C141F',
      hcLight: Color.white,
    });

    this._registerColor('editorWidget.foreground', ColorCollection._defaultSame('foreground'));

    this._registerColor('editorWidget.border', {
      dark: '#454545',
      light: '#C8C8C8',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('editorWidget.resizeBorder', null);

    this._registerColor('editorError.background', null);

    this._registerColor('editorError.foreground', {
      dark: '#F14C4C',
      light: '#E51400',
      hcDark: '#F48771',
      hcLight: '#B5200D',
    });

    this._registerColor('editorError.border', {
      dark: null,
      light: null,
      hcDark: Color.fromHex('#E47777').transparent(0.8),
      hcLight: '#B5200D',
    });

    this._registerColor('editorWarning.background', null);

    this._registerColor('editorWarning.foreground', {
      dark: '#CCA700',
      light: '#BF8803',
      hcDark: '#FFD370',
      hcLight: '#895503',
    });

    this._registerColor('editorWarning.border', {
      dark: null,
      light: null,
      hcDark: Color.fromHex('#FFCC00').transparent(0.8),
      hcLight: Color.fromHex('#FFCC00').transparent(0.8),
    });

    this._registerColor('editorInfo.background', null);

    this._registerColor('editorInfo.foreground', {
      dark: '#3794FF',
      light: '#1a85ff',
      hcDark: '#3794FF',
      hcLight: '#1a85ff',
    });

    this._registerColor('editorInfo.border', {
      dark: null,
      light: null,
      hcDark: Color.fromHex('#3794FF').transparent(0.8),
      hcLight: '#292929',
    });

    this._registerColor('editorHint.foreground', {
      dark: Color.fromHex('#eeeeee').transparent(0.7),
      light: '#6c6c6c',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editorHint.border', {
      dark: null,
      light: null,
      hcDark: Color.fromHex('#eeeeee').transparent(0.8),
      hcLight: '#292929',
    });

    this._registerColor('editorLink.activeForeground', {
      dark: '#4E94CE',
      light: Color.blue,
      hcDark: Color.cyan,
      hcLight: '#292929',
    });

    // ----- editor selection

    this._registerColor('editor.selectionBackground', {
      light: '#ADD6FF',
      dark: '#264F78',
      hcDark: '#f3f518',
      hcLight: '#0F4A85',
    });

    this._registerColor('editor.selectionForeground', {
      light: null,
      dark: null,
      hcDark: '#000000',
      hcLight: Color.white,
    });

    this._registerColor('editor.inactiveSelectionBackground', {
      light: ColorCollection._transparent('editor.selectionBackground', 0.5),
      dark: ColorCollection._transparent('editor.selectionBackground', 0.5),
      hcDark: ColorCollection._transparent('editor.selectionBackground', 0.7),
      hcLight: ColorCollection._transparent('editor.selectionBackground', 0.5),
    });

    this._registerColor('editor.selectionHighlightBackground', {
      light: ColorCollection._lessProminent(
        'editor.selectionBackground',
        ColorCollection._same('editor.background'),
        0.3,
        0.6
      ),
      dark: ColorCollection._lessProminent(
        'editor.selectionBackground',
        ColorCollection._same('editor.background'),
        0.3,
        0.6
      ),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editor.selectionHighlightBorder', {
      light: null,
      dark: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    // ----- editor find

    this._registerColor('editor.findMatchBackground', {
      light: '#A8AC94',
      dark: '#515C6A',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editor.findMatchForeground', null);

    this._registerColor('editor.findMatchHighlightBackground', {
      light: '#EA5C0055',
      dark: '#EA5C0055',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editor.findMatchHighlightForeground', null);

    this._registerColor('editor.findRangeHighlightBackground', {
      dark: '#3a3d4166',
      light: '#b4b4b44d',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editor.findMatchBorder', {
      light: null,
      dark: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('editor.findMatchHighlightBorder', {
      light: null,
      dark: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('editor.findRangeHighlightBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._transparent('contrastActiveBorder', 0.4),
      hcLight: ColorCollection._transparent('contrastActiveBorder', 0.4),
    });

    // ----- editor hover

    this._registerColor('editor.hoverHighlightBackground', {
      light: '#ADD6FF26',
      dark: '#264f7840',
      hcDark: '#ADD6FF26',
      hcLight: null,
    });

    this._registerColor(
      'editorHoverWidget.background',
      ColorCollection._defaultSame('editorWidget.background')
    );

    this._registerColor(
      'editorHoverWidget.foreground',
      ColorCollection._defaultSame('editorWidget.foreground')
    );

    this._registerColor(
      'editorHoverWidget.border',
      ColorCollection._defaultSame('editorWidget.border')
    );

    this._registerColor('editorHoverWidget.statusBarBackground', {
      dark: ColorCollection._lighten('editorHoverWidget.background', 0.2),
      light: ColorCollection._darken('editorHoverWidget.background', 0.05),
      hcDark: ColorCollection._same('editorHoverWidget.background'),
      hcLight: ColorCollection._same('editorHoverWidget.background'),
    });

    // ----- editor inlay hint

    this._registerColor('editorInlayHint.foreground', {
      dark: '#969696',
      light: '#969696',
      hcDark: Color.white,
      hcLight: Color.black,
    });

    this._registerColor('editorInlayHint.background', {
      dark: ColorCollection._transparent('badge.background', 0.1),
      light: ColorCollection._transparent('badge.background', 0.1),
      hcDark: Color.white.transparent(0.1),
      hcLight: ColorCollection._transparent('badge.background', 0.1),
    });

    this._registerColor(
      'editorInlayHint.typeForeground',
      ColorCollection._defaultSame('editorInlayHint.foreground')
    );

    this._registerColor(
      'editorInlayHint.typeBackground',
      ColorCollection._defaultSame('editorInlayHint.background')
    );

    this._registerColor(
      'editorInlayHint.parameterForeground',
      ColorCollection._defaultSame('editorInlayHint.foreground')
    );

    this._registerColor(
      'editorInlayHint.parameterBackground',
      ColorCollection._defaultSame('editorInlayHint.background')
    );

    // ----- editor lightbulb

    this._registerColor('editorLightBulb.foreground', {
      dark: '#FFCC00',
      light: '#DDB100',
      hcDark: '#FFCC00',
      hcLight: '#007ACC',
    });

    this._registerColor('editorLightBulbAutoFix.foreground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor(
      'editorLightBulbAi.foreground',
      ColorCollection._defaultSame('editorLightBulb.foreground')
    );

    // ----- editor snippet

    this._registerColor('editor.snippetTabstopHighlightBackground', {
      dark: new Color(new RGBA(124, 124, 124, 0.3)),
      light: new Color(new RGBA(10, 50, 100, 0.2)),
      hcDark: new Color(new RGBA(124, 124, 124, 0.3)),
      hcLight: new Color(new RGBA(10, 50, 100, 0.2)),
    });

    this._registerColor('editor.snippetTabstopHighlightBorder', null);

    this._registerColor('editor.snippetFinalTabstopHighlightBackground', null);

    this._registerColor('editor.snippetFinalTabstopHighlightBorder', {
      dark: '#525252',
      light: new Color(new RGBA(10, 50, 100, 0.5)),
      hcDark: '#525252',
      hcLight: '#292929',
    });

    // ----- diff editor

    const defaultInsertColor = new Color(new RGBA(155, 185, 85, 0.2));
    const defaultRemoveColor = new Color(new RGBA(255, 0, 0, 0.2));

    this._registerColor('diffEditor.insertedTextBackground', {
      dark: '#9ccc2c33',
      light: '#9ccc2c40',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('diffEditor.removedTextBackground', {
      dark: '#ff000033',
      light: '#ff000033',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('diffEditor.insertedLineBackground', {
      dark: defaultInsertColor,
      light: defaultInsertColor,
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('diffEditor.removedLineBackground', {
      dark: defaultRemoveColor,
      light: defaultRemoveColor,
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('diffEditorGutter.insertedLineBackground', null);

    this._registerColor('diffEditorGutter.removedLineBackground', null);

    this._registerColor('diffEditorOverview.insertedForeground', null);

    this._registerColor('diffEditorOverview.removedForeground', null);

    this._registerColor('diffEditor.insertedTextBorder', {
      dark: null,
      light: null,
      hcDark: '#33ff2eff',
      hcLight: '#374E06',
    });

    this._registerColor('diffEditor.removedTextBorder', {
      dark: null,
      light: null,
      hcDark: '#FF008F',
      hcLight: '#AD0707',
    });

    this._registerColor('diffEditor.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('diffEditor.diagonalFill', {
      dark: '#cccccc33',
      light: '#22222233',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'diffEditor.unchangedRegionBackground',
      ColorCollection._defaultSame('sideBar.background')
    );

    this._registerColor(
      'diffEditor.unchangedRegionForeground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor('diffEditor.unchangedCodeBackground', {
      dark: '#74747429',
      light: '#b8b8b829',
      hcDark: null,
      hcLight: null,
    });

    // ----- widget

    this._registerColor('widget.shadow', {
      dark: Color.black.transparent(0.36),
      light: Color.black.transparent(0.16),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('widget.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    // ----- toolbar

    this._registerColor('toolbar.hoverBackground', {
      dark: '#5a5d5e50',
      light: '#b8b8b850',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('toolbar.hoverOutline', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('toolbar.activeBackground', {
      dark: ColorCollection._lighten('toolbar.hoverBackground', 0.1),
      light: ColorCollection._darken('toolbar.hoverBackground', 0.1),
      hcDark: null,
      hcLight: null,
    });

    // ----- breadcumbs

    this._registerColor(
      'breadcrumb.foreground',
      ColorCollection._defaultTransparent('foreground', 0.8)
    );

    this._registerColor('breadcrumb.background', ColorCollection._defaultSame('editor.background'));

    this._registerColor('breadcrumb.focusForeground', {
      light: ColorCollection._darken('foreground', 0.2),
      dark: ColorCollection._lighten('foreground', 0.1),
      hcDark: ColorCollection._lighten('foreground', 0.1),
      hcLight: ColorCollection._lighten('foreground', 0.1),
    });

    this._registerColor('breadcrumb.activeSelectionForeground', {
      light: ColorCollection._darken('foreground', 0.2),
      dark: ColorCollection._lighten('foreground', 0.1),
      hcDark: ColorCollection._lighten('foreground', 0.1),
      hcLight: ColorCollection._lighten('foreground', 0.1),
    });

    this._registerColor(
      'breadcrumbPicker.background',
      ColorCollection._defaultSame('editorWidget.background')
    );

    // ----- merge

    const headerTransparency = 0.5;
    const currentBaseColor = Color.fromHex('#40C8AE').transparent(headerTransparency);
    const incomingBaseColor = Color.fromHex('#40A6FF').transparent(headerTransparency);
    const commonBaseColor = Color.fromHex('#606060').transparent(0.4);
    const contentTransparency = 0.4;
    const rulerTransparency = 1;

    this._registerColor('merge.currentHeaderBackground', {
      dark: currentBaseColor,
      light: currentBaseColor,
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'merge.currentContentBackground',
      ColorCollection._defaultTransparent('merge.currentHeaderBackground', contentTransparency)
    );

    this._registerColor('merge.incomingHeaderBackground', {
      dark: incomingBaseColor,
      light: incomingBaseColor,
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'merge.incomingContentBackground',
      ColorCollection._defaultTransparent('merge.incomingHeaderBackground', contentTransparency)
    );

    this._registerColor('merge.commonHeaderBackground', {
      dark: commonBaseColor,
      light: commonBaseColor,
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'merge.commonContentBackground',
      ColorCollection._defaultTransparent('merge.commonHeaderBackground', contentTransparency)
    );

    this._registerColor('merge.border', {
      dark: null,
      light: null,
      hcDark: '#C3DF6F',
      hcLight: '#007ACC',
    });

    this._registerColor('editorOverviewRuler.currentContentForeground', {
      dark: ColorCollection._transparent('merge.currentHeaderBackground', rulerTransparency),
      light: ColorCollection._transparent('merge.currentHeaderBackground', rulerTransparency),
      hcDark: ColorCollection._same('merge.border'),
      hcLight: ColorCollection._same('merge.border'),
    });

    this._registerColor('editorOverviewRuler.incomingContentForeground', {
      dark: ColorCollection._transparent('merge.incomingHeaderBackground', rulerTransparency),
      light: ColorCollection._transparent('merge.incomingHeaderBackground', rulerTransparency),
      hcDark: ColorCollection._same('merge.border'),
      hcLight: ColorCollection._same('merge.border'),
    });

    this._registerColor('editorOverviewRuler.commonContentForeground', {
      dark: ColorCollection._transparent('merge.commonHeaderBackground', rulerTransparency),
      light: ColorCollection._transparent('merge.commonHeaderBackground', rulerTransparency),
      hcDark: ColorCollection._same('merge.border'),
      hcLight: ColorCollection._same('merge.border'),
    });

    this._registerColor('editorOverviewRuler.findMatchForeground', {
      dark: '#d186167e',
      light: '#d186167e',
      hcDark: '#AB5A00',
      hcLight: null,
    });

    this._registerColor(
      'editorOverviewRuler.selectionHighlightForeground',
      ColorCollection._defaultColor('#A0A0A0CC')
    );

    // ----- problems

    this._registerColor(
      'problemsErrorIcon.foreground',
      ColorCollection._defaultSame('editorError.foreground')
    );

    this._registerColor(
      'problemsWarningIcon.foreground',
      ColorCollection._defaultSame('editorWarning.foreground')
    );

    this._registerColor(
      'problemsInfoIcon.foreground',
      ColorCollection._defaultSame('editorInfo.foreground')
    );

    // ----- charts

    this._registerColor('charts.foreground', ColorCollection._defaultSame('foreground'));

    this._registerColor('charts.lines', ColorCollection._defaultTransparent('foreground', 0.5));

    this._registerColor('charts.red', ColorCollection._defaultSame('editorError.foreground'));

    this._registerColor('charts.blue', ColorCollection._defaultSame('editorInfo.foreground'));

    this._registerColor('charts.yellow', ColorCollection._defaultSame('editorWarning.foreground'));

    this._registerColor(
      'charts.orange',
      ColorCollection._defaultSame('minimap.findMatchHighlight')
    );

    this._registerColor('charts.green', {
      dark: '#89D185',
      light: '#388A34',
      hcDark: '#89D185',
      hcLight: '#374e06',
    });

    this._registerColor('charts.purple', {
      dark: '#B180D7',
      light: '#652D90',
      hcDark: '#B180D7',
      hcLight: '#652D90',
    });

    // ----- input

    this._registerColor('input.background', {
      dark: '#3C3C3C',
      light: Color.white,
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('input.foreground', ColorCollection._defaultSame('foreground'));

    this._registerColor('input.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('inputOption.activeBorder', {
      dark: '#007ACC',
      light: '#007ACC',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('inputOption.hoverBackground', {
      dark: '#5a5d5e80',
      light: '#b8b8b850',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('inputOption.activeBackground', {
      dark: ColorCollection._transparent('focusBorder', 0.4),
      light: ColorCollection._transparent('focusBorder', 0.2),
      hcDark: Color.transparent,
      hcLight: Color.transparent,
    });

    this._registerColor('inputOption.activeForeground', {
      dark: Color.white,
      light: Color.black,
      hcDark: ColorCollection._same('foreground'),
      hcLight: ColorCollection._same('foreground'),
    });

    this._registerColor('input.placeholderForeground', {
      light: ColorCollection._transparent('foreground', 0.5),
      dark: ColorCollection._transparent('foreground', 0.5),
      hcDark: ColorCollection._transparent('foreground', 0.7),
      hcLight: ColorCollection._transparent('foreground', 0.7),
    });

    // ----- input validation

    this._registerColor('inputValidation.infoBackground', {
      dark: '#063B49',
      light: '#D6ECF2',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('inputValidation.infoForeground', {
      dark: null,
      light: null,
      hcDark: null,
      hcLight: ColorCollection._same('foreground'),
    });

    this._registerColor('inputValidation.infoBorder', {
      dark: '#007acc',
      light: '#007acc',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('inputValidation.warningBackground', {
      dark: '#352A05',
      light: '#F6F5D2',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('inputValidation.warningForeground', {
      dark: null,
      light: null,
      hcDark: null,
      hcLight: ColorCollection._same('foreground'),
    });

    this._registerColor('inputValidation.warningBorder', {
      dark: '#B89500',
      light: '#B89500',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('inputValidation.errorBackground', {
      dark: '#5A1D1D',
      light: '#F2DEDE',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('inputValidation.errorForeground', {
      dark: null,
      light: null,
      hcDark: null,
      hcLight: ColorCollection._same('foreground'),
    });

    this._registerColor('inputValidation.errorBorder', {
      dark: '#BE1100',
      light: '#BE1100',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    // ----- select

    this._registerColor('dropdown.background', {
      dark: '#3C3C3C',
      light: Color.white,
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('dropdown.listBackground', {
      dark: null,
      light: null,
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('dropdown.foreground', {
      dark: '#F0F0F0',
      light: ColorCollection._same('foreground'),
      hcDark: Color.white,
      hcLight: ColorCollection._same('foreground'),
    });

    this._registerColor('dropdown.border', {
      dark: ColorCollection._same('dropdown.background'),
      light: '#CECECE',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    // ------ button

    this._registerColor('button.foreground', ColorCollection._defaultColor(Color.white));

    this._registerColor(
      'button.separator',
      ColorCollection._defaultTransparent('button.foreground', 0.4)
    );

    this._registerColor('button.background', {
      dark: '#0E639C',
      light: '#007ACC',
      hcDark: null,
      hcLight: '#0F4A85',
    });

    this._registerColor('button.hoverBackground', {
      dark: ColorCollection._lighten('button.background', 0.2),
      light: ColorCollection._darken('button.background', 0.2),
      hcDark: ColorCollection._same('button.background'),
      hcLight: ColorCollection._same('button.background'),
    });

    this._registerColor('button.border', ColorCollection._defaultColor('contrastBorder'));

    this._registerColor('button.secondaryForeground', {
      dark: Color.white,
      light: Color.white,
      hcDark: Color.white,
      hcLight: ColorCollection._same('foreground'),
    });

    this._registerColor('button.secondaryBackground', {
      dark: '#3A3D41',
      light: '#5F6A79',
      hcDark: null,
      hcLight: Color.white,
    });

    this._registerColor('button.secondaryHoverBackground', {
      dark: ColorCollection._lighten('button.secondaryBackground', 0.2),
      light: ColorCollection._darken('button.secondaryBackground', 0.2),
      hcDark: null,
      hcLight: null,
    });

    // ------ checkbox

    this._registerColor('checkbox.background', ColorCollection._defaultSame('dropdown.background'));

    this._registerColor(
      'checkbox.selectBackground',
      ColorCollection._defaultSame('editorWidget.background')
    );

    this._registerColor('checkbox.foreground', ColorCollection._defaultSame('dropdown.foreground'));

    this._registerColor('checkbox.border', ColorCollection._defaultSame('dropdown.border'));

    this._registerColor('checkbox.selectBorder', ColorCollection._defaultSame('icon.foreground'));

    // ------ keybinding label

    this._registerColor('keybindingLabel.background', {
      dark: new Color(new RGBA(128, 128, 128, 0.17)),
      light: new Color(new RGBA(221, 221, 221, 0.4)),
      hcDark: Color.transparent,
      hcLight: Color.transparent,
    });

    this._registerColor('keybindingLabel.foreground', {
      dark: Color.fromHex('#CCCCCC'),
      light: Color.fromHex('#555555'),
      hcDark: Color.white,
      hcLight: ColorCollection._same('foreground'),
    });

    this._registerColor('keybindingLabel.border', {
      dark: new Color(new RGBA(51, 51, 51, 0.6)),
      light: new Color(new RGBA(204, 204, 204, 0.4)),
      hcDark: new Color(new RGBA(111, 195, 223)),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('keybindingLabel.bottomBorder', {
      dark: new Color(new RGBA(68, 68, 68, 0.6)),
      light: new Color(new RGBA(187, 187, 187, 0.4)),
      hcDark: new Color(new RGBA(111, 195, 223)),
      hcLight: ColorCollection._same('foreground'),
    });

    // ------ list

    this._registerColor('list.focusBackground', null);

    this._registerColor('list.focusForeground', null);

    this._registerColor('list.focusOutline', {
      dark: ColorCollection._same('focusBorder'),
      light: ColorCollection._same('focusBorder'),
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('list.focusAndSelectionOutline', null);

    this._registerColor('list.activeSelectionBackground', {
      dark: '#04395E',
      light: '#0060C0',
      hcDark: null,
      hcLight: Color.fromHex('#0F4A85').transparent(0.1),
    });

    this._registerColor('list.activeSelectionForeground', {
      dark: Color.white,
      light: Color.white,
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('list.activeSelectionIconForeground', null);

    this._registerColor('list.inactiveSelectionBackground', {
      dark: '#37373D',
      light: '#E4E6F1',
      hcDark: null,
      hcLight: Color.fromHex('#0F4A85').transparent(0.1),
    });

    this._registerColor('list.inactiveSelectionForeground', null);

    this._registerColor('list.inactiveSelectionIconForeground', null);

    this._registerColor('list.inactiveFocusBackground', null);

    this._registerColor('list.inactiveFocusOutline', null);

    this._registerColor('list.hoverBackground', {
      dark: '#2A2D2E',
      light: '#F0F0F0',
      hcDark: Color.white.transparent(0.1),
      hcLight: Color.fromHex('#0F4A85').transparent(0.1),
    });

    this._registerColor('list.hoverForeground', null);

    this._registerColor('list.dropBackground', {
      dark: '#062F4A',
      light: '#D6EBFF',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('list.dropBetweenBackground', {
      dark: ColorCollection._same('icon.foreground'),
      light: ColorCollection._same('icon.foreground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('list.highlightForeground', {
      dark: '#2AAAFF',
      light: '#0066BF',
      hcDark: ColorCollection._same('focusBorder'),
      hcLight: ColorCollection._same('focusBorder'),
    });

    this._registerColor('list.focusHighlightForeground', {
      dark: ColorCollection._same('list.highlightForeground'),
      light: ColorCollection._ifDefinedThenElse(
        'list.activeSelectionBackground',
        ColorCollection._same('list.highlightForeground'),
        '#BBE7FF'
      ),
      hcDark: ColorCollection._same('list.highlightForeground'),
      hcLight: ColorCollection._same('list.highlightForeground'),
    });

    this._registerColor('list.invalidItemForeground', {
      dark: '#B89500',
      light: '#B89500',
      hcDark: '#B89500',
      hcLight: '#B5200D',
    });

    this._registerColor('list.errorForeground', {
      dark: '#F88070',
      light: '#B01011',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('list.warningForeground', {
      dark: '#CCA700',
      light: '#855F00',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('listFilterWidget.background', {
      light: ColorCollection._darken('editorWidget.background', 0),
      dark: ColorCollection._lighten('editorWidget.background', 0),
      hcDark: ColorCollection._same('editorWidget.background'),
      hcLight: ColorCollection._same('editorWidget.background'),
    });

    this._registerColor('listFilterWidget.outline', {
      dark: Color.transparent,
      light: Color.transparent,
      hcDark: '#f38518',
      hcLight: '#007ACC',
    });

    this._registerColor('listFilterWidget.noMatchesOutline', {
      dark: '#BE1100',
      light: '#BE1100',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('listFilterWidget.shadow', ColorCollection._defaultSame('widget.shadow'));

    this._registerColor('list.filterMatchBackground', {
      dark: ColorCollection._same('editor.findMatchHighlightBackground'),
      light: ColorCollection._same('editor.findMatchHighlightBackground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('list.filterMatchBorder', {
      dark: ColorCollection._same('editor.findMatchHighlightBorder'),
      light: ColorCollection._same('editor.findMatchHighlightBorder'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('list.deemphasizedForeground', {
      dark: '#8C8C8C',
      light: '#8E8E90',
      hcDark: '#A7A8A9',
      hcLight: '#666666',
    });

    // ------ tree

    this._registerColor('tree.indentGuidesStroke', {
      dark: '#585858',
      light: '#a9a9a9',
      hcDark: '#a9a9a9',
      hcLight: '#a5a5a5',
    });

    this._registerColor(
      'tree.inactiveIndentGuidesStroke',
      ColorCollection._defaultTransparent('tree.indentGuidesStroke', 0.4)
    );

    // ------ table

    this._registerColor('tree.tableColumnsBorder', {
      dark: '#CCCCCC20',
      light: '#61616120',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('tree.tableOddRowsBackground', {
      dark: ColorCollection._transparent('foreground', 0.04),
      light: ColorCollection._transparent('foreground', 0.04),
      hcDark: null,
      hcLight: null,
    });

    // ------ menu

    this._registerColor('menu.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('menu.foreground', ColorCollection._defaultSame('dropdown.foreground'));

    this._registerColor('menu.background', ColorCollection._defaultSame('dropdown.background'));

    this._registerColor(
      'menu.selectionForeground',
      ColorCollection._defaultSame('list.activeSelectionForeground')
    );

    this._registerColor(
      'menu.selectionBackground',
      ColorCollection._defaultSame('list.activeSelectionBackground')
    );

    this._registerColor('menu.selectionBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('menu.separatorBackground', {
      dark: '#606060',
      light: '#D4D4D4',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    // ------ minimap

    this._registerColor('minimap.findMatchHighlight', {
      light: '#d18616',
      dark: '#d18616',
      hcDark: '#AB5A00',
      hcLight: '#0F4A85',
    });

    this._registerColor('minimap.selectionOccurrenceHighlight', {
      light: '#c9c9c9',
      dark: '#676767',
      hcDark: '#ffffff',
      hcLight: '#0F4A85',
    });

    this._registerColor('minimap.selectionHighlight', {
      light: '#ADD6FF',
      dark: '#264F78',
      hcDark: '#ffffff',
      hcLight: '#0F4A85',
    });

    this._registerColor('minimap.infoHighlight', {
      dark: ColorCollection._same('editorInfo.foreground'),
      light: ColorCollection._same('editorInfo.foreground'),
      hcDark: ColorCollection._same('editorInfo.border'),
      hcLight: ColorCollection._same('editorInfo.border'),
    });

    this._registerColor('minimap.warningHighlight', {
      dark: ColorCollection._same('editorWarning.foreground'),
      light: ColorCollection._same('editorWarning.foreground'),
      hcDark: ColorCollection._same('editorWarning.border'),
      hcLight: ColorCollection._same('editorWarning.border'),
    });

    this._registerColor('minimap.errorHighlight', {
      dark: new Color(new RGBA(255, 18, 18, 0.7)),
      light: new Color(new RGBA(255, 18, 18, 0.7)),
      hcDark: new Color(new RGBA(255, 50, 50, 1)),
      hcLight: '#B5200D',
    });

    this._registerColor('minimap.background', null);

    this._registerColor(
      'minimap.foregroundOpacity',
      ColorCollection._defaultColor(Color.fromHex('#000f'))
    );

    this._registerColor(
      'minimapSlider.background',
      ColorCollection._defaultTransparent('scrollbarSlider.background', 0.5)
    );

    this._registerColor(
      'minimapSlider.hoverBackground',
      ColorCollection._defaultTransparent('scrollbarSlider.hoverBackground', 0.5)
    );

    this._registerColor(
      'minimapSlider.activeBackground',
      ColorCollection._defaultTransparent('scrollbarSlider.activeBackground', 0.5)
    );

    // ----- sash

    this._registerColor('sash.hoverBorder', ColorCollection._defaultSame('focusBorder'));

    // ----- badge

    this._registerColor('badge.background', {
      dark: '#4D4D4D',
      light: '#C4C4C4',
      hcDark: Color.black,
      hcLight: '#0F4A85',
    });

    this._registerColor('badge.foreground', {
      dark: Color.white,
      light: '#333',
      hcDark: Color.white,
      hcLight: Color.white,
    });

    // ----- scrollbar

    this._registerColor('scrollbar.shadow', {
      dark: '#000000',
      light: '#DDDDDD',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('scrollbarSlider.background', {
      dark: Color.fromHex('#797979').transparent(0.4),
      light: Color.fromHex('#646464').transparent(0.4),
      hcDark: ColorCollection._transparent('contrastBorder', 0.6),
      hcLight: ColorCollection._transparent('contrastBorder', 0.4),
    });

    this._registerColor('scrollbarSlider.hoverBackground', {
      dark: Color.fromHex('#646464').transparent(0.7),
      light: Color.fromHex('#646464').transparent(0.7),
      hcDark: ColorCollection._transparent('contrastBorder', 0.8),
      hcLight: ColorCollection._transparent('contrastBorder', 0.8),
    });

    this._registerColor('scrollbarSlider.activeBackground', {
      dark: Color.fromHex('#BFBFBF').transparent(0.4),
      light: Color.fromHex('#000000').transparent(0.6),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    // ----- progress bar

    this._registerColor('progressBar.background', {
      dark: Color.fromHex('#0E70C0'),
      light: Color.fromHex('#0E70C0'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    // ----- quick pick

    this._registerColor(
      'quickInput.background',
      ColorCollection._defaultSame('editorWidget.background')
    );

    this._registerColor(
      'quickInput.foreground',
      ColorCollection._defaultSame('editorWidget.foreground')
    );

    this._registerColor('quickInputTitle.background', {
      dark: new Color(new RGBA(255, 255, 255, 0.105)),
      light: new Color(new RGBA(0, 0, 0, 0.06)),
      hcDark: '#000000',
      hcLight: Color.white,
    });

    this._registerColor('pickerGroup.foreground', {
      dark: '#3794FF',
      light: '#0066BF',
      hcDark: Color.white,
      hcLight: '#0F4A85',
    });

    this._registerColor('pickerGroup.border', {
      dark: '#3F3F46',
      light: '#CCCEDB',
      hcDark: Color.white,
      hcLight: '#0F4A85',
    });

    this._registerColor('quickInput.list.focusBackground', null);

    this._registerColor(
      'quickInputList.focusForeground',
      ColorCollection._defaultSame('list.activeSelectionForeground')
    );

    this._registerColor(
      'quickInputList.focusIconForeground',
      ColorCollection._defaultSame('list.activeSelectionIconForeground')
    );

    this._registerColor('quickInputList.focusBackground', {
      dark: ColorCollection._same('list.activeSelectionBackground'),
      light: ColorCollection._same('list.activeSelectionBackground'),
      hcDark: null,
      hcLight: null,
    });

    // ----- search

    this._registerColor('search.resultsInfoForeground', {
      light: ColorCollection._same('foreground'),
      dark: ColorCollection._transparent('foreground', 0.65),
      hcDark: ColorCollection._same('foreground'),
      hcLight: ColorCollection._same('foreground'),
    });

    // ----- search editor (Distinct from normal editor find match to allow for better differentiation)

    this._registerColor('searchEditor.findMatchBackground', {
      light: ColorCollection._transparent('editor.findMatchHighlightBackground', 0.66),
      dark: ColorCollection._transparent('editor.findMatchHighlightBackground', 0.66),
      hcDark: ColorCollection._same('editor.findMatchHighlightBackground'),
      hcLight: ColorCollection._same('editor.findMatchHighlightBackground'),
    });

    this._registerColor('searchEditor.findMatchBorder', {
      light: ColorCollection._transparent('editor.findMatchHighlightBorder', 0.66),
      dark: ColorCollection._transparent('editor.findMatchHighlightBorder', 0.66),
      hcDark: ColorCollection._same('editor.findMatchHighlightBorder'),
      hcLight: ColorCollection._same('editor.findMatchHighlightBorder'),
    });

    // ------ end
  }

  private _getColor(key: VSCColors, colorScheme: ColorScheme) {
    const colorDefault = this.collection.get(key);
    if (!colorDefault) return Color.transparent;

    const color = this._getColorFromColorValue(colorDefault[colorScheme], colorScheme);
    return color;
  }

  private _getColorFromColorValue(
    colorValue: ColorValue | null,
    colorScheme: ColorScheme
  ): Color | null {
    if (colorValue === null) return null;
    if (typeof colorValue === 'string') return parseHex(colorValue);
    if (colorValue instanceof Color) {
      return colorValue;
    }

    switch (colorValue.op) {
      case ColorTransformType.Same: {
        const color = this._getColor(colorValue.key, colorScheme);
        return color;
      }

      case ColorTransformType.Darken: {
        const originColor = this._getColor(colorValue.key, colorScheme);
        const color = originColor?.darken(colorValue.factor) ?? null;
        return color;
      }

      case ColorTransformType.Lighten: {
        const originColor = this._getColor(colorValue.key, colorScheme);
        const color = originColor?.lighten(colorValue.factor) ?? null;
        return color;
      }

      case ColorTransformType.Transparent: {
        const originColor = this._getColor(colorValue.key, colorScheme);
        const color = originColor?.transparent(colorValue.factor) ?? null;
        return color;
      }

      case ColorTransformType.IfDefinedThenElse: {
        const colorDefault = this.collection.get(colorValue.if);
        if (!colorDefault || !colorDefault[colorScheme])
          return this._getColorFromColorValue(colorValue.else, colorScheme);
        return this._getColorFromColorValue(colorValue.else, colorScheme);
      }

      case ColorTransformType.LessProminent: {
        const originColor = this._getColor(colorValue.key, colorScheme);
        if (!originColor) return null;
        const backgroundColor = this._getColorFromColorValue(colorValue.background, colorScheme);

        if (!backgroundColor)
          return originColor.transparent(colorValue.factor * colorValue.transparency);

        return originColor.isDarkerThan(backgroundColor)
          ? Color.getLighterColor(originColor, backgroundColor, colorValue.factor).transparent(
              colorValue.transparency
            )
          : Color.getDarkerColor(originColor, backgroundColor, colorValue.factor).transparent(
              colorValue.transparency
            );
      }

      default: {
        return Color.transparent;
      }
    }
  }

  public registerThemeColor(themeColors: Partial<IVSCTheme['colors']>) {
    Object.entries(themeColors).forEach(([key, color]) => {
      this._registerColor(key as VSCColors, ColorCollection._defaultColor(color));
    });

    return this;
  }

  public genrateThemeColors(colorScheme: ColorScheme) {
    const result = {} as IVSCTheme['colors'];
    this.collection.forEach((colorValue, key) => {
      const color = this._getColorFromColorValue(colorValue[colorScheme], colorScheme);
      if (!color) {
        result[key] = Color.transparent.toString();
      } else {
        result[key] = color.toString();
      }
    });

    return result;
  }

  private static _same(key: VSCColors) {
    return { op: ColorTransformType.Same, key } as const;
  }

  private static _transparent(key: VSCColors, factor: number) {
    return { op: ColorTransformType.Transparent, key, factor } as const;
  }

  private static _lighten(key: VSCColors, factor: number) {
    return { op: ColorTransformType.Lighten, key, factor } as const;
  }

  private static _darken(key: VSCColors, factor: number) {
    return { op: ColorTransformType.Darken, key, factor } as const;
  }

  private static _defaultSame(key: VSCColors) {
    return {
      light: ColorCollection._same(key),
      dark: ColorCollection._same(key),
      hcDark: ColorCollection._same(key),
      hcLight: ColorCollection._same(key),
    };
  }

  private static _defaultTransparent(key: VSCColors, factor: number) {
    return {
      light: ColorCollection._transparent(key, factor),
      dark: ColorCollection._transparent(key, factor),
      hcDark: ColorCollection._transparent(key, factor),
      hcLight: ColorCollection._transparent(key, factor),
    };
  }

  private static _defaultColor(color: Color | string) {
    return {
      light: color,
      dark: color,
      hcDark: color,
      hcLight: color,
    };
  }

  private static _lessProminent(
    key: VSCColors,
    backgroundColor: ColorValue,
    factor: number,
    transparency: number
  ) {
    return {
      op: ColorTransformType.LessProminent,
      key,
      background: backgroundColor,
      factor,
      transparency,
    } as const;
  }

  private static _ifDefinedThenElse(ifArg: VSCColors, thenArg: ColorValue, elseArg: ColorValue) {
    return {
      op: ColorTransformType.IfDefinedThenElse,
      if: ifArg,
      then: thenArg,
      else: elseArg,
    } as const;
  }
}

export default ColorCollection;
