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

        //они должны быть тут чтоб при вызове функций при изначально пустой корзине они были определены
        this.price_area = qs('.komplekt-2-select-kit-composition .komplekt-configurator__full-wrap-composition-price-current');
        this.all_inputs = qsa('.komplekt-2-select-kit-composition input'); //все инпуты в конфигураторе
        this.configurator = qs('.komplekt-2-select-kit-composition'); //блок с конфигуратором на странице комплекта
        this.button_add_full_kit = qs('.komplekt-1-full-kit .komplekt-configurator__full-wrap-composition-button'); //кнопка для добавления комплекта полностью
        this.button_add_configuration_kit = qs('.komplekt-2-select-kit-composition .komplekt-configurator__full-wrap-composition-button'); //кнопка для добавленяи в корзину сконфигурированного из частей комплекта

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
            //функция проверяет есть ли полный комплект данного товара или текущая конфигурация в корзине
            searched = full_kit => {
                //перебираем все товары в хранилище корзины
                for (let item in cart_data) {
                    let data = cart_data[item], //данные товара
                        composition = data.composition; //состав товара

                    //если данный товар соответствует марке комплекта на текущей странице комплекта
                    if (data.marka_model == GDS.product.marka_model) {
                        let detected = true; //пометка отвечающая был ли онарущен пльностью подходящий товар

                        //перебираем все детали данного найденого в хранилище корзины товара
                        for (let detal in composition) {
                            let target_input = [...this.all_inputs].find(el => el.id === detal + '-checkbox'), //проверяем соответсвующие чекбоксы деталей и если они активны то помечаем что данная деталь добавлена
                                checked_status = full_kit ? true : target_input.checked; //какой статус у инпутов сейчас

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
                            if (full_kit) {
                                searched_fo_full_kit = detected;
                            } else {
                                searched_fo_configuration = detected;
                            }
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
            searched_fo_configuration = false, //указывает нашли ли мы совпадение конфигуратора с товаром в корзине
            searched_fo_full_kit = false, //указывает нашли ли мы совпадение полного комплекта с товаром в корзине
            button_add_full_kit_product_id = searched(true), //id товара в хранилище корзины для полного комплекта
            button_add_configuration_kit_product_id = searched(); //id товара в хранилище корзины для текущей конфигурации

        //если текущий товар полностью соответствует полному комплекту на данную машину то мы меняем функцию кнопки
        if (searched_fo_full_kit) {
            button_add_full_kit.dataset.inCart = 'yes';
            button_add_full_kit.dataset.productCartId = button_add_full_kit_product_id; //пометка какой комплект фокусировать после открытия корзины
        }
        //если текущий товар полностью соответствует полному комплекту на данную машину то мы меняем функцию кнопки

        //проверяем если не нашли совпадений то меняем функции соответствующих кнопок
        else {
            button_add_full_kit.removeAttribute('data-in-cart');
            button_add_full_kit.removeAttribute('data-product-cart-id');
        }
        //проверяем если не нашли совпадений то меняем функции соответствующих кнопок

        //если текущий товар полностью соответствует конфигурации комплекта из конфигуратора то меняем функцию кнопки
        if (searched_fo_configuration) {
            button_add_configuration_kit.dataset.inCart = 'yes';
            button_add_configuration_kit.dataset.productCartId = button_add_configuration_kit_product_id; //пометка какой комплект фокусировать после открытия корзины
        }
        //если текущий товар полностью соответствует конфигурации комплекта из конфигуратора то меняем функцию кнопки

        //проверяем если не нашли совпадений то меняем функции соответствующих кнопок
        else {
            button_add_configuration_kit.removeAttribute('data-in-cart');
            button_add_configuration_kit.removeAttribute('data-product-cart-id');
        }
        //проверяем если не нашли совпадений то меняем функции соответствующих кнопок
    },
    //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
};
