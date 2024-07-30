import { motionValue, MotionValue } from 'framer-motion';

interface IViewControlOptions {
  position: number;
  size: number;
  minSize: number;
  visible: boolean;
  // cachedSize?: number;
  resizable: boolean;
  direction: 'horizontal' | 'vertical';
}

class ViewControl {
  private _position: MotionValue<number>;
  private _size: MotionValue<number>;
  private _visible: boolean;
  private _cachedSize?: number;
  private _direction: 'horizontal' | 'vertical';
  public readonly resizable: boolean;
  public readonly minSize: number;
  public constructor(options: IViewControlOptions) {
    this._position = motionValue(options.position);
    this._size = motionValue(options.size);
    this._visible = options.visible;
    this._cachedSize = options.size;
    this._direction = options.direction;
    this.resizable = options.resizable;
    this.minSize = options.minSize;
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
    return this._visible;
  }

  public get cachedSize() {
    return this._cachedSize;
  }

  public saveCachedSize() {
    this._cachedSize = this.size.get();
  }
}

export default ViewControl;
