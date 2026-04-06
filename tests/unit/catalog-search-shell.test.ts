import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/entities/product";
import { CATALOG_SEARCH_DEBOUNCE_MS } from "@/features/menu-catalog/lib/catalog-search";

const fetchMock = vi.fn();

vi.mock("next/link", () => ({
  default: (props: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

vi.mock("@/widgets/menu-grid", () => ({
  MenuGrid: (props: { products: Product[] }) =>
    React.createElement(
      "div",
      { "data-testid": "menu-grid" },
      props.products.map((product) => product.name).join(", "),
    ),
}));

import { CatalogSearchShell } from "@/widgets/catalog-search/ui/catalog-search-shell";

const searchMessages = {
  empty: "No items were found for “{{query}}”.",
  errorDescription:
    "Try a different query or open the full catalog menu instead.",
  errorTitle: "Failed to load search results",
  inputPlaceholder: "For example: burger, roll, lemonade",
  loading: "Searching the catalog...",
  openMenu: "Open menu",
  resultsCount: "Items found: {{count}}",
};

function createProduct(name: string): Product {
  return {
    categoryId: "cat-1",
    countStep: 1,
    currency: "USD",
    defaultVariantId: null,
    description: "",
    id: `product-${name}`,
    imageUrl: null,
    isAvailable: true,
    isConfigured: false,
    modifierGroups: [],
    name,
    optionGroups: [],
    price: 12,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    tags: [],
    unit: "PIECE",
    variants: [],
    visual: name.slice(0, 1),
  };
}

describe("CatalogSearchShell", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("renders initial results without refetching on mount", () => {
    render(
      React.createElement(CatalogSearchShell, {
        initialError: null,
        initialProducts: [createProduct("Truffle Burger")],
        initialQuery: "Truffle Burger",
        locale: "en",
        menuHref: "/storeva-premium/en/menu",
        searchMessages,
        tenantSlug: "storeva-premium",
      }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("menu-grid")).toHaveTextContent("Truffle Burger");
  });

  it("does not start search requests below the minimum query length", () => {
    render(
      React.createElement(CatalogSearchShell, {
        initialError: null,
        initialProducts: [],
        initialQuery: null,
        locale: "en",
        menuHref: "/storeva-premium/en/menu",
        searchMessages,
        tenantSlug: "storeva-premium",
      }),
    );

    fireEvent.change(
      screen.getByPlaceholderText(searchMessages.inputPlaceholder),
      {
        target: { value: "bu" },
      },
    );

    act(() => {
      vi.advanceTimersByTime(CATALOG_SEARCH_DEBOUNCE_MS + 20);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/Enter at least \d+ characters to search/),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("menu-grid")).not.toBeInTheDocument();
  });

  it("debounces requests and aborts the previous in-flight search", async () => {
    let firstRequestWasAborted = false;

    fetchMock
      .mockImplementationOnce((_input: string, init?: RequestInit) => {
        const requestSignal = init?.signal;
        return new Promise((_resolve, reject) => {
          requestSignal?.addEventListener("abort", () => {
            firstRequestWasAborted = true;
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      })
      .mockResolvedValueOnce({
        json: async () => ({
          products: [createProduct("Burger Deluxe")],
        }),
        ok: true,
      });

    render(
      React.createElement(CatalogSearchShell, {
        initialError: null,
        initialProducts: [],
        initialQuery: null,
        locale: "en",
        menuHref: "/storeva-premium/en/menu",
        searchMessages,
        tenantSlug: "storeva-premium",
      }),
    );

    const input = screen.getByPlaceholderText(searchMessages.inputPlaceholder);

    fireEvent.change(input, {
      target: { value: "bur" },
    });

    await act(async () => {
      vi.advanceTimersByTime(CATALOG_SEARCH_DEBOUNCE_MS);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.change(input, {
      target: { value: "burger" },
    });

    expect(firstRequestWasAborted).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(CATALOG_SEARCH_DEBOUNCE_MS);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("query=burger");
  });
});
