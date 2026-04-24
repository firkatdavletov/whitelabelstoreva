declare global {
  type YandexMapLocation = {
    center: [number, number];
    duration?: number;
    zoom: number;
  };

  type YandexMapListenerEvent = {
    location?: {
      center?: [number, number];
      zoom?: number;
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
    removeChild?(child: unknown): void;
    update(update: YandexMapUpdate): void;
  }

  interface YandexMapMarkerProps {
    coordinates: [number, number];
    id?: string;
    source?: string;
    zIndex?: number;
  }

  interface YandexMapsImport {
    <T = unknown>(packageName: string): Promise<T>;
    registerCdn?: (template: string, packages: string[]) => void;
  }

  interface YandexMapsNamespace {
    import: YandexMapsImport;
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
    YMapFeatureDataSource?: new (options: { id: string }) => unknown;
    YMapLayer?: new (options: {
      source: string;
      type: string;
      zIndex?: number;
    }) => unknown;
    YMapListener: new (options: {
      onActionEnd?: (event: YandexMapListenerEvent) => void;
    }) => unknown;
    YMapMarker: new (
      props: YandexMapMarkerProps,
      element?: HTMLElement,
    ) => unknown;
  }

  interface Window {
    __yandexMapsCdnRegistered__?: boolean;
    __yandexMapsPromise__?: Promise<YandexMapsNamespace>;
    ymaps3?: YandexMapsNamespace;
  }
}

export {};
