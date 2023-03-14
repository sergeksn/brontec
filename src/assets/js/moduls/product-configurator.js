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

        this.price_area.textContent = result_price.toLocaleString('ru');
    },
    //функция полчует и записывает сумму всех отмеченых чекбоксов

    //запускает конфигуратор с сохранённыеми настройками
    init_configurator_fom_saved_settings: function () {
        this.kit_composition_info = JSON.parse(localStorage.getItem('kits-composition-info'))?.[GDS.product.marka_model]; /*пытаемся получить состяние активных деталей для данного комплекта*/

        if (!this.kit_composition_info) return this.get_checked_inputs_sum_price(); //если для данного товара ещё нет никаких данных о выдилении, т.е. данная страница товар открыта впрервые и этого товара так же не может быть в корзине, так что мы просто высчитываем и записываем сумму по умолчанию выденых чекбоксов

        this.configurator = qs('.komplekt-2-select-kit-composition'); //блок с конфигуратором на странице комплекта
        this.price_area = qs('.komplekt-2-select-kit-composition .komplekt-configurator__full-wrap-composition-price-current');
        this.all_inputs = qsa('.komplekt-2-select-kit-composition input'); //все инпуты в конфигураторе
        this.button_add_full_kit = qs('.komplekt-1-full-kit .komplekt-configurator__full-wrap-composition-button'); //кнопка для добавления комплекта полностью
        this.button_add_configuration_kit = qs('.komplekt-2-select-kit-composition .komplekt-configurator__full-wrap-composition-button'); //кнопка для добавленяи в корзину сконфигурированного из частей комплекта

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
        this.configurator.classList.remove('komplekt-2-select-kit-composition--selected-all-kit');
        this.configurator.classList.remove('komplekt-2-select-kit-composition--nothing-selected');

        /*првоеряем полностью ли выделен или не выделено ни одного чекбокса а так же записываем цену для текущей конфигурации*/
        if ([...this.all_inputs].every(input => input.checked)) {
            /*выделен весь комплект*/
            this.configurator.classList.add('komplekt-2-select-kit-composition--selected-all-kit');
            this.price_area.textContent = GDS.product.price.toLocaleString('ru');
        } else if ([...this.all_inputs].every(input => !input.checked)) {
            /*ничего не выделено*/
            this.configurator.classList.add('komplekt-2-select-kit-composition--nothing-selected');
            this.price_area.textContent = 0;
        } else {
            /*выделены отдельные чекбоксы*/
            this.get_checked_inputs_sum_price();
        }
    },
    //функция задёт цену для текущей конфигурации и если ничего не выделено блокирыет кнопку конфигуроатора

    //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
    //данная функция должна вызываться при каждом нажатии на кнопки добавить в корзину и смене чекбоксов, она проверяет текущкю комплектацию и уже существующие комплектации в корзине, если находит совпадения то меняет состояние кнопки и кнопка будет сразу перекидыватьв  корзину на данный комплект
    check_cart_composition_and_edit_buttons_action: function () {
        let cart_data = localStorage.getItem('cart-data'); //пытаемся получить данные комплектов в корзине

        //ВАЖНО: || cart_data === '{}' не использовать тут так как нам нужно выполять функцию и при пустой корзине чтоб менять кнопки так что главное условие чтоб корзина просто существовала в хранилище
        if (!cart_data) return; //если данные корзины несуществуют прерываем проверки

        cart_data = JSON.parse(cart_data); //превращаяем в объект

        if (!this.button_add_full_kit) return; //так же прерываем если мы не на странице полного комплекта

        let button_add_full_kit = this.button_add_full_kit,
            button_add_configuration_kit = this.button_add_configuration_kit,
            composition = GDS.product.composition, //состав текущего комплекта
            check_add_status = (detal, full_kit) => {
                //функция помечает какие делали в конфигурации данного комплекта выбраны
                if (full_kit) return true; //если это полный комплект то выбраны все детали комплекта

                let target_input = [...this.all_inputs].find(el => el.id === detal + '-checkbox'); //проверяем соответсвующие чекбоксы деталей и если они активны то помечаем что данная деталь добавлена

                return target_input.checked;
            },
            generate_kit_composition = full_kit => {
                //функция генерирует строку с текущей конфигурацией комплекта на основе чекбоксов или пометки полного комплекта
                let result = '';

                //перебираем все детали комплекта
                for (let detal in composition) {
                    result += `"${detal}":{"price":${composition[detal]},"add":${check_add_status(detal, full_kit)}},`;
                }
                //перебираем все детали комплекта

                return result.slice(0, -1); //удаляет запятую после последней детали
            },
            full_kit_searched_cart_data = `{"marka_model":"${GDS.product.marka_model}","price":${GDS.product.price},"full_price":${GDS.product.full_price},"composition":{${generate_kit_composition(true)}}}`, //строка для поиска полного комплекта в корзине
            configurator_kit_searched_cart_data = `{"marka_model":"${GDS.product.marka_model}","price":${GDS.product.price},"full_price":${GDS.product.full_price},"composition":{${generate_kit_composition(false)}}}`, //строка для поиска комплектации из конфигуратора в корзине
            searched_fo_configuration = false, //указывает нашли ли мы совпадение конфигуратора с товаром в корзине
            searched_fo_full_kit = false; //указывает нашли ли мы совпадение полного комплекта с товаром в корзине

        //перебираем все товары в корзине
        for (let item in cart_data) {
            let carent_string = JSON.stringify(cart_data[item])
                .replace(/"amount":\d+,/, '')
                .replace(/"spoiler_hide":[^,]+,/, ''); //получаем строку очещеную от количества и статуса спойлер состава чтоб корректно стравнить

            //если текущий товар полностью соответствует полному комплекту на данную машину то мы меняем функцию кнопки
            if (carent_string === full_kit_searched_cart_data) {
                button_add_full_kit.dataset.inCart = 'yes';
                button_add_full_kit.dataset.productCartId = item; //пометка какой комплект фокусировать после открытия корзины
                searched_fo_full_kit = true;
            }

            //если текущий товар полностью соответствует конфигурации комплекта из конфигуратора то меняем функцию кнопки
            if (carent_string === configurator_kit_searched_cart_data) {
                button_add_configuration_kit.dataset.inCart = 'yes';
                button_add_configuration_kit.dataset.productCartId = item; //пометка какой комплект фокусировать после открытия корзины
                searched_fo_configuration = true;
            }
        }
        //перебираем все товары в корзине

        //проверяем если не нашли совпадений то меняем функции соответствующих кнопок
        if (!searched_fo_configuration) {
            button_add_configuration_kit.removeAttribute('data-in-cart');
            button_add_configuration_kit.removeAttribute('data-product-cart-id');
        }

        if (!searched_fo_full_kit) {
            button_add_full_kit.removeAttribute('data-in-cart');
            button_add_full_kit.removeAttribute('data-product-cart-id');
        }
        //проверяем если не нашли совпадений то меняем функции соответствующих кнопок
    },
    //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
};
