export const enMessages = {
  cart: {
    checkout: "Proceed to checkout",
    continue: "Browse menu",
    empty: "Your cart is empty. Add a few dishes to start an order.",
    loading: "Refreshing cart...",
    open: "Open cart",
    subtitle: "Cart state is synced with the backend via /api/v1/cart.",
    summary: "Cart summary",
    title: "Cart",
  },
  checkout: {
    address: "Delivery address",
    comment: "Courier note",
    fullName: "Full name",
    paymentMethod: "Payment method",
    phone: "Phone number",
    submit: "Create placeholder order",
    subtitle: "Validated client-side form ready to POST into Spring Boot.",
    title: "Checkout",
  },
  deliveryAddress: {
    available: "Available",
    back: "Back",
    conditionNotAvailable: "No data",
    conditionsEta: "ETA",
    conditionsPrice: "Price",
    conditionsStatus: "Status",
    conditionsZone: "Zone",
    confirm: "Choose address",
    detecting: "Refreshing delivery conditions for the map center...",
    detectError: "Failed to load delivery conditions for this map location.",
    free: "Free",
    dragMapHint: "Move the map so the center marker sits on the exact address.",
    mapKeyMissing:
      "Add NEXT_PUBLIC_YANDEX_MAPS_API_KEY to render the Yandex map.",
    mapLoadError: "The map could not be loaded. Try refreshing the page.",
    mapLoading: "Loading Yandex map...",
    mapSubtitle:
      "The marker stays fixed in the center. Move the map to choose the delivery address precisely.",
    mapTitle: "Delivery map",
    methodSubtitle:
      "Choose how the order should be fulfilled. Courier delivery is confirmed via the map.",
    methodTitle: "Fulfillment method",
    methodsEmpty: "The backend did not return any delivery methods yet.",
    methodsError: "Failed to load delivery methods.",
    retry: "Retry",
    saveErrorDescription:
      "Check the selected address and try saving it one more time.",
    saveErrorTitle: "Failed to save address",
    saveSuccessDescription: "The cart is updated. Returning to the storefront.",
    saveSuccessTitle: "Address saved",
    selectedAddressPending:
      "Move the map to fetch the address and delivery conditions.",
    selectedAddressTitle: "Selected address",
    subtitle:
      "Choose the fulfillment method and confirm the point on the map. Saving updates the active cart delivery settings.",
    summarySubtitle:
      "We show the address resolved by the backend for the current map center together with the delivery conditions.",
    summaryTitle: "Delivery conditions",
    title: "Address and fulfillment",
    unavailable: "Unavailable",
  },
  footer: {
    caption:
      "Feature-first storefront shell ready for Spring Boot integration.",
    subtitle: "Shared frontend, branded by tenant config.",
  },
  header: {
    addressPending: "add address",
    cartWithTotal: "Cart {{total}}",
    delivery: "Delivery",
    deliveryAddressLabel: "Delivery: {{address}}",
    etaDays: "{{days}} day",
    etaPending: "estimate pending",
    etaToday: "today",
    login: "Sign in",
    pickup: "Pickup",
    pickupAddressLabel: "Pickup: {{address}}",
    searchPlaceholder: "Search menu",
  },
  home: {
    browseMenu: "Browse full menu",
    checkout: "Go to checkout",
    eyebrow: "White label food ordering platform",
    featured: "Featured dishes",
    subtitle:
      "One frontend shell, tenant-specific branding, typed API boundaries, and zero backend business rules on the client.",
  },
  menu: {
    empty: "Menu is empty for this tenant.",
    subtitle:
      "Catalog data flows through a typed API layer and tenant-specific mapping.",
    title: "Menu",
  },
  navigation: {
    cart: "Cart",
    checkout: "Checkout",
    home: "Home",
    menu: "Menu",
    orders: "Orders",
  },
  order: {
    currentStatus: "Current status",
    eta: "ETA",
    loading: "Refreshing live order status...",
    subtitle:
      "TanStack Query handles client-side status polling and cache lifecycle.",
    timeline: "Progress timeline",
    title: "Order tracking",
  },
  product: {
    addToCart: "Add to cart",
    preview: "Preview",
  },
  shared: {
    locale: "Language",
    quantity: "Qty",
    tenant: "Tenant",
    total: "Total",
  },
  toast: {
    checkoutReadyDescription:
      "The form is validated. Next step: POST it to the Spring Boot checkout endpoint.",
    checkoutReadyTitle: "Payload ready",
    itemAddedDescription: "{{name}} is now in the basket.",
    itemAddedTitle: "Added to cart",
  },
} as const;
