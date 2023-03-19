w.ksn_order_controler = {
    init: function () {
        this.order_product_amount_area = qs('.oformit-zakaz-1__you-order-info-amount'); //поле с количеством комплектов в заказе
        this.order_common_price_area = qs('.oformit-zakaz-1__you-order-info-price'); //поле с общей ценой товаров в заказе
        this.order_empty_cart_message = qs('.oformit-zakaz-1__you-order-empty-cart'); //блок сообщения что корзина пустая
        this.order_zero_cart_price_message = qs('.oformit-zakaz-1__you-order-zero-cart-price'); //блок сообщения что цена товарво в корзине равна нулю
    },

    //получаем общую цену товаров в корзине
    calculate_common_order_prise: function () {
        let result = 0,
            cart_data = localStorage.getItem('cart-data');

        if (!cart_data || cart_data === '{}') return 0; //если корзина пуста

        cart_data = JSON.parse(cart_data);

        for (let id in cart_data) {
            let product_data = cart_data[id], //даные текущего товара
                composition = product_data.composition,
                procuct_price = 0,
                is_full_kit = true; //полный комплект или набор отдельных деталей

            for (let detal in composition) {
                if (composition[detal].add) {
                    procuct_price += composition[detal].price;
                } else {
                    is_full_kit = false; //если хоть одна деталь в комплектен не добавлена то мы помечаем что это не полный комплект
                }
            }

            result += is_full_kit ? +product_data.price * product_data.amount : procuct_price * product_data.amount;
        }

        return result;
    },
    //получаем общую цену товаров в корзине

    //функция возвращает текучщее количество комплектов, не товаров, а именно комплектов
    get_amount_complects_in_cart: function () {
        let cart_data = localStorage.getItem('cart-data'),
            total_amount = 0;

        if (!cart_data || cart_data == '{}') return 0;

        cart_data = JSON.parse(cart_data);

        for (let product in cart_data) {
            let product_data = cart_data[product];
            total_amount += +product_data.amount;
        }

        return total_amount;
    },
    //функция возвращает текучщее количество комплектов, не товаров, а именно комплектов

    //функция определяет какое слов вставить для подписи количества комплекта в зависимости от их количества
    get_amount_postfix: function (value) {
        value = value.toString();

        let komplect = [1],
            komplecta = [2, 3, 4],
            komplectov = [5, 6, 7, 8, 9, 0, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            length = value.length,
            single_value = value => {
                if (komplect.includes(+value)) return 'komplect';
                if (komplecta.includes(+value)) return 'komplecta';
                if (komplectov.includes(+value)) return 'komplectov';
            };

        if (length == 1) return single_value(value);

        if (komplectov.includes(+value.toString().slice(-2))) return 'komplectov';

        return single_value(value.toString().slice(-1));
    },
    //функция определяет какое слов вставить для подписи количества комплекта в зависимости от их количества

    //функция добавляет нужный класс к полю с количеством комплектов чтоб словко комплек читалось логично
    set_amount_area_postfix_class: function (postfix) {
        ['oformit-zakaz-1__you-order-info-amount--komplect', 'oformit-zakaz-1__you-order-info-amount--komplecta', 'oformit-zakaz-1__you-order-info-amount--komplectov'].forEach(class_name => this.order_product_amount_area.classList.remove(class_name)); //убираем все классы

        this.order_product_amount_area.classList.add('oformit-zakaz-1__you-order-info-amount--' + postfix); //добавляем подходящий класс
    },
    //функция добавляет нужный класс к полю с количеством комплектов чтоб словко комплек читалось логично

    //показываем блок с сообщением, подходит для лоадера, сообщения о пустой корзине и сообщение что цена товаров в корзине равна нулю
    order_info_block_show: async function (message_block) {
        //данный блок может быть показан ещё до того как будет создан контролер плавного показа так что если мы вызвали когда контролера ещё нет то просто делаем его многовенно видимым
        if (message_block.ksn_fade) {
            await message_block.ksn_fade.fade_show().catch(() => {}); //ждём показа
        } else {
            message_block.style.opacity = '1';
        }

        message_block.style.pointerEvents = 'auto'; //делаем блок доступным для взаимодействия
    },
    //показываем блок с сообщением, подходит для лоадера, сообщения о пустой корзине и сообщение что цена товаров в корзине равна нулю

    //скрываем блок с сообщением, подходит для лоадера, сообщения о пустой корзине и сообщение что цена товаров в корзине равна нулю
    order_info_block_hide: async function (message_block) {
        //данный блок мы будем скрывать толкьо после того как его контролер прозрачности определён поскольку изначально он скрыт так что првоерку на наличие контролера можно не делать
        await message_block.ksn_fade.fade_hide().catch(() => {}); //ждём сокрытия
        message_block.style.pointerEvents = ''; //делаем блок недоступным для взаимодействия
    },
    //скрываем блок с сообщением, подходит для лоадера, сообщения о пустой корзине и сообщение что цена товаров в корзине равна нулю

    //рендерит блок заказа с нуля
    render_order: async function () {
        let cart_data = JSON.parse(localStorage.getItem('cart-data')),
            cart_total_amount = this.get_amount_complects_in_cart(),
            cart_total_amount_area_postfix = this.get_amount_postfix(cart_total_amount),
            common_price = this.calculate_common_order_prise();

        if (cart_total_amount == 0) return this.order_info_block_show(this.order_empty_cart_message); //если корзина пуста показываем сообщение и заверашем функцию

        if (common_price == 0) return this.order_info_block_show(this.order_zero_cart_price_message); //если цена товаров в корзине равна нулю показываем сообщение и заверашем функцию

        this.order_product_amount_area.textContent = cart_total_amount; //записываем количество комплектов в поле

        this.set_amount_area_postfix_class(cart_total_amount_area_postfix); //функция добавляет нужный класс к полю с количеством комплектов чтоб словко комплек читалось логично

        this.order_common_price_area.textContent = common_price.toLocaleString('ru'); //получаем общую цену товаров в корзине и записывает её в поле для финальной цены

       
    },
    //рендерит блок заказа с нуля
};
