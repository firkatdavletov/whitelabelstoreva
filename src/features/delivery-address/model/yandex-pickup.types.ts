export type YandexLocationVariant = {
  address: string;
  geoId: number;
};

export type YandexPickupPoint = {
  address: string;
  fullAddress: string | null;
  id: string;
  instruction: string | null;
  isYandexBranded: boolean;
  latitude: number | null;
  longitude: number | null;
  name: string;
  paymentMethods: string[];
};
