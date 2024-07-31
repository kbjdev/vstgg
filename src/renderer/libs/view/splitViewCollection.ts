import SplitViewControl from './splitViewControl';

interface ISplitView {
  minSize: number;
  size: number;
  visible: boolean;
}

export interface ISplitViewCollectionOptions {
  container: HTMLElement | null;
  views: ISplitView[];
  direction: 'horizontal' | 'vertical';
}

class SplitViewCollection {
  private readonly _container: HTMLElement;
  private _views: SplitViewControl[];
  private _direction: 'horizontal' | 'vertical';
  private _containerResizeObserver: ResizeObserver;
  public constructor(options: ISplitViewCollectionOptions) {
    if (!options.container) throw new Error('SplitViewCollectionError: Container is not defined');
    this._container = options.container;
    this._direction = options.direction;
    const viewOptions = this._readjustSize(options.views, options.container);
    const positions = this._readjustPosition(viewOptions);
    // const lastFlexibleView = viewOptions.findLastIndex((view) => view.visible);

    const containerSize =
      this._direction === 'vertical'
        ? options.container.offsetWidth
        : options.container.offsetHeight;

    this._views = viewOptions.map((viewOption, index) => {
      const isLastView = index === viewOptions.length - 1;
      const minPosition = viewOptions.reduce(
        (acc, option, i) => (i < index && option.visible ? acc + option.minSize : acc),
        0
      );

      const maxPosition = viewOptions.reduce(
        (acc, option, i) => (i >= index && option.visible ? acc - option.minSize : acc),
        containerSize
      );

      return new SplitViewControl({
        position: positions[index],
        size: viewOption.size,
        visible: viewOption.visible,
        direction: options.direction,
        minSize: viewOption.minSize,
        minPosition,
        maxPosition,
        isLastView,
        resizeHandler: this._resizeHandler(index),
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

  private _getViews(views: SplitViewControl[]) {
    return views.map((view) => ({
      minSize: view.minSize,
      size: view.size.get(),
      visible: view.visible,
    }));
  }

  private _readjustSize(views: ISplitView[], container: HTMLElement): ISplitView[] {
    const containerSize =
      this._direction === 'vertical' ? container.offsetWidth : container.offsetHeight;

    if (!containerSize) throw new Error('Container size should not be 0');

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

  private _readjustPosition(views: ISplitView[]) {
    return views.reduce(
      (result, view, index) => {
        if (index === views.length - 1) return result;
        return result.concat(view.visible ? result[index] + view.size : result[index]);
      },
      [0]
    );
  }

  private _resizeHandler(index: number) {
    const handler = (event: MouseEvent) => {
      const styleTag = document.createElement('style');
      document.head.appendChild(styleTag);
      const initialPosition = this._direction === 'horizontal' ? event.clientY : event.clientX;
      const initialViews = this._getViews(this._views);
      // const initial
      const minDistance = initialViews.reduce(
        (distance, view, i) =>
          view.visible && i <= index ? distance - (view.size - view.minSize) : distance,
        0
      );
      const maxDistance = initialViews.reduce(
        (distance, view, i) =>
          view.visible && i > index ? distance + (view.size - view.minSize) : distance,
        0
      );

      const onDocumentMouseMove = (docEvent: MouseEvent) => {
        const distance =
          (this._direction === 'horizontal' ? docEvent.clientY : docEvent.clientX) -
          initialPosition;

        const getCursor = () => {
          if (this._direction === 'horizontal') {
            if (distance <= minDistance) {
              return 's-resize';
            }
            if (distance >= maxDistance) {
              return 'n-resize';
            }
            return 'row-resize';
          } else {
            if (distance <= minDistance) {
              return 'e-resize';
            }
            if (distance >= maxDistance) {
              return 'w-resize';
            }
            return 'col-resize';
          }
        };

        styleTag.innerHTML = `
          * {
              cursor: ${getCursor()} !important;
          }
          `;

        if (distance < minDistance || distance > maxDistance) return;

        const views = initialViews.map((view) => ({ ...view }));

        const recursiveRight = (targetIndex: number, d: number) => {
          const nextTargetIndex = views.findIndex((view, i) => view.visible && i > targetIndex);
          if (nextTargetIndex === -1) return;
          if (views[nextTargetIndex].size - d < views[nextTargetIndex].minSize) {
            const { size, minSize } = views[nextTargetIndex];
            views[nextTargetIndex].size = minSize;
            recursiveRight(nextTargetIndex, d - (size - minSize));
          } else {
            views[nextTargetIndex].size -= d;
          }
        };

        const recursiveLeft = (targetIndex: number, d: number) => {
          const { size, minSize } = views[targetIndex];
          if (size + d < minSize) {
            views[targetIndex].size = minSize;
            const prevTargetIndex = views.findLastIndex(
              (view, i) => view.visible && view.size > view.minSize && i < targetIndex
            );
            if (prevTargetIndex > -1) {
              recursiveLeft(prevTargetIndex, d + (size - minSize));
            }
          } else {
            views[targetIndex].size += d;
          }
        };

        recursiveLeft(index, distance);
        recursiveRight(index, distance);

        const readjustedPositions = this._readjustPosition(views);
        this._views.forEach((view, index) => {
          view.size.set(views[index].size);
          view.position.set(readjustedPositions[index]);
        });
      };

      const onDocumentMouseUp = () => {
        styleTag.remove();
        document.removeEventListener('mousemove', onDocumentMouseMove);
      };

      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('mouseup', onDocumentMouseUp);
    };

    return handler;
  }

  public destroy() {
    this._containerResizeObserver.disconnect();
    this._views.forEach((view) => {
      view.destroy();
    });
  }
}

export default SplitViewCollection;
