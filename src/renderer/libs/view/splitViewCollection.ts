import SplitViewControl from './splitViewControl';

interface ISplitView {
  minSize: number;
  size: number;
  visible: boolean;
  snap?: boolean;
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
        direction: options.direction,
        visible: viewOption.visible,
        minSize: viewOption.minSize,
        minPosition,
        maxPosition,
        isLastView,
        resizeHandler: this._viewResizeHandler(index),
        snap: viewOption.snap ?? false,
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

  public get direction() {
    return this._direction;
  }

  public getViewControl(index: number) {
    return this._views[index];
  }

  public toggleVisible(viewIndex: number) {
    const target = this.getViewControl(viewIndex);
    const views = this._getViews(this._views);
    const containerSize =
      this._direction === 'horizontal' ? this._container.offsetHeight : this._container.offsetWidth;
    const lastVisibleViewIndex = views.findLastIndex(
      (view, index) => view.visible && viewIndex !== index
    );

    if (target.visible) {
      views[viewIndex].size = 0;
    } else {
      views[viewIndex].size = target.cachedSize;
    }

    const totalSize = views.reduce((total, view) => total + view.size, 0);

    const heightReadjustment = (params: { index: number; gap: number }) => {
      if (views[params.index].size - params.gap < views[params.index].minSize) {
        const gap = params.gap - (views[params.index].size - views[params.index].minSize);
        views[params.index].size = views[params.index].minSize;
        if (params.index === viewIndex) return;
        const last = views.findLastIndex(
          (view, index) => view.visible && viewIndex !== index && index < params.index
        );
        heightReadjustment({ index: last === -1 ? viewIndex : last, gap });
      } else {
        views[params.index].size -= params.gap;
      }
    };

    if (lastVisibleViewIndex === -1) {
      if (totalSize) {
        views[viewIndex].size = containerSize;
      }
    }

    if (lastVisibleViewIndex !== -1) {
      if (totalSize > containerSize) {
        const gap = totalSize - containerSize;
        heightReadjustment({ index: lastVisibleViewIndex, gap });
      } else {
        views[lastVisibleViewIndex].size += containerSize - totalSize;
      }
    }

    const positions = this._readjustPosition(views);
    this._views.forEach((view, index) => {
      view.size.set(views[index].size);
      if (index === viewIndex && views[index].size > 0) {
        view.saveCachedSize();
      }
      view.position.set(positions[index]);
    });
  }

  private _getViews(views: SplitViewControl[]) {
    return views.map((view) => ({
      minSize: view.minSize,
      size: view.size.get(),
      visible: view.visible,
      snap: view.snap,
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

  private _viewResizeHandler(viewIndex: number) {
    return (event: MouseEvent) => {
      const styleTag = document.createElement('style');
      const startPoint = this._direction === 'horizontal' ? event.clientY : event.clientX;
      const views = this._getViews(this._views);
      const before = views.slice(0, viewIndex + 1);
      const after = views.slice(viewIndex + 1);
      const minDistance = before.reduce(
        (d, view) => (view.visible ? d - (view.size - view.minSize) : d),
        0
      );
      const maxDistance = after.reduce(
        (d, view) => (view.visible ? d + (view.size - view.minSize) : d),
        0
      );

      const resizeReduceCallback = (min: number, distance: number) => {
        let remainDistance = distance;
        return (acc: number[], cur: ISplitView) => {
          if (!remainDistance) {
            acc.push(cur.size);
            return acc;
          }

          if (cur.size - remainDistance >= cur.minSize) {
            const movedDistance = Math.max(min, remainDistance);
            acc.push(cur.size - movedDistance);
            remainDistance = 0;
          } else {
            acc.push(cur.minSize);
            remainDistance -= cur.size - cur.minSize;
          }

          return acc;
        };
      };

      const snapReduceCallback = (max: number) => {
        let overDistance: number = 0;
        return (acc: [number | null, number][], cur: ISplitView) => {
          if (cur.snap) {
            overDistance += cur.minSize / 2;
            acc.push([overDistance, cur.minSize]);
          } else {
            acc.push([null, 0]);
          }
          return acc;
        };
      };

      const getSizes = (d: number) => {
        const prev = before.reduceRight(resizeReduceCallback(-maxDistance, -d), []);
        const next = after.reduce(resizeReduceCallback(minDistance, d), []);

        if (d < minDistance) {
          const beforeSnapSize = before.reduceRight(snapReduceCallback(-minDistance), []);
          beforeSnapSize.forEach(([snapSize, minSize], i) => {
            if (snapSize === null) return;
            if (snapSize <= minDistance - d) {
              prev[i] = 0;
              next[0] += minSize;
            }
          });
        }

        if (d > maxDistance) {
          const afterSnapSize = after.reduce(snapReduceCallback(maxDistance), []);
          afterSnapSize.forEach(([snapSize, minSize], i) => {
            if (snapSize === null) return;
            if (snapSize <= d - maxDistance) {
              next[i] = 0;
              prev[0] += minSize;
            }
          });
        }

        return prev.reverse().concat(next);
      };

      const onDocumentMouseMove = (docEvent: MouseEvent) => {
        const distance =
          (this._direction === 'horizontal' ? docEvent.clientY : docEvent.clientX) - startPoint;

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

        const sizes = getSizes(distance);
        const positions = sizes.reduce(
          (result, size, index) => {
            if (index === views.length - 1) return result;
            return result.concat(result[index] + size);
          },
          [0]
        );

        this._views.forEach((view, index) => {
          view.size.set(sizes[index]);
          view.position.set(positions[index]);
        });
      };

      const onDocumentMouseUp = () => {
        styleTag.remove();
        this._views.forEach((view) => {
          view.saveCachedSize();
        });
        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('mouseup', onDocumentMouseUp);
      };

      document.head.appendChild(styleTag);
      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('mouseup', onDocumentMouseUp);
    };
  }

  public destroy() {
    this._containerResizeObserver.disconnect();
    this._views.forEach((view) => {
      view.destroy();
    });
  }
}

export default SplitViewCollection;
