import ViewControl from './viewControl';

interface IView {
  minSize: number;
  size: number;
  visible: boolean;
}

interface ISplitViewControlOptions {
  container: HTMLElement | null;
  views: IView[];
  direction: 'horizontal' | 'vertical';
}

class SplitViewControl {
  private readonly _container: HTMLElement;
  private _views: ViewControl[];
  private _direction: 'horizontal' | 'vertical';
  private _containerResizeObserver: ResizeObserver;
  public constructor(options: ISplitViewControlOptions) {
    if (!options.container) throw new Error('SplitViewControlError: Container is not defined');
    this._container = options.container;
    this._direction = options.direction;
    const viewOptions = this._readjustSize(options.views, options.container);
    const positions = this._readjustPosition(viewOptions);

    this._views = viewOptions.map((viewOption, index) => {
      const resizable = index !== viewOptions.length - 1;

      return new ViewControl({
        position: positions[index],
        size: viewOption.size,
        visible: viewOption.visible,
        direction: options.direction,
        minSize: viewOption.minSize,
        resizable,
      });
    });

    this._containerResizeObserver = new ResizeObserver(([entry]) => {
      const views = this._getViews(this._views);
      const readjustedViews = this._readjustSize(views, entry.target as HTMLElement);
      const readjustedPositions = this._readjustPosition(readjustedViews);

      this._views.forEach((view, index) => {
        view.size.set(readjustedViews[index].size);
        view.position.set(readjustedPositions[index]);
        view.saveCachedSize();
      });
    });

    this._containerResizeObserver.observe(this._container);
  }

  public getViewControl(index: number) {
    return this._views[index];
  }

  private _getViews(views: ViewControl[]) {
    return views.map((view) => ({
      minSize: view.minSize,
      size: view.size.get(),
      visible: view.visible,
    }));
  }

  private _readjustSize(views: IView[], container: HTMLElement): IView[] {
    const containerSize =
      this._direction === 'vertical' ? container.offsetWidth : container.offsetHeight;

    const { total, totalWithoutMinSize } = views.reduce(
      (size, view) => ({
        total: view.visible ? size.total + view.size : size.total,
        totalWithoutMinSize:
          view.visible && view.size > view.minSize
            ? size.totalWithoutMinSize + view.size
            : size.totalWithoutMinSize,
      }),
      { total: 0, totalWithoutMinSize: 0 }
    );

    if (total > containerSize) {
      views.forEach((view) => {
        if (!view.visible) return;
        const ratioSize =
          view.size * ((containerSize - (total - totalWithoutMinSize)) / totalWithoutMinSize);
        view.size = ratioSize < view.minSize ? view.minSize : ratioSize;
      });

      return this._readjustSize(views, container);
    }

    if (total < containerSize) {
      views.forEach((view) => {
        if (!view.visible) return;
        const ratioSize = view.size * (containerSize / total);
        view.size = ratioSize < view.minSize ? view.minSize : ratioSize;
      });
    }

    return views;
  }

  private _readjustPosition(views: IView[]) {
    return views.reduce(
      (result, view, index) => {
        if (index === views.length - 1) return result;
        return result.concat(view.visible ? result[index] + view.size : result[index]);
      },
      [0]
    );
  }

  // private _resizeHandler(index: number) {
  //   const handler = (event: MouseEvent) => {
  //     const p = this._direction === 'horizontal' ? event.clientX : event.clientY;
  //     const target = this.getViewControl(index);

  //     const onDocumentMouseMove = (docEvent: MouseEvent) => {
  //       const dp = (this._direction === 'horizontal' ? docEvent.clientX : docEvent.clientY) - p;
  //       const targetSize = target.size.get();
  //       if (targetSize - dp < target.minSize) {
  //         target.size.set(target.minSize);
  //       }
  //     };
  //   };

  //   return handler;
  // }

  public destroy() {
    this._containerResizeObserver.disconnect();
  }
}

export default SplitViewControl;
