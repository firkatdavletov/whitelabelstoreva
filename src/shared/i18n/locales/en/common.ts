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
