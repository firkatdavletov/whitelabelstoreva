const GUEST_CHECKOUT_CONTACT_STORAGE_KEY = "storefront_guest_checkout_contact";

type GuestCheckoutContact = {
  fullName: string;
  phone: string;
};

type GuestCheckoutContactsByTenant = Record<string, GuestCheckoutContact>;

function normalizeStoredField(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function readGuestCheckoutContacts() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(
      GUEST_CHECKOUT_CONTACT_STORAGE_KEY,
    );

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).flatMap(([tenantSlug, contact]) => {
        if (!contact || typeof contact !== "object") {
          return [];
        }

        const fullName =
          "fullName" in contact && typeof contact.fullName === "string"
            ? normalizeStoredField(contact.fullName)
            : null;
        const phone =
          "phone" in contact && typeof contact.phone === "string"
            ? normalizeStoredField(contact.phone)
            : null;

        if (!fullName || !phone) {
          return [];
        }

        return [[tenantSlug, { fullName, phone }]];
      }),
    );
  } catch {
    return {};
  }
}

function writeGuestCheckoutContacts(value: GuestCheckoutContactsByTenant) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      GUEST_CHECKOUT_CONTACT_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    // Ignore storage write failures and keep the app functional.
  }
}

export function getRememberedGuestCheckoutContact(tenantSlug: string) {
  const contacts = readGuestCheckoutContacts();
  return contacts[tenantSlug] ?? null;
}

export function rememberGuestCheckoutContact(
  tenantSlug: string,
  contact: {
    fullName: string | null | undefined;
    phone: string | null | undefined;
  },
) {
  const fullName = normalizeStoredField(contact.fullName);
  const phone = normalizeStoredField(contact.phone);
  const contacts = readGuestCheckoutContacts();

  if (!fullName || !phone) {
    if (!(tenantSlug in contacts)) {
      return;
    }

    const nextContacts = { ...contacts };
    delete nextContacts[tenantSlug];
    writeGuestCheckoutContacts(nextContacts);
    return;
  }

  writeGuestCheckoutContacts({
    ...contacts,
    [tenantSlug]: {
      fullName,
      phone,
    },
  });
}
