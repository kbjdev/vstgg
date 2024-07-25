/* eslint-disable max-lines */
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
  OneOf,
  Opaque,
}

type ColorTransformKeyType = VSCColors | ColorTransform;

export type ColorTransform =
  | { op: ColorTransformType.Darken; key: ColorTransformKeyType; factor: number }
  | { op: ColorTransformType.Lighten; key: ColorTransformKeyType; factor: number }
  | { op: ColorTransformType.Transparent; key: ColorTransformKeyType; factor: number }
  | { op: ColorTransformType.Same; key: ColorTransformKeyType }
  | { op: ColorTransformType.OneOf; keys: [ColorTransformKeyType, ColorTransformKeyType] }
  | {
      op: ColorTransformType.LessProminent;
      key: ColorTransformKeyType;
      background: ColorValue;
      factor: number;
      transparency: number;
    }
  | {
      op: ColorTransformType.IfDefinedThenElse;
      if: VSCColors;
      then: ColorValue;
      else: ColorValue;
    }
  | { op: ColorTransformType.Opaque; key: ColorTransformKeyType; background: ColorValue };

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

  private _getColor(key: VSCColors, colorScheme: ColorScheme) {
    const colorDefault = this.collection.get(key);
    if (!colorDefault) return Color.transparent;

    const color = this._getColorFromColorValue(colorDefault[colorScheme], colorScheme);
    return color;
  }

  private _isTransformColorKey(key: ColorTransformKeyType): key is ColorTransform {
    return typeof key !== 'string';
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
        if (this._isTransformColorKey(colorValue.key)) {
          const color = this._getColorFromColorValue(colorValue.key, colorScheme);
          return color;
        }
        const color = this._getColor(colorValue.key, colorScheme);
        return color;
      }

      case ColorTransformType.Darken: {
        if (this._isTransformColorKey(colorValue.key)) {
          const color = this._getColorFromColorValue(colorValue.key, colorScheme);
          return color?.darken(colorValue.factor) ?? null;
        }
        const originColor = this._getColor(colorValue.key, colorScheme);
        const color = originColor?.darken(colorValue.factor) ?? null;
        return color;
      }

      case ColorTransformType.Lighten: {
        if (this._isTransformColorKey(colorValue.key)) {
          const color = this._getColorFromColorValue(colorValue.key, colorScheme);
          return color?.lighten(colorValue.factor) ?? null;
        }
        const originColor = this._getColor(colorValue.key, colorScheme);
        const color = originColor?.lighten(colorValue.factor) ?? null;
        return color;
      }

      case ColorTransformType.Transparent: {
        if (this._isTransformColorKey(colorValue.key)) {
          const color = this._getColorFromColorValue(colorValue.key, colorScheme);
          return color?.transparent(colorValue.factor) ?? null;
        }
        const originColor = this._getColor(colorValue.key, colorScheme);
        const color = originColor?.transparent(colorValue.factor) ?? null;
        return color;
      }

      case ColorTransformType.OneOf: {
        const colors = colorValue.keys.map((key) => {
          if (this._isTransformColorKey(key)) {
            const color = this._getColorFromColorValue(key, colorScheme);
            return color;
          }
          const color = this._getColor(key, colorScheme);
          return color;
        });

        const result = colors.find((c) => c !== null) ?? null;
        return result;
      }

      case ColorTransformType.IfDefinedThenElse: {
        const colorDefault = this.collection.get(colorValue.if);
        if (!colorDefault || !colorDefault[colorScheme])
          return this._getColorFromColorValue(colorValue.else, colorScheme);
        return this._getColorFromColorValue(colorValue.else, colorScheme);
      }

      case ColorTransformType.LessProminent: {
        let originColor: Color | null;

        if (this._isTransformColorKey(colorValue.key)) {
          originColor = this._getColorFromColorValue(colorValue.key, colorScheme);
        } else {
          originColor = this._getColor(colorValue.key, colorScheme);
        }

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

      case ColorTransformType.Opaque: {
        let originColor: Color | null;

        if (this._isTransformColorKey(colorValue.key)) {
          originColor = this._getColorFromColorValue(colorValue.key, colorScheme);
        } else {
          originColor = this._getColor(colorValue.key, colorScheme);
        }

        const backgroundColor = this._getColorFromColorValue(colorValue.background, colorScheme);
        if (!backgroundColor) {
          return originColor;
        }

        return originColor?.makeOpaque(backgroundColor) ?? null;
      }

      default: {
        return null;
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

  private static _same(key: ColorTransformKeyType): ColorTransform {
    return { op: ColorTransformType.Same, key };
  }

  private static _transparent(key: ColorTransformKeyType, factor: number): ColorTransform {
    return { op: ColorTransformType.Transparent, key, factor };
  }

  private static _lighten(key: ColorTransformKeyType, factor: number): ColorTransform {
    return { op: ColorTransformType.Lighten, key, factor };
  }

  private static _darken(key: ColorTransformKeyType, factor: number): ColorTransform {
    return { op: ColorTransformType.Darken, key, factor };
  }

  private static _opaque(key: ColorTransformKeyType, background: ColorValue): ColorTransform {
    return { op: ColorTransformType.Opaque, key, background };
  }

  private static _defaultSame(key: ColorTransformKeyType) {
    return {
      light: ColorCollection._same(key),
      dark: ColorCollection._same(key),
      hcDark: ColorCollection._same(key),
      hcLight: ColorCollection._same(key),
    };
  }

  private static _defaultTransparent(key: ColorTransformKeyType, factor: number) {
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
    key: ColorTransformKeyType,
    backgroundColor: ColorValue,
    factor: number,
    transparency: number
  ): ColorTransform {
    return {
      op: ColorTransformType.LessProminent,
      key,
      background: backgroundColor,
      factor,
      transparency,
    };
  }

  private static _ifDefinedThenElse(
    ifArg: VSCColors,
    thenArg: ColorValue,
    elseArg: ColorValue
  ): ColorTransform {
    return {
      op: ColorTransformType.IfDefinedThenElse,
      if: ifArg,
      then: thenArg,
      else: elseArg,
    };
  }

  private static _oneOf(key1: ColorTransformKeyType, key2: ColorTransformKeyType): ColorTransform {
    return {
      op: ColorTransformType.OneOf,
      keys: [key1, key2],
    };
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

    this._registerColor('editor.lineHighlightBackground', null);

    this._registerColor('editor.lineHighlightBorder', {
      dark: '#282828',
      light: '#eeeeee',
      hcDark: '#f38518',
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('editor.rangeHighlightBackground', {
      dark: '#ffffff0b',
      light: '#fdff0033',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editor.rangeHighlightBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('editor.symbolHighlightBackground', {
      dark: ColorCollection._same('editor.findMatchHighlightBackground'),
      light: ColorCollection._same('editor.findMatchHighlightBackground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editor.symbolHighlightBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('editorCursor.foreground', {
      dark: '#AEAFAD',
      light: Color.black,
      hcDark: Color.white,
      hcLight: '#0F4A85',
    });

    this._registerColor('editorCursor.background', null);

    this._registerColor(
      'editorMultiCursor.primary.foreground',
      ColorCollection._defaultSame('editorCursor.foreground')
    );

    this._registerColor(
      'editorMultiCursor.primary.background',
      ColorCollection._defaultSame('editorCursor.background')
    );

    this._registerColor(
      'editorMultiCursor.secondary.foreground',
      ColorCollection._defaultSame('editorCursor.foreground')
    );

    this._registerColor(
      'editorMultiCursor.secondary.background',
      ColorCollection._defaultSame('editorCursor.background')
    );

    this._registerColor('editorWhitespace.foreground', {
      dark: '#e3e4e229',
      light: '#33333333',
      hcDark: '#e3e4e229',
      hcLight: '#CCCCCC',
    });

    this._registerColor('editorLineNumber.foreground', {
      dark: '#858585',
      light: '#237893',
      hcDark: Color.white,
      hcLight: '#292929',
    });

    this._registerColor(
      'editorIndentGuide.background',
      ColorCollection._defaultSame('editorWhitespace.foreground')
    );

    this._registerColor(
      'editorIndentGuide.activeBackground',
      ColorCollection._defaultSame('editorWhitespace.foreground')
    );

    this._registerColor(
      'editorIndentGuide.background1',
      ColorCollection._defaultSame('editorIndentGuide.background')
    );

    this._registerColor(
      'editorIndentGuide.background2',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.background3',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.background4',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.background5',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.background6',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.activeBackground1',
      ColorCollection._defaultSame('editorIndentGuide.activeBackground')
    );

    this._registerColor(
      'editorIndentGuide.activeBackground2',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.activeBackground3',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.activeBackground4',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.activeBackground5',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorIndentGuide.activeBackground6',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor('editorActiveLineNumber.foreground', {
      dark: '#c6c6c6',
      light: '#0B216F',
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor(
      'editorLineNumber.activeForeground',
      ColorCollection._defaultSame('editorActiveLineNumber.foreground')
    );

    this._registerColor('editorLineNumber.dimmedForeground', null);

    this._registerColor('editorRuler.foreground', {
      dark: '#5A5A5A',
      light: Color.lightgrey,
      hcDark: Color.white,
      hcLight: '#292929',
    });

    this._registerColor('editorCodeLens.foreground', {
      dark: '#999999',
      light: '#919191',
      hcDark: '#999999',
      hcLight: '#292929',
    });

    this._registerColor('editorBracketMatch.background', {
      dark: '#0064001a',
      light: '#0064001a',
      hcDark: '#0064001a',
      hcLight: '#0000',
    });

    this._registerColor('editorBracketMatch.border', {
      dark: '#888',
      light: '#B9B9B9',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('editorOverviewRuler.border', {
      dark: '#7f7f7f4d',
      light: '#7f7f7f4d',
      hcDark: '#7f7f7f4d',
      hcLight: '#666666',
    });

    this._registerColor('editorOverviewRuler.background', null);

    this._registerColor(
      'editorGutter.background',
      ColorCollection._defaultSame('editor.background')
    );

    this._registerColor('editorUnnecessaryCode.border', {
      dark: null,
      light: null,
      hcDark: Color.fromHex('#fff').transparent(0.8),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('editorUnnecessaryCode.opacity', {
      dark: Color.fromHex('#000a'),
      light: Color.fromHex('#0007'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editorGhostText.border', {
      dark: null,
      light: null,
      hcDark: Color.fromHex('#fff').transparent(0.8),
      hcLight: Color.fromHex('#292929').transparent(0.8),
    });

    this._registerColor('editorGhostText.foreground', {
      dark: Color.fromHex('#ffffff56'),
      light: Color.fromHex('#0007'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editorGhostText.background', null);

    this._registerColor(
      'editorOverviewRuler.rangeHighlightForeground',
      ColorCollection._defaultColor(new Color(new RGBA(0, 122, 204, 0.6)))
    );

    this._registerColor('editorOverviewRuler.errorForeground', {
      dark: new Color(new RGBA(255, 18, 18, 0.7)),
      light: new Color(new RGBA(255, 18, 18, 0.7)),
      hcDark: new Color(new RGBA(255, 50, 50, 1)),
      hcLight: '#B5200D',
    });

    this._registerColor('editorOverviewRuler.warningForeground', {
      dark: ColorCollection._same('editorWarning.foreground'),
      light: ColorCollection._same('editorWarning.foreground'),
      hcDark: ColorCollection._same('editorWarning.border'),
      hcLight: ColorCollection._same('editorWarning.border'),
    });

    this._registerColor('editorOverviewRuler.infoForeground', {
      dark: ColorCollection._same('editorInfo.foreground'),
      light: ColorCollection._same('editorInfo.foreground'),
      hcDark: ColorCollection._same('editorInfo.border'),
      hcLight: ColorCollection._same('editorInfo.border'),
    });

    this._registerColor('editorBracketHighlight.foreground1', {
      dark: '#FFD700',
      light: '#0431FAFF',
      hcDark: '#FFD700',
      hcLight: '#0431FAFF',
    });

    this._registerColor('editorBracketHighlight.foreground2', {
      dark: '#DA70D6',
      light: '#319331FF',
      hcDark: '#DA70D6',
      hcLight: '#319331FF',
    });

    this._registerColor('editorBracketHighlight.foreground3', {
      dark: '#179FFF',
      light: '#7B3814FF',
      hcDark: '#87CEFA',
      hcLight: '#7B3814FF',
    });

    this._registerColor(
      'editorBracketHighlight.foreground4',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketHighlight.foreground5',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketHighlight.foreground6',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor('editorBracketHighlight.unexpectedBracket.foreground', {
      dark: new Color(new RGBA(255, 18, 18, 0.8)),
      light: new Color(new RGBA(255, 18, 18, 0.8)),
      hcDark: new Color(new RGBA(255, 50, 50, 1)),
      hcLight: '',
    });

    this._registerColor(
      'editorBracketPairGuide.background1',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.background2',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.background3',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.background4',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.background5',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.background6',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.activeBackground1',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.activeBackground2',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.activeBackground3',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.activeBackground4',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.activeBackground5',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorBracketPairGuide.activeBackground6',
      ColorCollection._defaultColor('#00000000')
    );

    this._registerColor(
      'editorUnicodeHighlight.border',
      ColorCollection._defaultSame('editorWarning.foreground')
    );

    this._registerColor(
      'editorUnicodeHighlight.background',
      ColorCollection._defaultSame('editorWarning.background')
    );

    this._registerColor(
      'editorOverviewRuler.bracketMatchForeground',
      ColorCollection._defaultColor('#A0A0A0')
    );

    this._registerColor('editor.foldBackground', {
      light: ColorCollection._transparent('editor.selectionBackground', 0.3),
      dark: ColorCollection._transparent('editor.selectionBackground', 0.3),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editor.foldPlaceholderForeground', {
      light: '#808080',
      dark: '#808080',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'editorGutter.foldingControlForeground',
      ColorCollection._defaultSame('icon.foreground')
    );

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

    this._registerColor('diffEditor.move.border', ColorCollection._defaultColor('#8b8b8b9c'));

    this._registerColor('diffEditor.moveActive.border', ColorCollection._defaultColor('#FFA500'));

    this._registerColor('diffEditor.unchangedRegionShadow', {
      dark: '#000000',
      light: '#737373BF',
      hcDark: '#000000',
      hcLight: '#737373BF',
    });

    this._registerColor('multiDiffEditor.headerBackground', {
      dark: '#262626',
      light: ColorCollection._same('tab.inactiveBackground'),
      hcDark: ColorCollection._same('tab.inactiveBackground'),
      hcLight: ColorCollection._same('tab.inactiveBackground'),
    });

    this._registerColor(
      'multiDiffEditor.background',
      ColorCollection._defaultSame('editor.background')
    );

    this._registerColor('multiDiffEditor.border', {
      dark: ColorCollection._same('sideBarSectionHeader.border'),
      light: '#cccccc',
      hcDark: ColorCollection._same('sideBarSectionHeader.border'),
      hcLight: '#cccccc',
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

    this._registerColor(
      'mergeEditor.change.background',
      ColorCollection._defaultColor('#9bb95533')
    );

    this._registerColor('mergeEditor.change.word.background', {
      dark: '#9ccc2c33',
      light: '#9ccc2c66',
      hcDark: '#9ccc2c33',
      hcLight: '#9ccc2c66',
    });

    this._registerColor('mergeEditor.changeBase.background', {
      dark: '#4B1818FF',
      light: '#FFCCCCFF',
      hcDark: '#4B1818FF',
      hcLight: '#FFCCCCFF',
    });

    this._registerColor('mergeEditor.changeBase.word.background', {
      dark: '#6F1313FF',
      light: '#FFA3A3FF',
      hcDark: '#6F1313FF',
      hcLight: '#FFA3A3FF',
    });

    this._registerColor('mergeEditor.conflict.unhandledUnfocused.border', {
      dark: '#ffa6007a',
      light: '#ffa600FF',
      hcDark: '#ffa6007a',
      hcLight: '#ffa6007a',
    });

    this._registerColor(
      'mergeEditor.conflict.unhandledFocused.border',
      ColorCollection._defaultColor('#ffa600')
    );

    this._registerColor(
      'mergeEditor.conflict.handledUnfocused.border',
      ColorCollection._defaultColor('#86868649')
    );

    this._registerColor(
      'mergeEditor.conflict.handledFocused.border',
      ColorCollection._defaultColor('#c1c1c1cc')
    );

    this._registerColor(
      'mergeEditor.conflict.handled.minimapOverViewRuler',
      ColorCollection._defaultColor('#adaca8ee')
    );

    this._registerColor(
      'mergeEditor.conflict.unhandled.minimapOverViewRuler',
      ColorCollection._defaultColor('#fcba03FF')
    );

    this._registerColor(
      'mergeEditor.conflictingLines.background',
      ColorCollection._defaultColor('#ffea0047')
    );

    // ----- notebook editor

    this._registerColor('notebook.cellBorderColor', {
      dark: ColorCollection._transparent('list.inactiveSelectionBackground', 1),
      light: ColorCollection._transparent('list.inactiveSelectionBackground', 1),
      hcDark: ColorCollection._same('panel.border'),
      hcLight: ColorCollection._same('panel.border'),
    });

    this._registerColor(
      'notebook.focusedEditorBorder',
      ColorCollection._defaultSame('focusBorder')
    );

    this._registerColor(
      'notebookStatusSuccessIcon.foreground',
      ColorCollection._defaultSame('debugIcon.startForeground')
    );

    this._registerColor(
      'notebookEditorOverviewRuler.runningCellForeground',
      ColorCollection._defaultSame('debugIcon.startForeground')
    );

    this._registerColor(
      'notebookStatusErrorIcon.foreground',
      ColorCollection._defaultSame('errorForeground')
    );

    this._registerColor(
      'notebookStatusRunningIcon.foreground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor('notebook.outputContainerBorderColor', null);

    this._registerColor('notebook.outputContainerBackgroundColor', null);

    // TODO@rebornix currently also used for toolbar border, if we keep all of this, pick a generic name
    this._registerColor('notebook.cellToolbarSeparator', {
      dark: Color.fromHex('#808080').transparent(0.35),
      light: Color.fromHex('#808080').transparent(0.35),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('notebook.focusedCellBackground', null);

    this._registerColor('notebook.selectedCellBackground', {
      dark: ColorCollection._same('list.inactiveSelectionBackground'),
      light: ColorCollection._same('list.inactiveSelectionBackground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('notebook.cellHoverBackground', {
      dark: ColorCollection._transparent('notebook.focusedCellBackground', 0.5),
      light: ColorCollection._transparent('notebook.focusedCellBackground', 0.7),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('notebook.selectedCellBorder', {
      dark: ColorCollection._same('notebook.cellBorderColor'),
      light: ColorCollection._same('notebook.cellBorderColor'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('notebook.inactiveSelectedCellBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('focusBorder'),
      hcLight: ColorCollection._same('focusBorder'),
    });

    this._registerColor('notebook.focusedCellBorder', ColorCollection._defaultSame('focusBorder'));

    this._registerColor(
      'notebook.inactiveFocusedCellBorder',
      ColorCollection._defaultSame('notebook.cellBorderColor')
    );

    this._registerColor('notebook.cellStatusBarItemHoverBackground', {
      light: new Color(new RGBA(0, 0, 0, 0.08)),
      dark: new Color(new RGBA(255, 255, 255, 0.15)),
      hcDark: new Color(new RGBA(255, 255, 255, 0.15)),
      hcLight: new Color(new RGBA(0, 0, 0, 0.08)),
    });

    this._registerColor(
      'notebook.cellInsertionIndicator',
      ColorCollection._defaultSame('focusBorder')
    );

    this._registerColor(
      'notebookScrollbarSlider.background',
      ColorCollection._defaultSame('scrollbarSlider.background')
    );

    this._registerColor(
      'notebookScrollbarSlider.hoverBackground',
      ColorCollection._defaultSame('scrollbarSlider.hoverBackground')
    );

    this._registerColor(
      'notebookScrollbarSlider.activeBackground',
      ColorCollection._defaultSame('scrollbarSlider.activeBackground')
    );

    this._registerColor('notebook.symbolHighlightBackground', {
      dark: Color.fromHex('#ffffff0b'),
      light: Color.fromHex('#fdff0033'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('notebook.cellEditorBackground', {
      light: ColorCollection._same('sideBar.background'),
      dark: ColorCollection._same('sideBar.background'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('notebook.editorBackground', {
      light: ColorCollection._same('editorPane.background'),
      dark: ColorCollection._same('editorPane.background'),
      hcDark: null,
      hcLight: null,
    });

    // ----- keybinding
    this._registerColor(
      'keybindingTable.headerBackground',
      ColorCollection._defaultSame('tree.tableOddRowsBackground')
    );
    this._registerColor(
      'keybindingTable.rowsBackground',
      ColorCollection._defaultSame('tree.tableOddRowsBackground')
    );

    // ----- setting

    this._registerColor('settings.headerForeground', {
      light: '#444444',
      dark: '#e7e7e7',
      hcDark: '#ffffff',
      hcLight: '#292929',
    });
    this._registerColor(
      'settings.settingsHeaderHoverForeground',
      ColorCollection._defaultTransparent('settings.headerForeground', 0.7)
    );
    this._registerColor('settings.modifiedItemIndicator', {
      light: new Color(new RGBA(102, 175, 224)),
      dark: new Color(new RGBA(12, 125, 157)),
      hcDark: new Color(new RGBA(0, 73, 122)),
      hcLight: new Color(new RGBA(102, 175, 224)),
    });
    this._registerColor('settings.headerBorder', ColorCollection._defaultSame('panel.border'));
    this._registerColor('settings.sashBorder', ColorCollection._defaultSame('panel.border'));

    // Enum control colors
    this._registerColor(
      `settings.dropdownBackground`,
      ColorCollection._defaultSame('dropdown.background')
    );
    this._registerColor(
      'settings.dropdownForeground',
      ColorCollection._defaultSame('dropdown.foreground')
    );
    this._registerColor('settings.dropdownBorder', ColorCollection._defaultSame('dropdown.border'));
    this._registerColor(
      'settings.dropdownListBorder',
      ColorCollection._defaultSame('editorWidget.border')
    );

    // Bool control colors
    this._registerColor(
      'settings.checkboxBackground',
      ColorCollection._defaultSame('checkbox.background')
    );
    this._registerColor(
      'settings.checkboxForeground',
      ColorCollection._defaultSame('checkbox.foreground')
    );
    this._registerColor('settings.checkboxBorder', ColorCollection._defaultSame('checkbox.border'));

    // Text control colors
    this._registerColor(
      'settings.textInputBackground',
      ColorCollection._defaultSame('input.background')
    );
    this._registerColor(
      'settings.textInputForeground',
      ColorCollection._defaultSame('input.foreground')
    );
    this._registerColor('settings.textInputBorder', ColorCollection._defaultSame('input.border'));

    // Number control colors
    this._registerColor(
      'settings.numberInputBackground',
      ColorCollection._defaultSame('input.background')
    );
    this._registerColor(
      'settings.numberInputForeground',
      ColorCollection._defaultSame('input.foreground')
    );
    this._registerColor('settings.numberInputBorder', ColorCollection._defaultSame('input.border'));

    this._registerColor('settings.focusedRowBackground', {
      dark: ColorCollection._transparent('list.hoverBackground', 0.6),
      light: ColorCollection._transparent('list.hoverBackground', 0.6),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('settings.rowHoverBackground', {
      dark: ColorCollection._transparent('list.hoverBackground', 0.3),
      light: ColorCollection._transparent('list.hoverBackground', 0.3),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('settings.focusedRowBorder', ColorCollection._defaultSame('focusBorder'));
    this._registerColor(
      'ports.iconRunningProcessForeground',
      ColorCollection._defaultSame('statusBarItem.remoteBackground')
    );

    this._registerColor('editorGutter.modifiedBackground', {
      dark: '#1B81A8',
      light: '#2090D3',
      hcDark: '#1B81A8',
      hcLight: '#2090D3',
    });

    this._registerColor('editorGutter.addedBackground', {
      dark: '#487E02',
      light: '#48985D',
      hcDark: '#487E02',
      hcLight: '#48985D',
    });

    this._registerColor(
      'editorGutter.deletedBackground',
      ColorCollection._defaultSame('editorError.foreground')
    );

    this._registerColor(
      'minimapGutter.modifiedBackground',
      ColorCollection._defaultSame('editorGutter.modifiedBackground')
    );

    this._registerColor(
      'minimapGutter.addedBackground',
      ColorCollection._defaultSame('editorGutter.addedBackground')
    );

    this._registerColor(
      'minimapGutter.deletedBackground',
      ColorCollection._defaultSame('editorGutter.deletedBackground')
    );

    this._registerColor(
      'editorOverviewRuler.modifiedForeground',
      ColorCollection._defaultTransparent('editorGutter.modifiedBackground', 0.6)
    );
    this._registerColor(
      'editorOverviewRuler.addedForeground',
      ColorCollection._defaultTransparent('editorGutter.addedBackground', 0.6)
    );
    this._registerColor(
      'editorOverviewRuler.deletedForeground',
      ColorCollection._defaultTransparent('editorGutter.deletedBackground', 0.6)
    );
    this._registerColor(
      'scm.historyItemAdditionsForeground',
      ColorCollection._defaultSame('gitDecoration.addedResourceForeground')
    );
    this._registerColor(
      'scm.historyItemDeletionsForeground',
      ColorCollection._defaultSame('gitDecoration.deletedResourceForeground')
    );
    this._registerColor(
      'scm.historyItemStatisticsBorder',
      ColorCollection._defaultTransparent('foreground', 0.2)
    );
    this._registerColor(
      'scm.historyItemSelectedStatisticsBorder',
      ColorCollection._defaultTransparent('list.activeSelectionForeground', 0.2)
    );

    this._registerColor(
      'searchEditor.textInputBorder',
      ColorCollection._defaultSame('input.border')
    );

    this._registerColor('terminal.background', null);
    this._registerColor('terminal.foreground', {
      light: '#333333',
      dark: '#CCCCCC',
      hcDark: '#FFFFFF',
      hcLight: '#292929',
    });
    this._registerColor('terminalCursor.foreground', null);
    this._registerColor('terminalCursor.background', null);
    this._registerColor(
      'terminal.selectionBackground',
      ColorCollection._defaultSame('editor.selectionBackground')
    );
    this._registerColor('terminal.inactiveSelectionBackground', {
      light: ColorCollection._transparent('terminal.selectionBackground', 0.5),
      dark: ColorCollection._transparent('terminal.selectionBackground', 0.5),
      hcDark: ColorCollection._transparent('terminal.selectionBackground', 0.7),
      hcLight: ColorCollection._transparent('terminal.selectionBackground', 0.5),
    });
    this._registerColor('terminal.selectionForeground', {
      light: null,
      dark: null,
      hcDark: '#000000',
      hcLight: '#ffffff',
    });
    this._registerColor('terminalCommandDecoration.defaultBackground', {
      light: '#00000040',
      dark: '#ffffff40',
      hcDark: '#ffffff80',
      hcLight: '#00000040',
    });
    this._registerColor('terminalCommandDecoration.successBackground', {
      dark: '#1B81A8',
      light: '#2090D3',
      hcDark: '#1B81A8',
      hcLight: '#007100',
    });
    this._registerColor('terminalCommandDecoration.errorBackground', {
      dark: '#F14C4C',
      light: '#E51400',
      hcDark: '#F14C4C',
      hcLight: '#B5200D',
    });
    this._registerColor(
      'terminalOverviewRuler.cursorForeground',
      ColorCollection._defaultColor('#A0A0A0CC')
    );
    this._registerColor('terminal.border', ColorCollection._defaultSame('panel.border'));
    this._registerColor('terminal.findMatchBackground', {
      dark: ColorCollection._same('editor.findMatchBackground'),
      light: ColorCollection._same('editor.findMatchBackground'),
      // Use regular selection background in high contrast with a thick border
      hcDark: null,
      hcLight: '#0F4A85',
    });
    this._registerColor(
      'terminal.hoverHighlightBackground',
      ColorCollection._defaultTransparent('editor.hoverHighlightBackground', 0.5)
    );
    this._registerColor('terminal.findMatchBorder', {
      dark: null,
      light: null,
      hcDark: '#f38518',
      hcLight: '#0F4A85',
    });
    this._registerColor('terminal.findMatchHighlightBackground', {
      dark: ColorCollection._same('editor.findMatchHighlightBackground'),
      light: ColorCollection._same('editor.findMatchHighlightBackground'),
      hcDark: null,
      hcLight: null,
    });
    this._registerColor('terminal.findMatchHighlightBorder', {
      dark: null,
      light: null,
      hcDark: '#f38518',
      hcLight: '#0F4A85',
    });
    this._registerColor('terminalOverviewRuler.findMatchForeground', {
      dark: ColorCollection._same('editorOverviewRuler.findMatchForeground'),
      light: ColorCollection._same('editorOverviewRuler.findMatchForeground'),
      hcDark: '#f38518',
      hcLight: '#0F4A85',
    });
    this._registerColor(
      'terminal.dropBackground',
      ColorCollection._defaultSame('editorGroup.dropBackground')
    );
    this._registerColor(
      'terminal.tab.activeBorder',
      ColorCollection._defaultSame('tab.activeBorder')
    );
    this._registerColor('terminal.initialHintForeground', {
      dark: '#ffffff56',
      light: '#0007',
      hcDark: null,
      hcLight: null,
    });
    this._registerColor('terminal.ansiBlack', {
      light: '#000000',
      dark: '#000000',
      hcDark: '#000000',
      hcLight: '#292929',
    });
    this._registerColor('terminal.ansiRed', {
      light: '#cd3131',
      dark: '#cd3131',
      hcDark: '#cd0000',
      hcLight: '#cd3131',
    });
    this._registerColor('terminal.ansiGreen', {
      light: '#107C10',
      dark: '#0DBC79',
      hcDark: '#00cd00',
      hcLight: '#136C13',
    });
    this._registerColor('terminal.ansiYellow', {
      light: '#949800',
      dark: '#e5e510',
      hcDark: '#cdcd00',
      hcLight: '#949800',
    });
    this._registerColor('terminal.ansiBlue', {
      light: '#0451a5',
      dark: '#2472c8',
      hcDark: '#0000ee',
      hcLight: '#0451a5',
    });
    this._registerColor('terminal.ansiMagenta', {
      light: '#bc05bc',
      dark: '#bc3fbc',
      hcDark: '#cd00cd',
      hcLight: '#bc05bc',
    });
    this._registerColor('terminal.ansiCyan', {
      light: '#0598bc',
      dark: '#11a8cd',
      hcDark: '#00cdcd',
      hcLight: '#0598bc',
    });
    this._registerColor('terminal.ansiWhite', {
      light: '#555555',
      dark: '#e5e5e5',
      hcDark: '#e5e5e5',
      hcLight: '#555555',
    });
    this._registerColor('terminal.ansiBrightBlack', {
      light: '#666666',
      dark: '#666666',
      hcDark: '#7f7f7f',
      hcLight: '#666666',
    });
    this._registerColor('terminal.ansiBrightRed', {
      light: '#cd3131',
      dark: '#f14c4c',
      hcDark: '#ff0000',
      hcLight: '#cd3131',
    });
    this._registerColor('terminal.ansiBrightGreen', {
      light: '#14CE14',
      dark: '#23d18b',
      hcDark: '#00ff00',
      hcLight: '#00bc00',
    });
    this._registerColor('terminal.ansiBrightYellow', {
      light: '#b5ba00',
      dark: '#f5f543',
      hcDark: '#ffff00',
      hcLight: '#b5ba00',
    });
    this._registerColor('terminal.ansiBrightBlue', {
      light: '#0451a5',
      dark: '#3b8eea',
      hcDark: '#5c5cff',
      hcLight: '#0451a5',
    });
    this._registerColor('terminal.ansiBrightMagenta', {
      light: '#bc05bc',
      dark: '#d670d6',
      hcDark: '#ff00ff',
      hcLight: '#bc05bc',
    });
    this._registerColor('terminal.ansiBrightCyan', {
      light: '#0598bc',
      dark: '#29b8db',
      hcDark: '#00ffff',
      hcLight: '#0598bc',
    });
    this._registerColor('terminal.ansiBrightWhite', {
      light: '#a5a5a5',
      dark: '#e5e5e5',
      hcDark: '#ffffff',
      hcLight: '#a5a5a5',
    });

    this._registerColor('terminalStickyScroll.background', null);

    this._registerColor('terminalStickyScrollHover.background', {
      dark: '#2A2D2E',
      light: '#F0F0F0',
      hcDark: '#E48B39',
      hcLight: '#0f4a85',
    });
    this._registerColor('terminalStickyScroll.border', {
      dark: null,
      light: null,
      hcDark: '#6fc3df',
      hcLight: '#0f4a85',
    });

    this._registerColor(
      'mergeEditor.conflict.input1.background',
      ColorCollection._defaultTransparent('merge.currentHeaderBackground', contentTransparency)
    );

    this._registerColor(
      'mergeEditor.conflict.input2.background',
      ColorCollection._defaultTransparent('merge.incomingHeaderBackground', contentTransparency)
    );

    this._registerColor('testing.iconFailed', {
      dark: '#f14c4c',
      light: '#f14c4c',
      hcDark: '#f14c4c',
      hcLight: '#B5200D',
    });

    this._registerColor('testing.iconErrored', {
      dark: '#f14c4c',
      light: '#f14c4c',
      hcDark: '#f14c4c',
      hcLight: '#B5200D',
    });

    this._registerColor('testing.iconPassed', {
      dark: '#73c991',
      light: '#73c991',
      hcDark: '#73c991',
      hcLight: '#007100',
    });

    this._registerColor('testing.runAction', ColorCollection._defaultSame('testing.iconPassed'));

    this._registerColor('testing.iconQueued', ColorCollection._defaultColor('#cca700'));

    this._registerColor('testing.iconUnset', ColorCollection._defaultColor('#848484'));

    this._registerColor('testing.iconSkipped', ColorCollection._defaultColor('#848484'));

    this._registerColor('testing.peekBorder', {
      dark: ColorCollection._same('editorError.foreground'),
      light: ColorCollection._same('editorError.foreground'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('testing.messagePeekBorder', {
      dark: ColorCollection._same('editorInfo.foreground'),
      light: ColorCollection._same('editorInfo.foreground'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('testing.peekHeaderBackground', {
      dark: ColorCollection._transparent('editorError.foreground', 0.1),
      light: ColorCollection._transparent('editorError.foreground', 0.1),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('testing.messagePeekHeaderBackground', {
      dark: ColorCollection._transparent('editorInfo.foreground', 0.1),
      light: ColorCollection._transparent('editorInfo.foreground', 0.1),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('testing.coveredBackground', {
      dark: ColorCollection._same('diffEditor.insertedTextBackground'),
      light: ColorCollection._same('diffEditor.insertedTextBackground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('testing.coveredBorder', {
      dark: ColorCollection._transparent('testing.coveredBackground', 0.75),
      light: ColorCollection._transparent('testing.coveredBackground', 0.75),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('testing.coveredGutterBackground', {
      dark: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.6),
      light: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.6),
      hcDark: ColorCollection._same('charts.green'),
      hcLight: ColorCollection._same('charts.green'),
    });

    this._registerColor('testing.uncoveredBranchBackground', {
      dark: ColorCollection._opaque(
        ColorCollection._transparent('diffEditor.removedTextBackground', 2),
        ColorCollection._same('editor.background')
      ),
      light: ColorCollection._opaque(
        ColorCollection._transparent('diffEditor.removedTextBackground', 2),
        ColorCollection._same('editor.background')
      ),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('testing.uncoveredBackground', {
      dark: ColorCollection._same('diffEditor.removedTextBackground'),
      light: ColorCollection._same('diffEditor.removedTextBackground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('testing.uncoveredBorder', {
      dark: ColorCollection._transparent('testing.uncoveredBackground', 0.75),
      light: ColorCollection._transparent('testing.uncoveredBackground', 0.75),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('testing.uncoveredGutterBackground', {
      dark: ColorCollection._transparent('diffEditor.removedTextBackground', 1.5),
      light: ColorCollection._transparent('diffEditor.removedTextBackground', 1.5),
      hcDark: ColorCollection._same('charts.red'),
      hcLight: ColorCollection._same('charts.red'),
    });

    this._registerColor(
      'testing.coverCountBadgeBackground',
      ColorCollection._defaultSame('badge.background')
    );

    this._registerColor(
      'testing.coverCountBadgeForeground',
      ColorCollection._defaultSame('badge.foreground')
    );

    this._registerColor('testing.message.error.decorationForeground', {
      dark: ColorCollection._same('editorError.foreground'),
      light: ColorCollection._same('editorError.foreground'),
      hcDark: ColorCollection._same('editor.foreground'),
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('testing.message.error.lineBackground', {
      dark: new Color(new RGBA(255, 0, 0, 0.2)),
      light: new Color(new RGBA(255, 0, 0, 0.2)),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'testing.message.info.decorationForeground',
      ColorCollection._defaultTransparent('editor.foreground', 0.5)
    );

    this._registerColor('testing.message.info.lineBackground', null);

    this._registerColor(
      'testing.iconErrored.retired',
      ColorCollection._defaultTransparent('testing.iconErrored', 0.7)
    );

    this._registerColor(
      'testing.iconFailed.retired',
      ColorCollection._defaultTransparent('testing.iconFailed', 0.7)
    );
    this._registerColor(
      'testing.iconPassed.retired',
      ColorCollection._defaultTransparent('testing.iconPassed', 0.7)
    );

    this._registerColor(
      'testing.iconQueued.retired',
      ColorCollection._defaultTransparent('testing.iconQueued', 0.7)
    );
    this._registerColor(
      'testing.iconUnset.retired',
      ColorCollection._defaultTransparent('testing.iconUnset', 0.7)
    );

    this._registerColor(
      'testing.iconSkipped.retired',
      ColorCollection._defaultTransparent('testing.iconSkipped', 0.7)
    );

    this._registerColor('profiles.sashBorder', ColorCollection._defaultSame('panel.border'));

    this._registerColor('welcomePage.background', null);

    this._registerColor('welcomePage.tileBackground', {
      dark: ColorCollection._same('editorWidget.background'),
      light: ColorCollection._same('editorWidget.background'),
      hcDark: '#000',
      hcLight: ColorCollection._same('editorWidget.background'),
    });

    this._registerColor('welcomePage.tileHoverBackground', {
      dark: ColorCollection._lighten('editorWidget.background', 0.2),
      light: ColorCollection._darken('editorWidget.background', 0.1),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('welcomePage.tileBorder', {
      dark: '#ffffff1a',
      light: '#0000001a',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor(
      'welcomePage.progress.background',
      ColorCollection._defaultSame('input.background')
    );
    this._registerColor(
      'welcomePage.progress.foreground',
      ColorCollection._defaultSame('textLink.foreground')
    );

    this._registerColor('walkthrough.stepTitle.foreground', {
      light: '#000000',
      dark: '#ffffff',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('walkThrough.embeddedEditorBackground', {
      dark: new Color(new RGBA(0, 0, 0, 0.4)),
      light: '#f4f4f4',
      hcDark: null,
      hcLight: null,
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

    this._registerColor('editorMarkerNavigationError.background', {
      dark: ColorCollection._oneOf('editorError.foreground', 'editorError.border'),
      light: ColorCollection._oneOf('editorError.foreground', 'editorError.border'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });
    this._registerColor('editorMarkerNavigationError.headerBackground', {
      dark: ColorCollection._transparent('editorMarkerNavigationError.background', 0.1),
      light: ColorCollection._transparent('editorMarkerNavigationError.background', 0.1),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editorMarkerNavigationWarning.background', {
      dark: ColorCollection._oneOf('editorWarning.foreground', 'editorWarning.border'),
      light: ColorCollection._oneOf('editorWarning.foreground', 'editorWarning.border'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });
    this._registerColor('editorMarkerNavigationWarning.headerBackground', {
      dark: ColorCollection._transparent('editorMarkerNavigationWarning.background', 0.1),
      light: ColorCollection._transparent('editorMarkerNavigationWarning.background', 0.1),
      hcDark: '#0C141F',
      hcLight: ColorCollection._transparent('editorMarkerNavigationWarning.background', 0.2),
    });

    this._registerColor('editorMarkerNavigationInfo.background', {
      dark: ColorCollection._oneOf('editorInfo.foreground', 'editorInfo.border'),
      light: ColorCollection._oneOf('editorInfo.foreground', 'editorInfo.border'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });
    this._registerColor('editorMarkerNavigationInfo.headerBackground', {
      dark: ColorCollection._transparent('editorMarkerNavigationInfo.background', 0.1),
      light: ColorCollection._transparent('editorMarkerNavigationInfo.background', 0.1),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'editorMarkerNavigation.background',
      ColorCollection._defaultSame('editor.background')
    );

    this._registerColor('editor.linkedEditingBackground', {
      dark: Color.fromHex('#f00').transparent(0.3),
      light: Color.fromHex('#f00').transparent(0.3),
      hcDark: Color.fromHex('#f00').transparent(0.3),
      hcLight: Color.white,
    });

    this._registerColor(
      'editorHoverWidget.highlightForeground',
      ColorCollection._defaultSame('list.highlightForeground')
    );

    this._registerColor('editor.placeholder.foreground', {
      dark: ColorCollection._same('editorGhostText.foreground'),
      light: ColorCollection._same('editorGhostText.foreground'),
      hcDark: ColorCollection._same('editorGhostText.foreground'),
      hcLight: ColorCollection._same('editorGhostText.foreground'),
    });

    this._registerColor('editorWatermark.foreground', {
      dark: ColorCollection._transparent('editor.foreground', 0.6),
      light: ColorCollection._transparent('editor.foreground', 0.68),
      hcDark: ColorCollection._same('editor.foreground'),
      hcLight: ColorCollection._same('editor.foreground'),
    });

    // ----- workbench

    this._registerColor('tab.activeBackground', ColorCollection._defaultSame('editor.background'));

    this._registerColor(
      'tab.unfocusedActiveBackground',
      ColorCollection._defaultSame('tab.activeBackground')
    );

    this._registerColor('tab.inactiveBackground', {
      dark: '#2D2D2D',
      light: '#ECECEC',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'tab.unfocusedInactiveBackground',
      ColorCollection._defaultSame('tab.inactiveBackground')
    );

    //#endregion

    //#region Tab Foreground

    this._registerColor('tab.activeForeground', {
      dark: Color.white,
      light: '#333333',
      hcDark: Color.white,
      hcLight: '#292929',
    });

    this._registerColor('tab.inactiveForeground', {
      dark: ColorCollection._transparent('tab.activeForeground', 0.5),
      light: ColorCollection._transparent('tab.activeForeground', 0.7),
      hcDark: Color.white,
      hcLight: '#292929',
    });

    this._registerColor('tab.unfocusedActiveForeground', {
      dark: ColorCollection._transparent('tab.activeForeground', 0.5),
      light: ColorCollection._transparent('tab.activeForeground', 0.7),
      hcDark: Color.white,
      hcLight: '#292929',
    });

    this._registerColor('tab.unfocusedInactiveForeground', {
      dark: ColorCollection._transparent('tab.inactiveForeground', 0.5),
      light: ColorCollection._transparent('tab.inactiveForeground', 0.5),
      hcDark: Color.white,
      hcLight: '#292929',
    });

    //#endregion

    //#region Tab Hover Foreground/Background

    this._registerColor('tab.hoverBackground', null);

    this._registerColor('tab.unfocusedHoverBackground', {
      dark: ColorCollection._transparent('tab.hoverBackground', 0.5),
      light: ColorCollection._transparent('tab.hoverBackground', 0.7),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('tab.hoverForeground', null);

    this._registerColor('tab.unfocusedHoverForeground', {
      dark: ColorCollection._transparent('tab.hoverBackground', 0.5),
      light: ColorCollection._transparent('tab.hoverBackground', 0.5),
      hcDark: null,
      hcLight: null,
    });

    //#endregion

    //#region Tab Borders

    this._registerColor('tab.border', {
      dark: '#252526',
      light: '#F3F3F3',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('tab.lastPinnedBorder', {
      dark: ColorCollection._same('tree.indentGuidesStroke'),
      light: ColorCollection._same('tree.indentGuidesStroke'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('tab.activeBorder', null);

    this._registerColor('tab.unfocusedActiveBorder', {
      dark: ColorCollection._transparent('tab.activeBorder', 0.5),
      light: ColorCollection._transparent('tab.activeBorder', 0.7),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('tab.activeBorderTop', {
      dark: null,
      light: null,
      hcDark: null,
      hcLight: '#B5200D',
    });

    this._registerColor('tab.unfocusedActiveBorderTop', {
      dark: ColorCollection._transparent('tab.activeBorderTop', 0.5),
      light: ColorCollection._transparent('tab.activeBorderTop', 0.7),
      hcDark: null,
      hcLight: '#B5200D',
    });

    this._registerColor(
      'tab.selectedBorderTop',
      ColorCollection._defaultSame('tab.activeBorderTop')
    );

    this._registerColor(
      'tab.selectedBackground',
      ColorCollection._defaultSame('tab.activeBackground')
    );

    this._registerColor(
      'tab.selectedForeground',
      ColorCollection._defaultSame('tab.activeForeground')
    );

    this._registerColor('tab.hoverBorder', null);

    this._registerColor('tab.unfocusedHoverBorder', {
      dark: ColorCollection._transparent('tab.hoverBorder', 0.5),
      light: ColorCollection._transparent('tab.hoverBorder', 0.7),
      hcDark: null,
      hcLight: ColorCollection._same('contrastBorder'),
    });

    //#endregion

    //#region Tab Drag and Drop Border

    this._registerColor('tab.dragAndDropBorder', {
      dark: ColorCollection._same('tab.activeForeground'),
      light: ColorCollection._same('tab.activeForeground'),
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    //#endregion

    //#region Tab Modified Border

    this._registerColor('tab.activeModifiedBorder', {
      dark: '#3399CC',
      light: '#33AAEE',
      hcDark: null,
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('tab.inactiveModifiedBorder', {
      dark: ColorCollection._transparent('tab.activeModifiedBorder', 0.5),
      light: ColorCollection._transparent('tab.activeModifiedBorder', 0.5),
      hcDark: Color.white,
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('tab.unfocusedActiveModifiedBorder', {
      dark: ColorCollection._transparent('tab.activeModifiedBorder', 0.5),
      light: ColorCollection._transparent('tab.activeModifiedBorder', 0.7),
      hcDark: Color.white,
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('tab.unfocusedInactiveModifiedBorder', {
      dark: ColorCollection._transparent('tab.inactiveModifiedBorder', 0.5),
      light: ColorCollection._transparent('tab.inactiveModifiedBorder', 0.5),
      hcDark: Color.white,
      hcLight: ColorCollection._same('contrastBorder'),
    });

    //#endregion

    // < --- Editors --- >

    this._registerColor('editorPane.background', ColorCollection._defaultSame('editor.background'));

    this._registerColor('editorGroup.emptyBackground', null);

    this._registerColor('editorGroup.focusedEmptyBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('focusBorder'),
      hcLight: ColorCollection._same('focusBorder'),
    });

    this._registerColor('editorGroupHeader.tabsBackground', {
      dark: '#252526',
      light: '#F3F3F3',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('editorGroupHeader.tabsBorder', null);

    this._registerColor(
      'editorGroupHeader.noTabsBackground',
      ColorCollection._defaultSame('editor.background')
    );

    this._registerColor('editorGroupHeader.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('editorGroup.border', {
      dark: '#444444',
      light: '#E7E7E7',
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('editorGroup.dropBackground', {
      dark: Color.fromHex('#53595D').transparent(0.5),
      light: Color.fromHex('#2677CB').transparent(0.18),
      hcDark: null,
      hcLight: Color.fromHex('#0F4A85').transparent(0.5),
    });

    this._registerColor(
      'editorGroup.dropIntoPromptForeground',
      ColorCollection._defaultSame('editorWidget.foreground')
    );

    this._registerColor(
      'editorGroup.dropIntoPromptBackground',
      ColorCollection._defaultSame('editorWidget.background')
    );

    this._registerColor('editorGroup.dropIntoPromptBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor(
      'sideBySideEditor.horizontalBorder',
      ColorCollection._defaultSame('editorGroup.border')
    );

    this._registerColor(
      'sideBySideEditor.verticalBorder',
      ColorCollection._defaultSame('editorGroup.border')
    );

    // < --- Panels --- >

    this._registerColor('panel.background', ColorCollection._defaultSame('editor.background'));

    this._registerColor('panel.border', {
      dark: Color.fromHex('#808080').transparent(0.35),
      light: Color.fromHex('#808080').transparent(0.35),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('panelTitle.activeForeground', {
      dark: '#E7E7E7',
      light: '#424242',
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('panelTitle.inactiveForeground', {
      dark: ColorCollection._transparent('panelTitle.activeForeground', 0.6),
      light: ColorCollection._transparent('panelTitle.activeForeground', 0.75),
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('panelTitle.activeBorder', {
      dark: ColorCollection._same('panelTitle.activeForeground'),
      light: ColorCollection._same('panelTitle.activeForeground'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: '#B5200D',
    });

    this._registerColor('panelInput.border', {
      dark: ColorCollection._same('input.border'),
      light: Color.fromHex('#ddd'),
      hcDark: ColorCollection._same('input.border'),
      hcLight: ColorCollection._same('input.border'),
    });

    this._registerColor(
      'panel.dropBorder',
      ColorCollection._defaultSame('panelTitle.activeForeground')
    );

    this._registerColor(
      'panelSection.dropBackground',
      ColorCollection._defaultSame('editorGroup.dropBackground')
    );

    this._registerColor('panelSectionHeader.background', {
      dark: Color.fromHex('#808080').transparent(0.2),
      light: Color.fromHex('#808080').transparent(0.2),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('panelSectionHeader.foreground', null);

    this._registerColor(
      'panelSectionHeader.border',
      ColorCollection._defaultSame('contrastBorder')
    );

    this._registerColor('panelSection.border', ColorCollection._defaultSame('panel.border'));

    this._registerColor(
      'panelStickyScroll.background',
      ColorCollection._defaultSame('panel.background')
    );

    this._registerColor('panelStickyScroll.border', null);

    this._registerColor(
      'panelStickyScroll.shadow',
      ColorCollection._defaultSame('scrollbar.shadow')
    );

    // < --- Output Editor -->

    this._registerColor('outputView.background', null);

    this._registerColor(
      'outputViewStickyScroll.background',
      ColorCollection._defaultSame('outputView.background')
    );

    // < --- Banner --- >

    this._registerColor('banner.background', {
      dark: ColorCollection._same('list.activeSelectionBackground'),
      light: ColorCollection._darken('list.activeSelectionBackground', 0.3),
      hcDark: ColorCollection._same('list.activeSelectionBackground'),
      hcLight: ColorCollection._same('list.activeSelectionBackground'),
    });

    this._registerColor(
      'banner.foreground',
      ColorCollection._defaultSame('list.activeSelectionForeground')
    );

    this._registerColor(
      'banner.iconForeground',
      ColorCollection._defaultSame('editorInfo.foreground')
    );

    // < --- Status --- >

    this._registerColor('statusBar.foreground', {
      dark: '#FFFFFF',
      light: '#FFFFFF',
      hcDark: '#FFFFFF',
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor(
      'statusBar.noFolderForeground',
      ColorCollection._defaultSame('statusBar.foreground')
    );

    this._registerColor('statusBar.background', {
      dark: '#007ACC',
      light: '#007ACC',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('statusBar.noFolderBackground', {
      dark: '#68217A',
      light: '#68217A',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('statusBar.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('statusBar.focusBorder', {
      dark: ColorCollection._same('statusBar.foreground'),
      light: ColorCollection._same('statusBar.foreground'),
      hcDark: null,
      hcLight: ColorCollection._same('statusBar.foreground'),
    });

    this._registerColor(
      'statusBar.noFolderBorder',
      ColorCollection._defaultSame('statusBar.border')
    );

    this._registerColor('statusBarItem.activeBackground', {
      dark: Color.white.transparent(0.18),
      light: Color.white.transparent(0.18),
      hcDark: Color.white.transparent(0.18),
      hcLight: Color.black.transparent(0.18),
    });

    this._registerColor('statusBarItem.focusBorder', {
      dark: ColorCollection._same('statusBar.foreground'),
      light: ColorCollection._same('statusBar.foreground'),
      hcDark: null,
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    this._registerColor('statusBarItem.hoverBackground', {
      dark: Color.white.transparent(0.12),
      light: Color.white.transparent(0.12),
      hcDark: Color.white.transparent(0.12),
      hcLight: Color.black.transparent(0.12),
    });

    this._registerColor(
      'statusBarItem.hoverForeground',
      ColorCollection._defaultSame('statusBar.foreground')
    );

    this._registerColor('statusBarItem.compactHoverBackground', {
      dark: Color.white.transparent(0.2),
      light: Color.white.transparent(0.2),
      hcDark: Color.white.transparent(0.2),
      hcLight: Color.black.transparent(0.2),
    });

    this._registerColor(
      'statusBarItem.prominentForeground',
      ColorCollection._defaultSame('statusBar.foreground')
    );

    this._registerColor(
      'statusBarItem.prominentBackground',
      ColorCollection._defaultColor(Color.black.transparent(0.5))
    );

    this._registerColor(
      'statusBarItem.prominentHoverForeground',
      ColorCollection._defaultSame('statusBarItem.hoverForeground')
    );

    this._registerColor('statusBarItem.prominentHoverBackground', {
      dark: Color.black.transparent(0.3),
      light: Color.black.transparent(0.3),
      hcDark: Color.black.transparent(0.3),
      hcLight: null,
    });

    this._registerColor('statusBarItem.errorBackground', {
      dark: ColorCollection._darken('errorForeground', 0.4),
      light: ColorCollection._darken('errorForeground', 0.4),
      hcDark: null,
      hcLight: '#B5200D',
    });

    this._registerColor(
      'statusBarItem.errorForeground',
      ColorCollection._defaultColor(Color.white)
    );

    this._registerColor(
      'statusBarItem.errorHoverForeground',
      ColorCollection._defaultSame('statusBarItem.hoverForeground')
    );

    this._registerColor(
      'statusBarItem.errorHoverBackground',
      ColorCollection._defaultSame('statusBarItem.hoverBackground')
    );

    this._registerColor('statusBarItem.warningBackground', {
      dark: ColorCollection._darken('editorWarning.foreground', 0.4),
      light: ColorCollection._darken('editorWarning.foreground', 0.4),
      hcDark: null,
      hcLight: '#895503',
    });

    this._registerColor(
      'statusBarItem.warningForeground',
      ColorCollection._defaultColor(Color.white)
    );

    this._registerColor(
      'statusBarItem.warningHoverForeground',
      ColorCollection._defaultSame('statusBarItem.hoverForeground')
    );

    this._registerColor(
      'statusBarItem.warningHoverBackground',
      ColorCollection._defaultSame('statusBarItem.hoverBackground')
    );

    // < --- Activity Bar --- >

    this._registerColor('activityBar.background', {
      dark: '#333333',
      light: '#2C2C2C',
      hcDark: '#000000',
      hcLight: '#FFFFFF',
    });

    this._registerColor('activityBar.foreground', {
      dark: Color.white,
      light: Color.white,
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('activityBar.inactiveForeground', {
      dark: ColorCollection._transparent('activityBar.foreground', 0.4),
      light: ColorCollection._transparent('activityBar.foreground', 0.4),
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('activityBar.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('activityBar.activeBorder', {
      dark: ColorCollection._same('activityBar.foreground'),
      light: ColorCollection._same('activityBar.foreground'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('activityBar.activeFocusBorder', {
      dark: null,
      light: null,
      hcDark: null,
      hcLight: '#B5200D',
    });

    this._registerColor('activityBar.activeBackground', null);

    this._registerColor('activityBar.dropBorder', {
      dark: ColorCollection._same('activityBar.foreground'),
      light: ColorCollection._same('activityBar.foreground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('activityBarBadge.background', {
      dark: '#007ACC',
      light: '#007ACC',
      hcDark: '#000000',
      hcLight: '#0F4A85',
    });

    this._registerColor('activityBarBadge.foreground', ColorCollection._defaultColor(Color.white));

    this._registerColor('activityBarTop.foreground', {
      dark: '#E7E7E7',
      light: '#424242',
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('activityBarTop.activeBorder', {
      dark: ColorCollection._same('activityBarTop.foreground'),
      light: ColorCollection._same('activityBarTop.foreground'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: '#B5200D',
    });

    this._registerColor('activityBarTop.activeBackground', null);

    this._registerColor('activityBarTop.inactiveForeground', {
      dark: ColorCollection._transparent('activityBarTop.foreground', 0.6),
      light: ColorCollection._transparent('activityBarTop.foreground', 0.75),
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor(
      'activityBarTop.dropBorder',
      ColorCollection._defaultSame('activityBarTop.foreground')
    );

    this._registerColor('activityBarTop.background', null);

    // < --- Profiles --- >

    this._registerColor('profileBadge.background', {
      dark: '#4D4D4D',
      light: '#C4C4C4',
      hcDark: Color.white,
      hcLight: Color.black,
    });

    this._registerColor('profileBadge.foreground', {
      dark: Color.white,
      light: '#333333',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    // < --- Remote --- >

    this._registerColor(
      'statusBarItem.remoteBackground',
      ColorCollection._defaultSame('activityBarBadge.background')
    );

    this._registerColor(
      'statusBarItem.remoteForeground',
      ColorCollection._defaultSame('activityBarBadge.foreground')
    );

    this._registerColor(
      'statusBarItem.remoteHoverForeground',
      ColorCollection._defaultSame('statusBarItem.hoverBackground')
    );

    this._registerColor('statusBarItem.remoteHoverBackground', {
      dark: ColorCollection._same('statusBarItem.hoverBackground'),
      light: ColorCollection._same('statusBarItem.hoverBackground'),
      hcDark: ColorCollection._same('statusBarItem.hoverBackground'),
      hcLight: null,
    });

    this._registerColor(
      'statusBarItem.offlineBackground',
      ColorCollection._defaultColor('#6c1717')
    );

    this._registerColor(
      'statusBarItem.offlineForeground',
      ColorCollection._defaultSame('statusBarItem.remoteForeground')
    );

    this._registerColor(
      'statusBarItem.offlineHoverForeground',
      ColorCollection._defaultSame('statusBarItem.hoverBackground')
    );

    this._registerColor('statusBarItem.offlineHoverBackground', {
      dark: ColorCollection._same('statusBarItem.hoverBackground'),
      light: ColorCollection._same('statusBarItem.hoverBackground'),
      hcDark: ColorCollection._same('statusBarItem.hoverBackground'),
      hcLight: null,
    });

    this._registerColor(
      'extensionBadge.remoteBackground',
      ColorCollection._defaultSame('activityBarBadge.background')
    );

    this._registerColor(
      'extensionBadge.remoteForeground',
      ColorCollection._defaultSame('activityBarBadge.foreground')
    );

    // < --- Side Bar --- >

    this._registerColor('sideBar.background', {
      dark: '#252526',
      light: '#F3F3F3',
      hcDark: '#000000',
      hcLight: '#FFFFFF',
    });

    this._registerColor('sideBar.foreground', null);

    this._registerColor('sideBar.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor(
      'sideBarTitle.background',
      ColorCollection._defaultSame('sideBar.background')
    );

    this._registerColor(
      'sideBarTitle.foreground',
      ColorCollection._defaultSame('sideBar.foreground')
    );

    this._registerColor(
      'sideBar.dropBackground',
      ColorCollection._defaultSame('editorGroup.dropBackground')
    );

    this._registerColor('sideBarSectionHeader.background', {
      dark: Color.fromHex('#808080').transparent(0.2),
      light: Color.fromHex('#808080').transparent(0.2),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'sideBarSectionHeader.foreground',
      ColorCollection._defaultSame('sideBar.foreground')
    );

    this._registerColor(
      'sideBarSectionHeader.border',
      ColorCollection._defaultSame('contrastBorder')
    );

    this._registerColor(
      'sideBarActivityBarTop.border',
      ColorCollection._defaultSame('sideBarSectionHeader.border')
    );

    this._registerColor(
      'sideBarStickyScroll.background',
      ColorCollection._defaultSame('sideBar.background')
    );

    this._registerColor('sideBarStickyScroll.border', null);

    this._registerColor(
      'sideBarStickyScroll.shadow',
      ColorCollection._defaultSame('scrollbar.shadow')
    );

    // < --- Title Bar --- >

    this._registerColor('titleBar.activeForeground', {
      dark: '#CCCCCC',
      light: '#333333',
      hcDark: '#FFFFFF',
      hcLight: '#292929',
    });

    this._registerColor('titleBar.inactiveForeground', {
      dark: ColorCollection._transparent('titleBar.activeForeground', 0.6),
      light: ColorCollection._transparent('titleBar.activeForeground', 0.6),
      hcDark: null,
      hcLight: '#292929',
    });

    this._registerColor('titleBar.activeBackground', {
      dark: '#3C3C3C',
      light: '#DDDDDD',
      hcDark: '#000000',
      hcLight: '#FFFFFF',
    });

    this._registerColor('titleBar.inactiveBackground', {
      dark: ColorCollection._transparent('titleBar.activeBackground', 0.6),
      light: ColorCollection._transparent('titleBar.activeBackground', 0.6),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('titleBar.border', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    // < --- Menubar --- >

    this._registerColor(
      'menubar.selectionForeground',
      ColorCollection._defaultSame('titleBar.activeForeground')
    );

    this._registerColor('menubar.selectionBackground', {
      dark: ColorCollection._same('toolbar.hoverBackground'),
      light: ColorCollection._same('toolbar.hoverBackground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('menubar.selectionBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    // < --- Command Center --- >

    // foreground (inactive and active)
    this._registerColor(
      'commandCenter.foreground',
      ColorCollection._defaultSame('titleBar.activeForeground')
    );

    this._registerColor(
      'commandCenter.activeForeground',
      ColorCollection._defaultSame('menu.selectionForeground')
    );

    this._registerColor(
      'commandCenter.inactiveForeground',
      ColorCollection._defaultSame('titleBar.inactiveForeground')
    );

    // background (inactive and active)
    this._registerColor('commandCenter.background', {
      dark: Color.white.transparent(0.05),
      hcDark: null,
      light: Color.black.transparent(0.05),
      hcLight: null,
    });

    this._registerColor('commandCenter.activeBackground', {
      dark: Color.white.transparent(0.08),
      hcDark: ColorCollection._same('menu.selectionBackground'),
      light: Color.black.transparent(0.08),
      hcLight: ColorCollection._same('menu.selectionBackground'),
    });

    // border: active and inactive. defaults to active background
    this._registerColor('commandCenter.border', {
      dark: ColorCollection._transparent('titleBar.activeForeground', 0.2),
      hcDark: ColorCollection._same('contrastBorder'),
      light: ColorCollection._transparent('titleBar.activeForeground', 0.2),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('commandCenter.activeBorder', {
      dark: ColorCollection._transparent('titleBar.activeForeground', 0.3),
      hcDark: 'titleBar.activeForeground',
      light: ColorCollection._transparent('titleBar.activeForeground', 0.3),
      hcLight: 'titleBar.activeForeground',
    });

    // border: defaults to active background
    this._registerColor(
      'commandCenter.inactiveBorder',
      ColorCollection._defaultTransparent('titleBar.inactiveForeground', 0.25)
    );

    // < --- Notifications --- >

    this._registerColor('notificationCenter.border', {
      dark: ColorCollection._same('widget.border'),
      light: ColorCollection._same('widget.border'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('notificationToast.border', {
      dark: ColorCollection._same('widget.border'),
      light: ColorCollection._same('widget.border'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor(
      'notifications.foreground',
      ColorCollection._defaultSame('editorWidget.foreground')
    );

    this._registerColor(
      'notifications.background',
      ColorCollection._defaultSame('editorWidget.background')
    );

    this._registerColor(
      'notificationLink.foreground',
      ColorCollection._defaultSame('textLink.foreground')
    );

    this._registerColor('notificationCenterHeader.foreground', null);

    this._registerColor('notificationCenterHeader.background', {
      dark: ColorCollection._lighten('notifications.background', 0.3),
      light: ColorCollection._darken('notifications.background', 0.05),
      hcDark: ColorCollection._same('notifications.background'),
      hcLight: ColorCollection._same('notifications.background'),
    });

    this._registerColor(
      'notifications.border',
      ColorCollection._defaultSame('notificationCenterHeader.background')
    );

    this._registerColor(
      'notificationsErrorIcon.foreground',
      ColorCollection._defaultSame('editorError.foreground')
    );

    this._registerColor(
      'notificationsWarningIcon.foreground',
      ColorCollection._defaultSame('editorWarning.foreground')
    );

    this._registerColor(
      'notificationsInfoIcon.foreground',
      ColorCollection._defaultSame('editorInfo.foreground')
    );

    this._registerColor('window.activeBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('window.inactiveBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('statusBar.debuggingBackground', {
      dark: '#CC6633',
      light: '#CC6633',
      hcDark: '#BA592C',
      hcLight: '#B5200D',
    });

    this._registerColor('statusBar.debuggingForeground', {
      dark: ColorCollection._same('statusBar.foreground'),
      light: ColorCollection._same('statusBar.foreground'),
      hcDark: ColorCollection._same('statusBar.foreground'),
      hcLight: '#FFFFFF',
    });

    this._registerColor(
      'statusBar.debuggingBorder',
      ColorCollection._defaultSame('statusBar.border')
    );

    this._registerColor(
      'commandCenter.debuggingBackground',
      ColorCollection._defaultTransparent('statusBar.debuggingBackground', 0.258)
    );

    // ----- chat

    this._registerColor('chat.requestBorder', {
      dark: new Color(new RGBA(255, 255, 255, 0.1)),
      light: new Color(new RGBA(0, 0, 0, 0.1)),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('chat.requestBackground', {
      dark: ColorCollection._transparent('editor.background', 0.62),
      light: ColorCollection._transparent('editor.background', 0.62),
      hcDark: ColorCollection._same('editorWidget.background'),
      hcLight: null,
    });

    this._registerColor('chat.slashCommandBackground', {
      dark: '#34414b8f',
      light: '#d2ecff99',
      hcDark: Color.white,
      hcLight: ColorCollection._same('badge.background'),
    });

    this._registerColor('chat.slashCommandForeground', {
      dark: '#40A6FF',
      light: '#306CA2',
      hcDark: Color.black,
      hcLight: ColorCollection._same('badge.foreground'),
    });

    this._registerColor('chat.avatarBackground', {
      dark: '#1f1f1f',
      light: '#f2f2f2',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('chat.avatarForeground', ColorCollection._defaultSame('foreground'));

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

    this._registerColor(
      'inlineChat.foreground',
      ColorCollection._defaultSame('editorWidget.foreground')
    );
    this._registerColor(
      'inlineChat.background',
      ColorCollection._defaultSame('editorWidget.background')
    );
    this._registerColor('inlineChat.border', ColorCollection._defaultSame('editorWidget.border'));
    this._registerColor('inlineChat.shadow', ColorCollection._defaultSame('widget.shadow'));
    this._registerColor(
      'inlineChatInput.border',
      ColorCollection._defaultSame('editorWidget.border')
    );
    this._registerColor('inlineChatInput.focusBorder', ColorCollection._defaultSame('focusBorder'));
    this._registerColor(
      'inlineChatInput.placeholderForeground',
      ColorCollection._defaultSame('input.placeholderForeground')
    );
    this._registerColor(
      'inlineChatInput.background',
      ColorCollection._defaultSame('input.background')
    );

    this._registerColor(
      'inlineChatDiff.inserted',
      ColorCollection._defaultTransparent('diffEditor.insertedTextBackground', 0.5)
    );
    this._registerColor('editorOverviewRuler.inlineChatInserted', {
      dark: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.6),
      light: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.8),
      hcDark: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.6),
      hcLight: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.8),
    });
    this._registerColor('editorOverviewRuler.inlineChatInserted', {
      dark: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.6),
      light: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.8),
      hcDark: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.6),
      hcLight: ColorCollection._transparent('diffEditor.insertedTextBackground', 0.8),
    });

    this._registerColor(
      'inlineChatDiff.removed',
      ColorCollection._defaultTransparent('diffEditor.removedTextBackground', 0.5)
    );
    this._registerColor('editorOverviewRuler.inlineChatRemoved', {
      dark: ColorCollection._transparent('diffEditor.removedTextBackground', 0.6),
      light: ColorCollection._transparent('diffEditor.removedTextBackground', 0.8),
      hcDark: ColorCollection._transparent('diffEditor.removedTextBackground', 0.6),
      hcLight: ColorCollection._transparent('diffEditor.removedTextBackground', 0.8),
    });

    // ----- interactive
    this._registerColor('interactive.activeCodeBorder', {
      dark: ColorCollection._ifDefinedThenElse('peekView.border', 'peekView.border', '#007acc'),
      light: ColorCollection._ifDefinedThenElse('peekView.border', 'peekView.border', '#007acc'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });
    this._registerColor('interactive.inactiveCodeBorder', {
      dark: ColorCollection._ifDefinedThenElse(
        'list.inactiveSelectionBackground',
        'list.inactiveSelectionBackground',
        '#37373D'
      ),
      light: ColorCollection._ifDefinedThenElse(
        'list.inactiveSelectionBackground',
        'list.inactiveSelectionBackground',
        '#E4E6F1'
      ),
      hcDark: ColorCollection._same('panel.border'),
      hcLight: ColorCollection._same('panel.border'),
    });

    // ----- simple widget
    this._registerColor('simpleFindWidget.sashBorder', {
      dark: '#454545',
      light: '#C8C8C8',
      hcDark: '#6FC3DF',
      hcLight: '#0F4A85',
    });

    this._registerColor('commentsView.resolvedIcon', {
      dark: ColorCollection._same('disabledForeground'),
      light: ColorCollection._same('disabledForeground'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });
    this._registerColor('commentsView.unresolvedIcon', {
      dark: ColorCollection._same('list.focusOutline'),
      light: ColorCollection._same('list.focusOutline'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });
    this._registerColor(
      'editorCommentsWidget.replyInputBackground',
      ColorCollection._defaultSame('peekViewTitle.background')
    );
    this._registerColor('editorCommentsWidget.resolvedBorder', {
      dark: ColorCollection._same('commentsView.resolvedIcon'),
      light: ColorCollection._same('commentsView.resolvedIcon'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });
    this._registerColor('editorCommentsWidget.unresolvedBorder', {
      dark: ColorCollection._same('commentsView.resolvedIcon'),
      light: ColorCollection._same('commentsView.resolvedIcon'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });
    this._registerColor(
      'editorCommentsWidget.rangeBackground',
      ColorCollection._defaultTransparent('editorCommentsWidget.unresolvedBorder', 0.1)
    );
    this._registerColor(
      'editorCommentsWidget.rangeActiveBackground',
      ColorCollection._defaultTransparent('editorCommentsWidget.unresolvedBorder', 0.1)
    );

    this._registerColor('editorGutter.commentRangeForeground', {
      dark: ColorCollection._opaque(
        'list.inactiveSelectionBackground',
        ColorCollection._same('editor.background')
      ),
      light: ColorCollection._darken(
        ColorCollection._opaque(
          'list.inactiveSelectionBackground',
          ColorCollection._same('editor.background')
        ),
        0.05
      ),
      hcDark: Color.white,
      hcLight: Color.black,
    });
    this._registerColor(
      'editorOverviewRuler.commentForeground',
      ColorCollection._defaultSame('editorGutter.commentRangeForeground')
    );
    this._registerColor(
      'editorOverviewRuler.commentUnresolvedForeground',
      ColorCollection._defaultSame('editorOverviewRuler.commentForeground')
    );

    this._registerColor('editorGutter.commentGlyphForeground', {
      dark: ColorCollection._same('editor.foreground'),
      light: ColorCollection._same('editor.foreground'),
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor(
      'editorGutter.commentUnresolvedGlyphForeground',
      ColorCollection._defaultSame('editorGutter.commentGlyphForeground')
    );

    // ----- debug
    this._registerColor('debugIcon.breakpointForeground', ColorCollection._defaultColor('#E51400'));
    this._registerColor(
      'debugIcon.breakpointDisabledForeground',
      ColorCollection._defaultColor('#848484')
    );
    this._registerColor(
      'debugIcon.breakpointUnverifiedForeground',
      ColorCollection._defaultColor('#848484')
    );
    this._registerColor('debugIcon.breakpointCurrentStackframeForeground', {
      dark: '#FFCC00',
      light: '#BE8700',
      hcDark: '#FFCC00',
      hcLight: '#BE8700',
    });
    this._registerColor(
      'debugIcon.breakpointStackframeForeground',
      ColorCollection._defaultColor('#89D185')
    );
    this._registerColor('debugTokenExpression.name', {
      dark: '#c586c0',
      light: '#9b46b0',
      hcDark: ColorCollection._same('foreground'),
      hcLight: ColorCollection._same('foreground'),
    });
    this._registerColor('debugTokenExpression.type', {
      dark: '#4A90E2',
      light: '#4A90E2',
      hcDark: ColorCollection._same('foreground'),
      hcLight: ColorCollection._same('foreground'),
    });
    this._registerColor('debugTokenExpression.value', {
      dark: '#cccccc99',
      light: '#6c6c6ccc',
      hcDark: ColorCollection._same('foreground'),
      hcLight: ColorCollection._same('foreground'),
    });
    this._registerColor('debugTokenExpression.string', {
      dark: '#ce9178',
      light: '#a31515',
      hcDark: '#f48771',
      hcLight: '#a31515',
    });
    this._registerColor('debugTokenExpression.boolean', {
      dark: '#4e94ce',
      light: '#0000ff',
      hcDark: '#75bdfe',
      hcLight: '#0000ff',
    });
    this._registerColor('debugTokenExpression.number', {
      dark: '#b5cea8',
      light: '#098658',
      hcDark: '#89d185',
      hcLight: '#098658',
    });
    this._registerColor('debugTokenExpression.error', {
      dark: '#f48771',
      light: '#e51400',
      hcDark: '#f48771',
      hcLight: '#e51400',
    });

    this._registerColor('debugView.exceptionLabelForeground', {
      dark: ColorCollection._same('foreground'),
      light: '#FFF',
      hcDark: ColorCollection._same('foreground'),
      hcLight: ColorCollection._same('foreground'),
    });
    this._registerColor('debugView.exceptionLabelBackground', {
      dark: '#6C2022',
      light: '#A31515',
      hcDark: '#6C2022',
      hcLight: '#A31515',
    });
    this._registerColor(
      'debugView.stateLabelForeground',
      ColorCollection._defaultSame('foreground')
    );
    this._registerColor(
      'debugView.stateLabelBackground',
      ColorCollection._defaultColor('#88888844')
    );
    this._registerColor(
      'debugView.valueChangedHighlight',
      ColorCollection._defaultColor('#569CD6')
    );

    this._registerColor('debugConsole.infoForeground', {
      dark: ColorCollection._same('editorInfo.foreground'),
      light: ColorCollection._same('editorInfo.foreground'),
      hcDark: ColorCollection._same('foreground'),
      hcLight: ColorCollection._same('foreground'),
    });
    this._registerColor('debugConsole.warningForeground', {
      dark: ColorCollection._same('editorWarning.foreground'),
      light: ColorCollection._same('editorWarning.foreground'),
      hcDark: '#008000',
      hcLight: ColorCollection._same('editorWarning.foreground'),
    });
    this._registerColor(
      'debugConsole.errorForeground',
      ColorCollection._defaultSame('errorForeground')
    );
    this._registerColor(
      'debugConsole.sourceForeground',
      ColorCollection._defaultSame('foreground')
    );
    this._registerColor(
      'debugConsoleInputIcon.foreground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor('debugIcon.pauseForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('debugIcon.stopForeground', {
      dark: '#F48771',
      light: '#A1260D',
      hcDark: '#F48771',
      hcLight: '#A1260D',
    });

    this._registerColor('debugIcon.disconnectForeground', {
      dark: '#F48771',
      light: '#A1260D',
      hcDark: '#F48771',
      hcLight: '#A1260D',
    });

    this._registerColor('debugIcon.restartForeground', {
      dark: '#89D185',
      light: '#388A34',
      hcDark: '#89D185',
      hcLight: '#388A34',
    });

    this._registerColor('debugIcon.stepOverForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('debugIcon.stepIntoForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('debugIcon.stepOutForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('debugIcon.continueForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('debugIcon.stepBackForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('editor.inlineValuesForeground', {
      dark: '#ffffff80',
      light: '#00000080',
      hcDark: '#ffffff80',
      hcLight: '#00000080',
    });

    this._registerColor(
      'editor.inlineValuesBackground',
      ColorCollection._defaultColor('#ffc80033')
    );

    this._registerColor('debugExceptionWidget.border', ColorCollection._defaultColor('#a31515'));
    this._registerColor('debugExceptionWidget.background', {
      dark: '#420b0d',
      light: '#f1dfde',
      hcDark: '#420b0d',
      hcLight: '#f1dfde',
    });

    this._registerColor('debugToolBar.background', {
      dark: '#333333',
      light: '#F3F3F3',
      hcDark: '#000000',
      hcLight: '#FFFFFF',
    });

    this._registerColor('debugToolBar.border', null);

    this._registerColor('debugIcon.startForeground', {
      dark: '#89D185',
      light: '#388A34',
      hcDark: '#89D185',
      hcLight: '#388A34',
    });

    // ----- call stack
    this._registerColor('editor.stackFrameHighlightBackground', {
      dark: '#ffff0033',
      light: '#ffff6673',
      hcDark: '#ffff0033',
      hcLight: '#ffff6673',
    });
    this._registerColor('editor.focusedStackFrameHighlightBackground', {
      dark: '#7abd7a4d',
      light: '#cee7ce73',
      hcDark: '#7abd7a4d',
      hcLight: '#cee7ce73',
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

    // ----- git

    this._registerColor('gitDecoration.addedResourceForeground', {
      light: '#587c0c',
      dark: '#81b88b',
      hcDark: '#a1e3ad',
      hcLight: '#374e06',
    });

    this._registerColor('gitDecoration.modifiedResourceForeground', {
      light: '#895503',
      dark: '#E2C08D',
      hcDark: '#E2C08D',
      hcLight: '#895503',
    });

    this._registerColor('gitDecoration.deletedResourceForeground', {
      light: '#ad0707',
      dark: '#c74e39',
      hcDark: '#c74e39',
      hcLight: '#ad0707',
    });

    this._registerColor('gitDecoration.renamedResourceForeground', {
      light: '#007100',
      dark: '#73C991',
      hcDark: '#73C991',
      hcLight: '#007100',
    });

    this._registerColor('gitDecoration.untrackedResourceForeground', {
      light: '#007100',
      dark: '#73C991',
      hcDark: '#73C991',
      hcLight: '#007100',
    });

    this._registerColor('gitDecoration.ignoredResourceForeground', {
      light: '#8E8E90',
      dark: '#8C8C8C',
      hcDark: '#A7A8A9',
      hcLight: '#8e8e90',
    });

    this._registerColor('gitDecoration.stageModifiedResourceForeground', {
      light: '#895503',
      dark: '#E2C08D',
      hcDark: '#E2C08D',
      hcLight: '#895503',
    });

    this._registerColor('gitDecoration.stageDeletedResourceForeground', {
      light: '#ad0707',
      dark: '#c74e39',
      hcDark: '#c74e39',
      hcLight: '#ad0707',
    });

    this._registerColor('gitDecoration.conflictingResourceForeground', {
      light: '#ad0707',
      dark: '#e4676b',
      hcDark: '#c74e39',
      hcLight: '#ad0707',
    });

    this._registerColor('gitDecoration.submoduleResourceForeground', {
      light: '#1258a7',
      dark: '#8db9e2',
      hcDark: '#8db9e2',
      hcLight: '#1258a7',
    });

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

    // ----- peek view

    this._registerColor('peekViewTitle.background', {
      dark: '#252526',
      light: '#F3F3F3',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('peekViewTitleLabel.foreground', {
      dark: Color.white,
      light: Color.black,
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('peekViewTitleDescription.foreground', {
      dark: '#ccccccb3',
      light: '#616161',
      hcDark: '#FFFFFF99',
      hcLight: '#292929',
    });

    this._registerColor('peekView.border', {
      dark: ColorCollection._same('editorInfo.foreground'),
      light: ColorCollection._same('editorInfo.foreground'),
      hcDark: ColorCollection._same('contrastBorder'),
      hcLight: ColorCollection._same('contrastBorder'),
    });

    this._registerColor('peekViewResult.background', {
      dark: '#252526',
      light: '#F3F3F3',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor('peekViewResult.lineForeground', {
      dark: '#bbbbbb',
      light: '#646465',
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('peekViewResult.fileForeground', {
      dark: Color.white,
      light: '#1E1E1E',
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('peekViewResult.selectionBackground', {
      dark: '#3399ff33',
      light: '#3399ff33',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('peekViewResult.selectionForeground', {
      dark: Color.white,
      light: '#6C6C6C',
      hcDark: Color.white,
      hcLight: ColorCollection._same('editor.foreground'),
    });

    this._registerColor('peekViewEditor.background', {
      dark: '#001F33',
      light: '#F2F8FC',
      hcDark: Color.black,
      hcLight: Color.white,
    });

    this._registerColor(
      'peekViewEditorGutter.background',
      ColorCollection._defaultSame('peekViewEditor.background')
    );

    this._registerColor(
      'peekViewEditorStickyScroll.background',
      ColorCollection._defaultSame('peekViewEditor.background')
    );

    this._registerColor('peekViewResult.matchHighlightBackground', {
      dark: '#ea5c004d',
      light: '#ea5c004d',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('peekViewEditor.matchHighlightBackground', {
      dark: '#ff8f0099',
      light: '#f5d802de',
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('peekViewEditor.matchHighlightBorder', {
      dark: null,
      light: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });

    // ----- suggest widget

    this._registerColor(
      'editorSuggestWidget.background',
      ColorCollection._defaultSame('editorWidget.background')
    );

    this._registerColor(
      'editorSuggestWidget.border',
      ColorCollection._defaultSame('editorWidget.border')
    );

    this._registerColor(
      'editorSuggestWidget.foreground',
      ColorCollection._defaultSame('editor.foreground')
    );

    this._registerColor(
      'editorSuggestWidget.selectedForeground',
      ColorCollection._defaultSame('quickInputList.focusForeground')
    );

    this._registerColor(
      'editorSuggestWidget.selectedIconForeground',
      ColorCollection._defaultSame('quickInputList.focusIconForeground')
    );

    this._registerColor(
      'editorSuggestWidget.selectedBackground',
      ColorCollection._defaultSame('quickInputList.focusBackground')
    );

    this._registerColor(
      'editorSuggestWidget.highlightForeground',
      ColorCollection._defaultSame('list.highlightForeground')
    );

    this._registerColor(
      'editorSuggestWidget.focusHighlightForeground',
      ColorCollection._defaultSame('list.focusHighlightForeground')
    );

    this._registerColor(
      'editorSuggestWidgetStatus.foreground',
      ColorCollection._defaultTransparent('editorSuggestWidget.foreground', 0.5)
    );

    // ----- symbol icons

    this._registerColor('symbolIcon.arrayForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.booleanForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.classForeground', {
      dark: '#EE9D28',
      light: '#D67E00',
      hcDark: '#EE9D28',
      hcLight: '#D67E00',
    });

    this._registerColor('symbolIcon.colorForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor(
      'symbolIcon.constantForeground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor('symbolIcon.constructorForeground', {
      dark: '#B180D7',
      light: '#652D90',
      hcDark: '#B180D7',
      hcLight: '#652D90',
    });

    this._registerColor('symbolIcon.enumeratorForeground', {
      dark: '#EE9D28',
      light: '#D67E00',
      hcDark: '#EE9D28',
      hcLight: '#D67E00',
    });

    this._registerColor('symbolIcon.enumeratorMemberForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('symbolIcon.eventForeground', {
      dark: '#EE9D28',
      light: '#D67E00',
      hcDark: '#EE9D28',
      hcLight: '#D67E00',
    });

    this._registerColor('symbolIcon.fieldForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('symbolIcon.fileForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.folderForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.functionForeground', {
      dark: '#B180D7',
      light: '#652D90',
      hcDark: '#B180D7',
      hcLight: '#652D90',
    });

    this._registerColor('symbolIcon.interfaceForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    this._registerColor('symbolIcon.keyForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.keywordForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.methodForeground', {
      dark: '#B180D7',
      light: '#652D90',
      hcDark: '#B180D7',
      hcLight: '#652D90',
    });

    this._registerColor('symbolIcon.moduleForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor(
      'symbolIcon.namespaceForeground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor('symbolIcon.nullForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.numberForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.objectForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor(
      'symbolIcon.operatorForeground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor('symbolIcon.packageForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor(
      'symbolIcon.propertyForeground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor(
      'symbolIcon.referenceForeground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor('symbolIcon.snippetForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.stringForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.structForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.textForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor(
      'symbolIcon.typeParameterForeground',
      ColorCollection._defaultSame('foreground')
    );

    this._registerColor('symbolIcon.unitForeground', ColorCollection._defaultSame('foreground'));

    this._registerColor('symbolIcon.variableForeground', {
      dark: '#75BEFF',
      light: '#007ACC',
      hcDark: '#75BEFF',
      hcLight: '#007ACC',
    });

    // highlight decoration

    this._registerColor('editor.wordHighlightBackground', {
      dark: '#575757B8',
      light: '#57575740',
      hcDark: null,
      hcLight: null,
    });
    this._registerColor('editor.wordHighlightStrongBackground', {
      dark: '#004972B8',
      light: '#0e639c40',
      hcDark: null,
      hcLight: null,
    });
    this._registerColor(
      'editor.wordHighlightTextBackground',
      ColorCollection._defaultSame('editor.wordHighlightBackground')
    );
    this._registerColor('editor.wordHighlightBorder', {
      light: null,
      dark: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });
    this._registerColor('editor.wordHighlightStrongBorder', {
      light: null,
      dark: null,
      hcDark: ColorCollection._same('contrastActiveBorder'),
      hcLight: ColorCollection._same('contrastActiveBorder'),
    });
    this._registerColor(
      'editor.wordHighlightTextBorder',
      ColorCollection._defaultSame('editor.wordHighlightBorder')
    );
    this._registerColor(
      'editorOverviewRuler.wordHighlightForeground',
      ColorCollection._defaultColor('#A0A0A0CC')
    );
    this._registerColor(
      'editorOverviewRuler.wordHighlightStrongForeground',
      ColorCollection._defaultColor('#C0A0C0CC')
    );
    this._registerColor(
      'editorOverviewRuler.wordHighlightTextForeground',
      ColorCollection._defaultSame('editorOverviewRuler.selectionHighlightForeground')
    );

    // ----- action bar

    this._registerColor(
      'actionBar.toggledBackground',
      ColorCollection._defaultSame('inputOption.activeBackground')
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

    // ----- extension

    this._registerColor('extensionButton.background', {
      dark: ColorCollection._same('button.background'),
      light: ColorCollection._same('button.background'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('extensionButton.foreground', {
      dark: ColorCollection._same('button.foreground'),
      light: ColorCollection._same('button.foreground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('extensionButton.hoverBackground', {
      dark: ColorCollection._same('button.hoverBackground'),
      light: ColorCollection._same('button.hoverBackground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor(
      'extensionButton.separator',
      ColorCollection._defaultSame('button.separator')
    );

    this._registerColor('extensionButton.prominentBackground', {
      dark: ColorCollection._same('button.background'),
      light: ColorCollection._same('button.background'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('extensionButton.prominentForeground', {
      dark: ColorCollection._same('button.foreground'),
      light: ColorCollection._same('button.foreground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('extensionButton.prominentHoverBackground', {
      dark: ColorCollection._same('button.hoverBackground'),
      light: ColorCollection._same('button.hoverBackground'),
      hcDark: null,
      hcLight: null,
    });

    this._registerColor('extensionIcon.starForeground', {
      light: '#DF6100',
      dark: '#FF8E00',
      hcDark: '#FF8E00',
      hcLight: ColorCollection._same('textLink.foreground'),
    });
    this._registerColor(
      'extensionIcon.verifiedForeground',
      ColorCollection._defaultSame('textLink.foreground')
    );
    this._registerColor('extensionIcon.preReleaseForeground', {
      dark: '#1d9271',
      light: '#1d9271',
      hcDark: '#1d9271',
      hcLight: ColorCollection._same('textLink.foreground'),
    });
    this._registerColor('extensionIcon.sponsorForeground', {
      light: '#B51E78',
      dark: '#D758B3',
      hcDark: null,
      hcLight: '#B51E78',
    });

    // ------ end
  }
}

export default ColorCollection;
