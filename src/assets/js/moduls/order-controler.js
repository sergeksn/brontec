let rerender_order_list_event = new CustomEvent('rerender-order-list'), //событие которое будет срабатывать на блоке с заказом когда он будет перерендериваться
    empty_order = new CustomEvent('empty-order'), //сработает когда корзина пуста при рендере заказа
    zero_cart_price = new CustomEvent('zero-cart-price'); //сработает когда цена товаров в корзине равна нулю при рендере заказа

w.ksn_order_controler = {
    init: function () {
        //ВАЖНО: нужно пределять именно сдесь т.к. раньше этих элементов просто нет в DOM
        this.you_order_wrap = qs('.oformit-zakaz-1__you-order'); //оболочка всего блока с заказом
        this.order_product_amount_area = qs('.oformit-zakaz-1__you-order-info-amount'); //поле с количеством комплектов в заказе
        this.order_common_price_area = qs('.oformit-zakaz-1__you-order-info-price'); //поле с общей ценой товаров в заказе
        this.order_empty_cart_message = qs('.oformit-zakaz-1__you-order-empty-cart'); //блок сообщения что корзина пустая
        this.order_zero_cart_price_message = qs('.oformit-zakaz-1__you-order-zero-cart-price'); //блок сообщения что цена товарво в корзине равна нулю
        this.order_spoiler_title = qs('.oformit-zakaz-1__you-order h2'); //блок заголовка который болжен открывать/закрывать спойлер заказа
        this.order_spoiler_content = qs('.oformit-zakaz-1__you-order-spoiler-wrap-content'); //содержимое заказа
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
                if (komplect.includes(+value)) return ' комплект';
                if (komplecta.includes(+value)) return ' комплекта';
                if (komplectov.includes(+value)) return ' комплектов';
            };

        if (length == 1) return single_value(value);

        if (komplectov.includes(+value.toString().slice(-2))) return ' комплектов';

        return single_value(value.toString().slice(-1));
    },
    //функция определяет какое слов вставить для подписи количества комплекта в зависимости от их количества

    //функция добавляет нужный текст к полю с количеством комплектов чтоб словко комплек читалось логично
    set_amount_area_postfix: function (postfix) {
        let area = this.order_product_amount_area;
        area.textContent = area.textContent.replace(/(\d+).*/i, '$1' + postfix);
    },
    //функция добавляет нужный текст к полю с количеством комплектов чтоб словко комплек читалось логично

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
        //данный блок может быть скрыт ещё до того как будет создан контролер плавного показа так что если мы вызвали когда контролера ещё нет то просто делаем его многовенно невидимым
        if (message_block.ksn_fade) {
            await message_block.ksn_fade.fade_hide().catch(() => {}); //ждём сокрытия
        } else {
            message_block.style.opacity = '';
        }

        message_block.style.pointerEvents = ''; //делаем блок недоступным для взаимодействия

        this.order_spoiler_title.classList.remove('lock-order-title'); //разблокируем возможность открывать/закрывать спойлер
        this.you_order_wrap.classList.remove('oformit-zakaz-1__you-order--empty-or-zero-cart'); //задаст для блока минимальную высоту чтоб апсолютно позиционированные блоки уведомлений отображались корректно
    },
    //скрываем блок с сообщением, подходит для лоадера, сообщения о пустой корзине и сообщение что цена товаров в корзине равна нулю

    //ищем и удаляем пустые комплекты, они могли появится в следствии снятия у товара всех галочек, или после синхронизации с базой когда отмеченая деталь была удалена из-за неактуальности
    delete_empty_kits: function (cart_data) {
        //перебираем все товары в корзине
        for (let id in cart_data) {
            let composition = cart_data[id].composition,
                empty_kit = true; //по умолчанию комплект пустой и входе проверки станет false если есть хоть одина отмечаеная деталь

            //проверяем все детали комплекта чтоб найти хоть одну отмеченую деталь
            for (let detal in composition) {
                let detal_data = composition[detal];

                //если нашли хоть одну отмеченую деталь то сразу помечаем что данный комплект не пустой и прерываем дальнейшие проверки для данного комплекта
                if (detal_data.add) {
                    empty_kit = false;
                    break;
                }
            }
            //проверяем все детали комплекта чтоб найти хоть одну отмеченую деталь

            if (empty_kit) delete cart_data[id]; //если комплект оказался пустым то удаляем его
        }
        //перебираем все товары в корзине
    },
    //ищем и удаляем пустые комплекты, они могли появится в следствии снятия у товара всех галочек, или после синхронизации с базой когда отмеченая деталь была удалена из-за неактуальности

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

    //ищем и помечаем полные комплекты для дальнейшей быстроты взаимодействия
    search_full_kits: function (cart_data) {
        //перебираем все товары в корзине
        for (let id in cart_data) {
            let composition = cart_data[id].composition,
                full_kit = true; //по умолчанию комплект полный и входе проверки станет false если есть хоть одина неотмечаеная деталь

            //проверяем все детали комплекта чтоб найти хоть одну неотмеченую деталь
            for (let detal in composition) {
                let detal_data = composition[detal];

                //если нашли хоть одну неотмеченую деталь то сразу помечаем что данный комплект не полный и прерываем дальнейшие проверки для данного комплекта
                if (!detal_data.add) {
                    full_kit = false;
                    break;
                }
            }
            //проверяем все детали комплекта чтоб найти хоть одну неотмеченую деталь

            if (full_kit) cart_data[id].is_full_kit = true; //если комплект оказался полныйм то помечаем его
        }
        //перебираем все товары в корзине
    },
    //ищем и помечаем полные комплекты для дальнейшей быстроты взаимодействия

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
                    marka_model: 'all@@all',
                    tools: true,
                    price: composition['tools'].price,
                };
            }
        }
        //перебираем все товары в корзине

        //мы ничего не возвращает т.к. мы изменяем переданный объект cart_data
    },
    //ищем товары которые являются просто инструментом без других плёнок

    //функция устанавливает статусы спойлера комплектации для каждого товара, на основе предидущих подготовленых данных, если токовые есть, если нет то по умолчанию закрывает все спойлеры, за исключеним случая когда товар один
    set_order_product_spoilers_status: function (cart_data) {
        let prev_order_data = GDS.order_product_data; //тут будут содержаться предидущие обработанные данные заказа в которых будет так же содержаться последние состояние спойлера товара до обновления корзины

        //перебираем все товары в корзине
        for (let id in cart_data) {
            let product_data = cart_data[id];

            //если уже был первый рендер заказа то мы могли открывать спойлеры так что для каждого товара записываем его статус спойлера, если он был только что добавлен то по умолчанию его спойлер закрыт
            if (prev_order_data?.[id]) {
                product_data.spoiler_hide = prev_order_data[id].spoiler_hide;
            } else {
                product_data.spoiler_hide = true; //если данный товар не обнаружен ранее обработаных данных или этих данных ещё нет то мы скрываем спойлер товара
            }
        }
        //перебираем все товары в корзине
    },
    //функция устанавливает статусы спойлера комплектации для каждого товара, на основе предидущих подготовленых данных, если токовые есть, если нет то по умолчанию закрывает все спойлеры, за исключеним случая когда товар один

    //чистим данные состава неполных комплектов от невыбраных деталей
    clean_not_activ_delals_in_kit_composition: function (cart_data) {
        //перебираем все товары в корзине
        for (let id in cart_data) {
            let product_data = cart_data[id];

            if (product_data.tools || product_data.is_full_kit) continue; //пропускаем полные комплекты и инструмент

            let composition = product_data.composition;

            //перебираем состав и удаляем не добавленый детали
            for (let detal in composition) {
                if (!composition[detal].add) delete composition[detal];
            }
            //перебираем состав и удаляем не добавленый детали
        }
        //перебираем все товары в корзине
    },
    //чистим данные состава неполных комплектов от невыбраных деталей

    //функция подготованивает данные из корзины для работы с заказом, удаляе пустые комплекты,генерируюя товары соло инструментов и объединяя дубликаты
    prepare_cart_data_for_order: function () {
        let cart_data = localStorage.getItem('cart-data'); //получаем данные из хранилища корзины

        if (!cart_data || cart_data == '{}') return {}; //если коризина пуста или несуществует то возвращаем пустой объект

        cart_data = JSON.parse(cart_data); //парсим данные

        //ВАЖНО не менять дале порядок вызова функций т.к. каждая берёт за основу результат предидущей !!!

        this.delete_empty_kits(cart_data); //ищем и удаляем пустые комплекты, они могли появится в следствии снятия у товара всех галочек, или после синхронизации с базой когда отмеченая деталь была удалена из-за неактуальности

        this.unite_dublicate_kits(cart_data); //ищем и объединяем одинаковые товары

        this.search_full_kits(cart_data); //ищем и помечаем полные комплекты для дальнейшей быстроты взаимодействия

        this.search_only_tools(cart_data); //ищем товары которые являются просто инструментом без других плёнок

        this.set_order_product_spoilers_status(cart_data); //функция устанавливает статусы спойлера комплектации для каждого товара, на основе предидущих подготовленых данных, если токовые есть, если нет то по умолчанию закрывает все спойлеры, за исключеним случая когда товар один

        this.clean_not_activ_delals_in_kit_composition(cart_data); //чистим данные состава неполных комплектов от невыбраных деталей

        GDS.order_product_data = cart_data; //записываем данные для дальнейшего быстрого доступа к ним при расчёт промокода, обновлении актуальных цен промокода и про отправке заказа

        return cart_data; ///возвращаем обработанные данные корзины
    },
    //функция подготованивает данные из корзины для работы с заказом, удаляе пустые комплекты,генерируюя товары соло инструментов и объединяя дубликаты

    //генерирует на основе данных из функции prepare_cart_data_for_order списко состоящий из уникальных товаров для дальнейшей передачи их на сервре или для быстрой проверки не превышен ли лимит 100 уникальных товаров
    get_unique_products_list: function () {
        let cart_data = this.prepare_cart_data_for_order(), //функция подготованивает данные из корзины для работы с заказом, удаляе пустые комплекты,генерируюя товары соло инструментов и объединяя дубликаты
            unique_products = {
                length: 0, //количество уникальных товаров
            }; //объект содержащий только уникальные товары

        //перебираем все товары
        for (let id in cart_data) {
            let product_data = cart_data[id]; //данные товара

            //если данный товар соло инструмен
            if (product_data.tools) {
                //если уже есть запись об инструментах
                if (unique_products['all@@all']?.tools) {
                    unique_products['all@@all'].tools.amount += product_data.amount; //просто увеличиваем количество штук
                }
                //если уже есть запись об инструментах

                //если записи нет то создаёем её с нуля
                else {
                    unique_products['all@@all'] = {
                        tools: {
                            amount: product_data.amount,
                            price: product_data.price, //цену записываем при создании т.к. она одинаковая у одинаковых товаров
                        },
                    };

                    unique_products.length += 1; //увеличиваем счётчик уникальных товаров
                }
                //если записи нет то создаёем её с нуля

                continue; //переходим к следующему товару
            }
            //если данный товар соло инструмен

            //если это полный комплект
            if (product_data.is_full_kit) {
                let marka_model = product_data.marka_model;

                if (!unique_products[marka_model]) unique_products[marka_model] = {}; //если для данной марки-модели ещё нет записи создаём её

                //composition['kit'] раньше точно не мог существовать, можно не проверять, т.к. ранее мы объединяли дыбликаты
                unique_products[marka_model]['kit'] = {
                    amount: product_data.amount,
                    price: product_data.price,
                };

                unique_products.length += 1; //увеличиваем счётчик уникальных товаров

                continue; //переходим к следующему товару
            }
            //если это полный комплект

            //если это неполная конфигурация
            let marka_model = product_data.marka_model,
                amount = product_data.amount,
                composition = product_data.composition;

            if (!unique_products[marka_model]) unique_products[marka_model] = {}; //если для данной марки-модели ещё нет записи создаём её

            for (let detal in composition) {
                let detal_data = composition[detal];

                //если деталь инструмент учитываем её отдельно
                if (detal == 'tools') {
                    //если уже есть запись об инструментах
                    if (unique_products['all@@all']?.tools) {
                        unique_products['all@@all'].tools.amount += amount; //просто увеличиваем количество штук
                    }
                    //если уже есть запись об инструментах

                    //если записи нет то создаёем её с нуля
                    else {
                        unique_products['all@@all'] = {
                            tools: {
                                amount: amount,
                                price: detal_data.price, //цену записываем при создании т.к. она одинаковая у одинаковых товаров
                            },
                        };

                        unique_products.length += 1; //увеличиваем счётчик уникальных товаров
                    }
                    //если записи нет то создаёем её с нуля

                    continue; //переходим к следующей детали
                }
                //если деталь инструмент учитываем её отдельно

                //если уже есть запись
                if (unique_products[marka_model][detal]) {
                    unique_products[marka_model][detal].amount += amount; //просто увеличиваем количество штук
                }
                //если уже есть запись

                //если это новый уникальный товар детали
                else {
                    unique_products[marka_model][detal] = {
                        amount: amount,
                        price: detal_data.price,
                    };

                    unique_products.length += 1; //увеличиваем счётчик уникальных товаров
                }
                //если это новый уникальный товар детали
            }
            //если это неполная конфигурация
        }
        //перебираем все товары

        return unique_products;
    },
    //генерирует на основе данных из функции prepare_cart_data_for_order списко состоящий из уникальных товаров для дальнейшей передачи их на сервре или для быстрой проверки не превышен ли лимит 100 уникальных товаров

    //рендерит один элемент товара в блоке заказа
    render_order_item: function (id, data, single_product_in_order) {
        let is_full_kit = data.is_full_kit, //проверяем полный ли комплект
            tools = data.tools, //проверяем является ли товар соло инструментом
            composition = data.composition, //состав данного товара
            amount = data.amount,
            //ВАЖНО: если товар в заказе всего один то мы раскрываем его в любом случае даже не смотря на то что пользователь ранее мог его скрывать
            spoiler_hide = single_product_in_order ? false : data.spoiler_hide, //состояние спойлера комплектации товара в заказе
            spoiler_toggle_button_class = spoiler_hide ? '' : ' order__product-toggle-composition--open',
            spoiler_toggle_button_text = spoiler_hide ? 'Состав комплекта' : 'Свернуть', //меняем поворот стрелочки у кнопки спойлера состава товара в зависимости от того один товар в заказе или нет
            spoiler_class = spoiler_hide ? ' spoiler-hidden' : '', //скрываем/показываем спойлер у товара
            spoilet_content_style = spoiler_hide ? '' : ' style="opacity:1;"', //если нужно показать спойлер делаем его контент видимым
            marka_model = data.marka_model,
            order_product_body = d.createElement('div'), //создаём элемент товара в заказе
            product_title = (()=>{
                if(is_full_kit) return 'Полный комплект защиты Brontero® '+ marka_model.replace('@@', ' ');
                if(tools) return 'Набор инструментов Brontero®';
                return 'Комплект частичной защиты Brontero®  '+ marka_model.replace('@@', ' ');
            })(),
            price = (() => {
                //сумма всех добавленых деталей или всего комплекта если он полный
                if (is_full_kit || tools) return data.price * amount; //если полный комплект или соло инструмент

                let result_price = 0;
                for (let detal in composition) {
                    if (composition[detal].add) result_price += composition[detal].price;
                }
                return result_price * amount;
            })();

        order_product_body.classList.add('order__product'); //добавляем класс элементу товара
        order_product_body.dataset.id = id; //записываем id товара чтоб можно было удобно сохранять статус его спойлера

        let content = `
            <div class="order__product-title">${product_title}</div>
            <div class="order__product-info">
                <div class="order__product-info-amount">${amount} шт</div>
                <div class="order__product-info-price">${price.toLocaleString('ru')} ₽</div>
            </div>
            <button class="order__product-toggle-composition set-min-interactive-size icon--arrow${spoiler_toggle_button_class}" disabled>${spoiler_toggle_button_text}</button>
            <div class="order__product-spoiler-wrap${spoiler_class}">
                <div class="order__product-spoiler-wrap-content"${spoilet_content_style}>`;
        //если это соло инструмент
        if (tools) {
            content += `<div class="order__product-spoiler-wrap-content-item icon--check-mark">${GDS.products_detal_types['tools']}</div>`;
        }
        //если это соло инструмент

        //если это полный или частичный комплект
        else {
            for (let detal in composition) {
                content += `<div class="order__product-spoiler-wrap-content-item icon--check-mark">${GDS.products_detal_types[detal]}</div>`; //вставляем только добавленые в состав детали
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
        //скрываем блоки сообщений т.к. они могли быть видны
        this.order_info_block_hide(this.order_zero_cart_price_message);
        this.order_info_block_hide(this.order_empty_cart_message);

        let cart_data = JSON.parse(localStorage.getItem('cart-data')), //получаем данные из хранилища корзины и парсим их
            cart_total_amount = this.get_amount_complects_in_cart(),
            cart_total_amount_area_postfix = this.get_amount_postfix(cart_total_amount),
            common_price = this.calculate_common_order_prise();

        //если корзина пуста или ещё не существует
        if (!cart_data || Object.keys(cart_data).length == 0) {
            this.you_order_wrap.dispatchEvent(empty_order); //вызываем событие сообщающие что при попытке рендера заказа обнаружена пустая корзина

            this.order_info_block_show(this.order_empty_cart_message); //если корзина пуста или ещё не существует показываем сообщение и заверашем функцию
            return;
        }
        //если корзина пуста или ещё не существует

        //если цена товаров в корзине равна нулю
        if (common_price == 0) {
            this.you_order_wrap.dispatchEvent(zero_cart_price); //вызываем событие сообщающие что при попытке рендера заказа обнаружена нулевая цена товаров в корзине

            this.order_info_block_show(this.order_zero_cart_price_message); //если цена товаров в корзине равна нулю показываем сообщение и заверашем функцию
            return;
        }
        //если цена товаров в корзине равна нулю

        this.order_product_amount_area.textContent = cart_total_amount; //записываем количество комплектов в поле

        this.set_amount_area_postfix(cart_total_amount_area_postfix); //функция добавляет нужный текст к полю с количеством комплектов чтоб словко комплек читалось логично

        this.order_common_price_area.textContent = common_price.toLocaleString('ru') + ' ₽'; //получаем общую цену товаров в корзине и записывает её в поле для финальной цены

        cart_data = this.prepare_cart_data_for_order(); //функция подготованивает данные из корзины для работы с заказом, удаляе пустые комплекты,генерируюя товары соло инструментов и объединяя дубликаты

        let wrap = d.createDocumentFragment(), //создаём оболочку в которую будем вставлять все отрендереные товары
            single_product_in_order = Object.keys(cart_data).length == 1; //определяет один товар в заказе или нет

        //рендерим каждый товар
        for (let id in cart_data) {
            wrap.append(this.render_order_item(id, cart_data[id], single_product_in_order));
        }
        //рендерим каждый товар

        this.order_spoiler_content.append(wrap); //вставляем результат в блок заказа

        this.you_order_wrap.dispatchEvent(rerender_order_list_event); //вызываем событие сообщающие что блок заказа перерендерился, что в свою очерез вызовет срабатывае функций которое следять за этим событием
    },
    //рендерит блок заказа с нуля
};
