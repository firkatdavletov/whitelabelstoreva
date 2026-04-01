declare global {
  type YandexMapLocation = {
    center: [number, number];
    duration?: number;
    zoom: number;
  };

  type YandexMapListenerEvent = {
    location?: {
      center?: [number, number];
    };
  };

  type YandexMapUpdate = {
    location?: Partial<YandexMapLocation> & {
      center?: [number, number];
    };
  };

  interface YandexMapInstance {
    addChild(child: unknown): void;
    destroy?: () => void;
    update(update: YandexMapUpdate): void;
  }

  interface YandexMapsNamespace {
    ready: Promise<void>;
    YMap: new (
      container: HTMLElement,
      options: {
        behaviors?: string[];
        location: YandexMapLocation;
      },
    ) => YandexMapInstance;
    YMapDefaultFeaturesLayer?: new () => unknown;
    YMapDefaultSchemeLayer: new () => unknown;
    YMapListener: new (options: {
      onActionEnd?: (event: YandexMapListenerEvent) => void;
    }) => unknown;
  }

  interface Window {
    __yandexMapsPromise__?: Promise<YandexMapsNamespace>;
    ymaps3?: YandexMapsNamespace;
  }
}

export {};
