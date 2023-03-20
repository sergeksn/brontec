w.ksn_order_controler = {
    init: function () {
        this.you_order_wrap = qs('.oformit-zakaz-1__you-order'); //оболочка всего блока с заказом
        this.order_product_amount_area = qs('.oformit-zakaz-1__you-order-info-amount'); //поле с количеством комплектов в заказе
        this.order_common_price_area = qs('.oformit-zakaz-1__you-order-info-price'); //поле с общей ценой товаров в заказе
        this.order_empty_cart_message = qs('.oformit-zakaz-1__you-order-empty-cart'); //блок сообщения что корзина пустая
        this.order_zero_cart_price_message = qs('.oformit-zakaz-1__you-order-zero-cart-price'); //блок сообщения что цена товарво в корзине равна нулю
        this.order_spoiler_title = qs('.oformit-zakaz-1__you-order h2'); //блок заголовка который болжен открывать/закрывать спойлер заказа
        this.order_spoiler_content = qs('.oformit-zakaz-1__you-order-spoiler-wrap-content');
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
            let product_data = cart_data[product],
                empty_kit = (() => {
                    if (product_data.tools) return false; //если это соло инструмент прерываем

                    for (let detal in product_data.composition) {
                        if (product_data.composition[detal].add) return false;
                    }

                    return true;
                })(); //может такое случится что после синхронизации выдеденные детали будут удалены и получается что у товара нет добавленых к покупке деталей, в этом случае мы не должны рендерить данный комплект

            if (empty_kit) continue; //если это пустой комплект мы его не учитываем

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
        this.order_spoiler_title.classList.add('lock-order-title'); //блокируем возможность открывать/закрывать спойлер
        this.you_order_wrap.classList.add('oformit-zakaz-1__you-order--empty-or-zero-cart'); //задаст для блока минимальную высоту чтоб апсолютно позиционированные блоки уведомлений отображались корректно

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

        this.order_spoiler_title.classList.remove('lock-order-title'); //разблокируем возможность открывать/закрывать спойлер
        this.you_order_wrap.classList.remove('oformit-zakaz-1__you-order--empty-or-zero-cart'); //задаст для блока минимальную высоту чтоб апсолютно позиционированные блоки уведомлений отображались корректно
    },
    //скрываем блок с сообщением, подходит для лоадера, сообщения о пустой корзине и сообщение что цена товаров в корзине равна нулю

    //ищем товары которые являются просто инструментом без других плёнок
    search_only_tools: function (cart_data) {
        //перебираем все товары в корзине
        for (let id in cart_data) {
            let product_data = cart_data[id],
                composition = product_data.composition,
                only_tools = true; //пометка что данный товар всего лишь инструмент

            //перебираем все детали данного комплекта
            for (let detal in composition) {
                let detal_data = composition[detal]; //данные текущей детали комплекта

                //если инструмент для данного товара не добавлен то он уже априори не может стать товаром соло инструмента
                if (detal == 'tools') {
                    if (!detal_data.add) only_tools = false;
                    break;
                }
                //если инструмент для данного товара не добавлен то он уже априори не может стать товаром соло инструмента

                if (detal_data.add) only_tools = false; //если товар не инструмент но добавлен в комплекте то данный товар тоже не является соло инструментом
            }
            //перебираем все детали данного комплекта

            if (only_tools) {
                cart_data[id] = {
                    amount: product_data.amount,
                    tools: true,
                    price: composition['tools'].price,
                };
            }
        }
        //перебираем все товары в корзине

        //мы ничего не возвращает т.к. мы изменяем переданный объект cart_data
    },
    //ищем товары которые являются просто инструментом без других плёнок

    //ищем и объединяем одинаковые товары
    unite_dublicate_kits: function (cart_data) {
        let temp_cart_data = {}, //времеяный объект с данными товаров ввиде строк и очищеных значений которые могут отличаться но не влияют на показатель одинаковости товаров
            amount_data = {}; //временныей объект будет содержать пары id - количество товара

        //перебираем все товары для формирования объекта с строковыми предствалениями для дальнейшего удобства сравнения
        for (id in cart_data) {
            let product_data = cart_data[id], //данные текущего товара
                serched_string = JSON.stringify(product_data)
                    .replace(/"amount":[^,]+,/, '')
                    .replace(/"spoiler_hide":[^,]+,/, ''); //чистим данные которые могут отличатся но не влияют на то одинаковые товары или нет

            //записываем данные во времеянный объект для проведения стравнения
            temp_cart_data[id] = {
                amount: product_data.amount, //количество товара
                str: serched_string, //стркоовое представление для сравнения
            };
            //записываем данные во времеянный объект для проведения стравнения
        }
        //перебираем все товары для формирования объекта с строковыми предствалениями для дальнейшего удобства сравнения

        //перебираем все товары для поиска дубликатов
        for (let id in temp_cart_data) {
            let product_data = temp_cart_data[id], //данные текущего проверяемого товара
                str = product_data.str, //строковое представление искомого товара
                amount = product_data.amount; //начальное количество искомого товара

            amount_data[id] = amount; //будет хранить id уникальных товаров и их количество

            delete temp_cart_data[id]; //удаляем текущий проверяемый товар т.к. с ним нет смысла сравнивать

            //передираем все товары для поиска дубликата текущего проверяемого товара
            for (let id_2 in temp_cart_data) {
                let product_data_2 = temp_cart_data[id_2], //данные текущего товара для сравнения
                    str_2 = product_data_2.str, //строковое представление сравниваемого товара
                    amount_2 = product_data_2.amount; //количество сравниваемого товара

                //если текущий искомый товар такой же как и товар который сравниваем то мы увеличиваем количество искомого товара на величину количества сравниваемого товара, а сам дубликат удаляем чтоб больше его не учитывать в проверках
                if (str == str_2) {
                    amount_data[id] += amount_2;
                    delete temp_cart_data[id_2];
                }
            }
            //передираем все товары для поиска дубликата текущего проверяемого товара
        }
        //перебираем все товары для поиска дубликатов

        //перебираем все исходные товары для финальной очистки объектов от дублей
        for (id in cart_data) {
            //если такого товара нет после очистки дублей
            if (!amount_data[id]) {
                delete cart_data[id]; //удляем товар если его нет после очистки дубликатов
                continue; //сразу переходим к следующему товару
            }
            //если такого товара нет после очистки дублей

            cart_data[id].amount = amount_data[id];
        }
        //перебираем все исходные товары для финальной очистки объектов от дублей
    },
    //ищем и объединяем одинаковые товары

    //рендерит один элемент товара в блоке заказа
    render_order_item: function (data, single_product = false) {
        let empty_kit = (() => {
            if (data.tools) return false; //если это соло инструмент прерываем

            for (let detal in data.composition) {
                if (data.composition[detal].add) return false;
            }

            return true;
        })(); //может такое случится что после синхронизации выдеденные детали будут удалены и получается что у товара нет добавленых к покупке деталей, в этом случае мы не должны рендерить данный комплект

        if (empty_kit) return ''; //если в этом комплекте нет отмеченых деталей то мы его не выводим и возвращаем вместо него пустую строку

        let is_full_kit = (() => {
                if (data.tools) return false; //если это соло инструмент прерываем

                //проверяем полный ли комплект
                for (let detal in data.composition) {
                    if (!data.composition[detal].add) return false;
                }
                return true;
            })(),
            amount = data.amount,
            spoiler_toggle_button_class = single_product ? ' order__product-toggle-composition--open' : '', //меняем поворот стрелочки у кнопки спойлера состава товара в зависимости от того один товар в заказе или нет
            spoiler_class = single_product ? '' : ' spoiler-hidden', //скрываем/показываем спойлер у товара
            spoilet_content_style = single_product ? ' style="opacity:1;"' : '', //если нужно показать спойлер делаем его контент видимым
            marka_model = data.marka_model,
            order_product_body = d.createElement('div'), //создаём элемент товара в заказе
            order_product_body_title_class = (() => {
                if (data.tools) return ' order__product-title--tools'; //если это просто инструмент
                if (is_full_kit) return ' order__product-title--full-kit'; //если полный комплект
            })(),
            product_title = data.tools ? '' : marka_model.replace('@@', ' '),
            price = (() => {
                //сумма всех добавленых деталей или всего комплекта если он полный
                if (is_full_kit || data.tools) return data.price * amount; //если полный комплект или соло инструмент

                let result_price = 0;
                for (let detal in data.composition) {
                    if (data.composition[detal].add) result_price += data.composition[detal].price;
                }
                return result_price * amount;
            })();

        order_product_body.classList.add('order__product'); //добавляем класс элементу товара

        let content = `
            <div class="order__product-title${order_product_body_title_class ?? ''}">${product_title}</div>
            <div class="order__product-info">
                <div class="order__product-info-amount">${amount}</div>
                <div class="order__product-info-price ruble-price">${price.toLocaleString('ru')}</div>
            </div>
            <button class="order__product-toggle-composition set-min-interactive-size${spoiler_toggle_button_class}" disabled></button>
            <div class="order__product-spoiler-wrap${spoiler_class}">
                <div class="order__product-spoiler-wrap-content"${spoilet_content_style}>`;
        //если это соло инструмент
        if (data.tools) {
            content += `<div class="order__product-spoiler-wrap-content-item">${GDS.products_detal_types['tools']}</div>`;
        }
        //если это соло инструмент

        //если это полный или частичный комплект
        else {
            for (let detal in data.composition) {
                if (data.composition[detal].add) content += `<div class="order__product-spoiler-wrap-content-item">${GDS.products_detal_types[detal]}</div>`; //вставляем только добавленые в состав детали
            }
        }
        //если это полный или частичный комплект

        content += `</div>
            </div>`;

        order_product_body.innerHTML += content; //записываем полыченый html код

        return order_product_body; //возвращаем наш элемент товара
    },
    //рендерит один элемент товара в блоке заказа

    //рендерит блок заказа с нуля
    render_order: async function () {
        let cart_total_amount = this.get_amount_complects_in_cart(),
            cart_total_amount_area_postfix = this.get_amount_postfix(cart_total_amount),
            common_price = this.calculate_common_order_prise();

        if (cart_total_amount == 0) return this.order_info_block_show(this.order_empty_cart_message); //если корзина пуста показываем сообщение и заверашем функцию

        if (common_price == 0) return this.order_info_block_show(this.order_zero_cart_price_message); //если цена товаров в корзине равна нулю показываем сообщение и заверашем функцию

        this.order_product_amount_area.textContent = cart_total_amount; //записываем количество комплектов в поле

        this.set_amount_area_postfix_class(cart_total_amount_area_postfix); //функция добавляет нужный класс к полю с количеством комплектов чтоб словко комплек читалось логично

        this.order_common_price_area.textContent = common_price.toLocaleString('ru'); //получаем общую цену товаров в корзине и записывает её в поле для финальной цены

        let cart_data = JSON.parse(localStorage.getItem('cart-data')); //получаем данные из хранилища корзины

        //в следующих функция меняется cart_data объект, по этому ничего не врозвращается
        this.search_only_tools(cart_data); //ищем товары которые являются просто инструментом без других плёнок

        this.unite_dublicate_kits(cart_data); //ищем и объединяем одинаковые товары

        let wrap = d.createDocumentFragment(), //создаём оболочку в которую будем вставлять все отрендереные товары
            single_product_in_order = Object.keys(cart_data).length == 1; //определяет один товар в заказе или нет

        //рендерим каждый товар
        for (let item_id in cart_data) {
            wrap.append(this.render_order_item(cart_data[item_id], single_product_in_order));
        }
        //рендерим каждый товар

        this.order_spoiler_content.append(wrap); //вставляем результат в блок заказа
    },
    //рендерит блок заказа с нуля
};
