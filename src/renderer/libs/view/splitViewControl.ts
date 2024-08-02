import { motionValue, MotionValue } from 'framer-motion';

interface ISplitViewControlOptions {
  position: number;
  size: number;
  minSize: number;
  snap: boolean;
  minPosition: number;
  maxPosition: number;
  visible: boolean;
  isLastView: boolean;
  direction: 'horizontal' | 'vertical';
  resizeHandler: (event: MouseEvent) => void;
}

class SplitViewControl {
  private _position: MotionValue<number>;
  private _size: MotionValue<number>;
  private _sashCursor: MotionValue<string>;
  private _cachedSize: number;
  private _direction: 'horizontal' | 'vertical';
  private _resizeHandler: (event: MouseEvent) => void;
  private _isLastView: boolean;
  public readonly minSize: number;
  public readonly snap: boolean;
  public constructor(options: ISplitViewControlOptions) {
    this._position = motionValue(options.position);
    this._size = motionValue(options.visible ? options.size : 0);
    this._cachedSize = options.size;
    this._direction = options.direction;
    this._resizeHandler = options.resizeHandler;
    this._isLastView = options.isLastView;
    this.minSize = options.minSize;
    this.snap = options.snap;
    this._sashCursor = motionValue(this._getSashCursor(options.minPosition, options.maxPosition));

    this._position.on('change', () => {
      this._sashCursor.set(this._getSashCursor(options.minPosition, options.maxPosition));
    });

    this._size.on('change', () => {
      this._sashCursor.set(this._getSashCursor(options.minPosition, options.maxPosition));
    });
  }

  private _getSashCursor(minPosition: number, maxPosition: number) {
    // TODO (TEMP)CAN'T TRUST
    const toTrustNumber = (num: number) => {
      return Math.floor(num * Math.pow(10, 2)) / Math.pow(10, 2);
    };
    const position = toTrustNumber(this._position.get());
    const size = toTrustNumber(this._size.get());

    if (position + size === minPosition + this.minSize) {
      return this._direction === 'horizontal' ? 's-resize' : 'e-resize';
    }

    if (position + size === maxPosition + this.minSize) {
      return this._direction === 'horizontal' ? 'n-resize' : 'w-resize';
    }

    return this._direction === 'horizontal' ? 'row-resize' : 'col-resize';
  }

  public addEventListener(eventType: 'visible', callback: (visible: boolean) => void) {
    this._size.on('change', (v) => {
      const prev = !!this._size.getPrevious();
      const next = !!v;
      if (prev !== next) {
        callback(next);
      }
    });
  }

  public get size() {
    return this._size;
  }

  public get position() {
    return this._position;
  }

  public get direction() {
    return this._direction;
  }

  public get visible() {
    return !!this._size.get();
  }

  public get cachedSize() {
    return this._cachedSize;
  }

  public get resizeHandler() {
    return this._resizeHandler;
  }

  public saveCachedSize() {
    this._cachedSize = this.size.get();
  }

  public get resizable() {
    return !this._isLastView && this.visible;
  }

  public get sashCursor() {
    return this._sashCursor;
  }

  public destroy() {
    this._position.destroy();
    this._size.destroy();
    this._sashCursor.destroy();
  }
}

export default SplitViewControl;
