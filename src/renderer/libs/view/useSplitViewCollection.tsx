import { RefObject, useEffect, useState } from 'react';
import SplitViewCollection, { ISplitViewCollectionOptions } from './splitViewCollection';

interface IUseSplitViewCollectionOptions extends Omit<ISplitViewCollectionOptions, 'container'> {
  containerRef: RefObject<HTMLDivElement>;
}

function useSplitViewCollection(options: IUseSplitViewCollectionOptions) {
  const [collection, setCollection] = useState<SplitViewCollection>();

  useEffect(() => {
    const splitViewCollection = new SplitViewCollection({
      container: options.containerRef.current,
      views: options.views,
      direction: options.direction,
    });

    setCollection(splitViewCollection);

    return () => {
      splitViewCollection.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return collection;
}

export default useSplitViewCollection;
