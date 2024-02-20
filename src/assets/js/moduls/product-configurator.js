w.ksn_product_configurator_func = {
    //функция отметает чекбокс и выделяет svg деталь на странице детали комплекта в момент загрузки
    chenge_single_detal_checkbox_and_svg: function () {
        let detal_info = JSON.parse(localStorage.getItem('kits-composition-info'))?.[GDS.product.marka_model].includes(GDS.product.detal); /*пытаемся получить состяние данной детали из комплекта*/

        if (detal_info) {
            let target_input = qs('#' + GDS.product.detal + '-checkbox'),
                target_obj = qs('#' + GDS.product.detal);

            if (target_input) target_input.checked = true;
            if (target_obj) target_obj.setAttribute('data-active', '');
        }
    },
    //функция отметает чекбокс и выделяет svg деталь на странице детали комплекта в момент загрузки

    //функция полчует и записывает сумму всех отмеченых чекбоксов
    get_checked_inputs_sum_price: function () {
        let result_price = 0;
        this.all_inputs.forEach(input => {
            if (input.checked) {
                let id = input.id.replace('-checkbox', '');
                result_price += GDS.product.composition[id];
            }
        });

        this.price_area.textContent = result_price.toLocaleString('ru') + ' ₽';
    },
    //функция полчует и записывает сумму всех отмеченых чекбоксов

    //запускает конфигуратор с сохранённыеми настройками
    init_configurator_fom_saved_settings: function () {
        this.kit_composition_info = JSON.parse(localStorage.getItem('kits-composition-info'))?.[GDS.product.marka_model]; /*пытаемся получить состяние активных деталей для данного комплекта*/

        //они должны быть тут чтоб при вызове функций при изначально пустой корзине они были определены
        this.price_area = qs('.komplekt-configurator .komplekt-configurator__wrap-composition-price-current');
        this.all_inputs = qsa('.komplekt-configurator input'); //все инпуты в конфигураторе
        this.configurator = qs('.komplekt-configurator'); //блок с конфигуратором на странице комплекта

        if (!this.kit_composition_info) return this.get_checked_inputs_sum_price(); //если для данного товара ещё нет никаких данных о выдилении, т.е. данная страница товар открыта впрервые и этого товара так же не может быть в корзине, так что мы просто высчитываем и записываем сумму по умолчанию выденых чекбоксов

        this.active_neaded_svg_and_checkbox(); //отмечаем нужные svg и чекбокс
        this.set_configurator_price_and_status(); //функция задёт цену для текущей конфигурации и если ничего не выделено блокирыет кнопку конфигуроатора
        this.check_cart_composition_and_edit_buttons_action(); //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
    },
    //запускает конфигуратор с сохранённыеми настройками

    //отмечаем нужные svg и чекбокс
    active_neaded_svg_and_checkbox: function () {
        this.all_inputs.forEach(input => (input.checked = false)); /*убираем выделение у всех инпутов*/
        qsa('object', this.configurator).forEach(obj => obj.removeAttribute('data-active')); /*убираем выделение у всех svg*/

        /*для каждой активной детали мы выделяем инпут и svg*/
        this.kit_composition_info.forEach(item => {
            let target_input = qs('#' + item + '-checkbox'),
                target_obj = qs('#' + item);

            if (target_input) target_input.checked = true;
            if (target_obj) target_obj.setAttribute('data-active', '');
        });
        /*для каждой активной детали мы выделяем инпут и svg*/
    },
    //отмечаем нужные svg и чекбокс

    //функция задёт цену для текущей конфигурации и если ничего не выделено блокирыет кнопку конфигуроатора
    set_configurator_price_and_status: function () {
        //убираем классы если они были
        this.configurator.classList.remove('komplekt-configurator--selected-all-kit');
        this.configurator.classList.remove('komplekt-configurator--nothing-selected');

        /*првоеряем полностью ли выделен или не выделено ни одного чекбокса а так же записываем цену для текущей конфигурации*/
        if ([...this.all_inputs].every(input => input.checked)) {
            /*выделен весь комплект*/
            this.configurator.classList.add('komplekt-configurator--selected-all-kit');
            this.price_area.textContent = GDS.product.price.toLocaleString('ru') + ' ₽';
        } else if ([...this.all_inputs].every(input => !input.checked)) {
            /*ничего не выделено*/
            this.configurator.classList.add('komplekt-configurator--nothing-selected');
            this.price_area.textContent = 0 + ' ₽';
        } else {
            /*выделены отдельные чекбоксы*/
            this.get_checked_inputs_sum_price();
        }
    },
    //функция задёт цену для текущей конфигурации и если ничего не выделено блокирыет кнопку конфигуроатора

    //функция проверяет есть ли полный комплект данного товара или текущая конфигурация в корзине
    searched_in_cart_storage(full_kit) {
        let cart_data = localStorage.getItem('cart-data'); //пытаемся получить данные комплектов в корзине

        //ВАЖНО: || cart_data === '{}' не использовать тут так как нам нужно выполять функцию и при пустой корзине чтоб менять кнопки так что главное условие чтоб корзина просто существовала в хранилище
        if (!cart_data) return; //если данные корзины несуществуют прерываем проверки

        cart_data = JSON.parse(cart_data); //превращаяем в объект

        //перебираем все товары в хранилище корзины
        for (let item in cart_data) {
            let data = cart_data[item], //данные товара
                composition = data.composition; //состав товара

            //если данный товар соответствует марке комплекта на текущей странице комплекта
            if (data.marka_model == GDS.product.marka_model) {
                let detected = true; //пометка отвечающая был ли онарущен пльностью подходящий товар

                //перебираем все детали данного найденого в хранилище корзины товара
                for (let detal in composition) {
                    let checked_status;

                    //на случай когда скрипт вызван до определения инпутов т.е. в более раннем месте в DOM
                    if (this.all_inputs) {
                        let target_input = [...this.all_inputs].find(el => el.id === detal + '-checkbox'); //проверяем соответсвующие чекбоксы деталей и если они активны то помечаем что данная деталь добавлена

                        if (!target_input) continue; //если не нали инпут для данной детали пропускаем её, такое может произойти если корзина толкьо что обновилась после синхронизации с базой но на странице её не обновлены чекбоксы

                        checked_status = full_kit ? true : target_input.checked; //какой статус у инпутов сейчас
                    } else {
                        checked_status = full_kit;
                    }
                    //на случай когда скрипт вызван до определения инпутов т.е. в более раннем месте в DOM

                    //если хоть один инпут не соответствует данным товара из корзины то мы его прекращаем проверять помечая что он не подошёл
                    if (checked_status !== composition[detal].add) {
                        detected = false;
                        break;
                    }
                    //если хоть один инпут не соответствует данным товара из корзины то мы его прекращаем проверять помечая что он не подошёл
                }
                //перебираем все детали данного найденого в хранилище корзины товара

                //если мы обнаружили совпадение помечаем для чего именно нашли совпадение и завершаем проверку
                if (detected) {
                    return item; //возвращаем функцией id найденого товара для текущего типа поиска
                }
                //если мы обнаружили совпадение помечаем для чего именно нашли совпадение и завершаем проверку
            }
            //если данный товар соответствует марке комплекта на текущей странице комплекта
        }
        //перебираем все товары в хранилище корзины

        return false; //если него не нашли
    },
    //функция проверяет есть ли полный комплект данного товара или текущая конфигурация в корзине

    //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
    //данная функция должна вызываться при каждом нажатии на кнопки добавить в корзину и смене чекбоксов, она проверяет текущкю комплектацию и уже существующие комплектации в корзине, если находит совпадения то меняет состояние кнопки и кнопка будет сразу перекидыватьв  корзину на данный комплект
    check_cart_composition_and_edit_buttons_action: function () {
        if (!qs('.komplekt-1')) return; //если мы не на странице комплекта прерываем

        let top_block_button_add_full_kit = this.top_block_button_add_full_kit ?? qs('.komplekt-1__info-buttons-to-cart'),
            button_add_configuration_kit = this.button_add_configuration_kit ?? qs('.komplekt-configurator__wrap-composition-button'), //кнопка для добавленяи в корзину сконфигурированного из частей комплекта
            bottom_block_button_add_full_kit = this.bottom_block_button_add_full_kit ?? qs('.komplekt-10__wrap-composition-button'),
            full_kit_product_id = this.searched_in_cart_storage(true), //id товара в хранилище корзины для полного комплекта
            configuration_kit_product_id = this.searched_in_cart_storage(); //id товара в хранилище корзины для текущей конфигурации

        [top_block_button_add_full_kit, bottom_block_button_add_full_kit].forEach(button => {
            if (!button) return; //пропускаем если кнопка ещё не найдена

            button.dataset.inCart = full_kit_product_id ? 'yes' : 'no';
            button.dataset.productCartId = full_kit_product_id ?? null;
            button.textContent = full_kit_product_id ? 'Комплект в корзине →' : 'Купить полный комплект';
        });

        if (!button_add_configuration_kit) return; //пропускаем если кнопка ещё не найдена

        button_add_configuration_kit.dataset.inCart = configuration_kit_product_id ? 'yes' : 'no';
        button_add_configuration_kit.dataset.productCartId = configuration_kit_product_id ?? null;
        button_add_configuration_kit.textContent = configuration_kit_product_id ? 'Комплект в корзине →' : 'Добавить в корзину';
    },
    //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
};
