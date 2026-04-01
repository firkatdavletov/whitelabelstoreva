export const ruMessages = {
  cart: {
    checkout: "Перейти к оформлению",
    continue: "Открыть меню",
    empty: "Корзина пока пустая. Добавьте несколько блюд, чтобы начать заказ.",
    loading: "Обновляем корзину...",
    open: "Открыть корзину",
    subtitle: "Корзина синхронизируется с backend через /api/v1/cart.",
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
  deliveryAddress: {
    available: "Доступно",
    back: "Назад",
    conditionNotAvailable: "Нет данных",
    conditionsEta: "Срок",
    conditionsPrice: "Стоимость",
    conditionsStatus: "Статус",
    conditionsZone: "Зона",
    confirm: "Выбрать адрес",
    detecting: "Обновляем условия доставки по центру карты...",
    detectError: "Не удалось получить условия доставки для выбранной точки.",
    free: "Бесплатно",
    dragMapHint: "Переместите карту так, чтобы маркер оказался на нужном адресе.",
    mapKeyMissing:
      "Для отображения карты добавьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY в окружение.",
    mapLoadError: "Карта не загрузилась. Попробуйте обновить страницу.",
    mapLoading: "Загружаем карту Яндекса...",
    mapSubtitle:
      "Маркер фиксирован по центру. Двигайте карту, чтобы выбрать точный адрес доставки.",
    mapTitle: "Карта доставки",
    methodSubtitle:
      "Выберите способ получения заказа. Для доставки адрес подтверждается по карте.",
    methodTitle: "Способ получения",
    methodsEmpty: "Backend пока не вернул доступные способы доставки.",
    methodsError: "Не удалось загрузить способы доставки.",
    retry: "Повторить",
    saveErrorDescription:
      "Проверьте выбранный адрес и попробуйте сохранить его ещё раз.",
    saveErrorTitle: "Не удалось сохранить адрес",
    saveSuccessDescription: "Корзина обновлена. Возвращаемся к заказу.",
    saveSuccessTitle: "Адрес сохранён",
    selectedAddressPending: "Подвиньте карту, чтобы получить адрес и условия.",
    selectedAddressTitle: "Выбранный адрес",
    subtitle:
      "Выберите способ доставки и подтвердите точку на карте. После сохранения адрес обновит текущую корзину.",
    summarySubtitle:
      "Показываем адрес, который backend определил по текущему центру карты, и актуальные условия доставки.",
    summaryTitle: "Условия доставки",
    title: "Адрес и способ получения",
    unavailable: "Недоступно",
  },
  footer: {
    caption:
      "Feature-first storefront-оболочка, подготовленная к интеграции со Spring Boot.",
    subtitle: "Один фронтенд, разные бренды через tenant config.",
  },
  header: {
    addressPending: "укажите адрес",
    cartWithTotal: "Корзина {{total}}",
    delivery: "Доставка",
    deliveryAddressLabel: "Доставка: {{address}}",
    etaDays: "{{days}} дн.",
    etaPending: "время уточняется",
    etaToday: "сегодня",
    login: "Войти",
    pickup: "Самовывоз",
    pickupAddressLabel: "Самовывоз: {{address}}",
    searchPlaceholder: "Поиск по меню",
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
