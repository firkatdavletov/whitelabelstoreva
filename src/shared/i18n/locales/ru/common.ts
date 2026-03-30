export const ruMessages = {
  cart: {
    checkout: "Перейти к оформлению",
    continue: "Открыть меню",
    empty: "Корзина пока пустая. Добавьте несколько блюд, чтобы начать заказ.",
    open: "Открыть корзину",
    subtitle:
      "Состояние корзины хранится на фронтенде, пока checkout не подключен к backend.",
    summary: "Сводка по корзине",
    title: "Корзина",
  },
  checkout: {
    address: "Адрес доставки",
    comment: "Комментарий курьеру",
    fullName: "Имя и фамилия",
    paymentMethod: "Способ оплаты",
    phone: "Телефон",
    submit: "Создать заказ-заглушку",
    subtitle:
      "Форма валидируется на клиенте и готова к POST-запросу в Spring Boot backend.",
    title: "Оформление заказа",
  },
  footer: {
    caption:
      "Feature-first storefront-оболочка, подготовленная к интеграции со Spring Boot.",
    subtitle: "Один фронтенд, разные бренды через tenant config.",
  },
  header: {
    localeLabel: "Язык",
  },
  home: {
    browseMenu: "Открыть меню",
    checkout: "Перейти к checkout",
    eyebrow: "White label платформа заказа еды",
    featured: "Популярные позиции",
    subtitle:
      "Один frontend shell, tenant-specific branding, typed API boundaries и без backend-бизнес-логики на клиенте.",
  },
  menu: {
    empty: "Для этого tenant каталог пока пуст.",
    subtitle:
      "Каталог проходит через typed API layer и tenant-specific mapping перед рендерингом.",
    title: "Меню",
  },
  navigation: {
    cart: "Корзина",
    checkout: "Checkout",
    home: "Главная",
    menu: "Меню",
    orders: "Заказы",
  },
  order: {
    currentStatus: "Текущий статус",
    eta: "ETA",
    loading: "Обновляем статус заказа...",
    subtitle:
      "TanStack Query управляет клиентским polling и жизненным циклом кеша.",
    timeline: "Лента статусов",
    title: "Отслеживание заказа",
  },
  product: {
    addToCart: "Добавить",
    preview: "Подробнее",
  },
  shared: {
    locale: "Язык",
    quantity: "Кол-во",
    tenant: "Tenant",
    total: "Итого",
  },
  toast: {
    checkoutReadyDescription:
      "Форма успешно провалидирована. Следующий шаг — POST в Spring Boot checkout endpoint.",
    checkoutReadyTitle: "Payload готов",
    itemAddedDescription: "{{name}} добавлен в корзину.",
    itemAddedTitle: "Позиция добавлена",
  },
} as const;
