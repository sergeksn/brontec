import { set_localStorage } from '@js-libs/func-kit';
//ПРИМЕЧАНИЕ: разделитель вида @@ между маркой и моделью сделан что точно отделить марку от модели т.к. марака или модель может состоять из двух слов, а не одного, а так мы точно их разделим

let CONFIGURATOR_CONTROLLER = {
    //функция проверяет все инпуты и опираясь на их активность подсвечивает соответствующие детали
    update_template_svg_configuration: function () {
        this.all_inputs.forEach(input => {
            let is_checked_input = input.checked,
                svg_position = input.getAttribute('data-position'), //получаем какая позиция у svg привязанной к данному инпуту
                svg_id = input.id.replace('-checkbox', ''), //получаем id svg для данного инпута
                target_svg; //тут будет записана найденая svg

            //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
            if (svg_position === 'front') {
                target_svg = qs('[data-front] #' + svg_id, this.configurator); //находим нужную svg
                is_checked_input ? target_svg.setAttribute('data-active', '') : target_svg.removeAttribute('data-active'); //добавляем/удаляем атрибут
            }
            //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции

            //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
            if (svg_position === 'back') {
                target_svg = qs('[data-back] #' + svg_id, this.configurator); //находим нужную svg
                is_checked_input ? target_svg.setAttribute('data-active', '') : target_svg.removeAttribute('data-active'); //добавляем/удаляем атрибут
            }
            //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
        });
    },
    //функция проверяет все инпуты и опираясь на их активность подсвечивает соответствующие детали

    //запускаем проверку готовности наборов svg картинок дял каждой ориентации
    check_load_dependency_imges: function () {
        let front_svg_wrap = qs('[data-front] [data-img-type="svg-kit-items"]', this.configurator), //оболочка набора картинок svg для комплекта вид спереди
            back_svg_wrap = qs('[data-back] [data-img-type="svg-kit-items"]', this.configurator); //оболочка набора картинок svg для комплекта вид сзади

        //если есть набор для данной ориентации
        if (front_svg_wrap) {
            //если набор ещё не загружен
            if (!front_svg_wrap.classList.contains('svg-kit-uploaded')) {
                //дожидаемся загрузки набора и помечаем что он загружен
                front_svg_wrap._on('svg-kit-loaded', () => {
                    this.front_svg_complete = true;
                    //нужно т.к. мы можем нажимать на инпуты до загрузки svg комплектов и после их загрузки нужно ещё раз всё проверить чтоб удостоверится что все выделено правильно
                    this.update_template_svg_configuration(); //функция проверяет все инпуты и опираясь на их активность подсвечивает соответствующие детали
                });
                //дожидаемся загрузки набора и помечаем что он загружен
            }
            //если набор ещё не загружен

            //если набор ещё уже загружен
            else {
                this.front_svg_complete = true; //помечаем что набор загружен
            }
            //если набор ещё уже загружен
        }
        //если есть набор для данной ориентации

        //если есть набор для данной ориентации
        if (back_svg_wrap) {
            //если набор ещё не загружен
            if (!back_svg_wrap.classList.contains('svg-kit-uploaded')) {
                //дожидаемся загрузки набора и помечаем что он загружен
                back_svg_wrap._on('svg-kit-loaded', () => {
                    this.back_svg_complete = true;
                    //нужно т.к. мы можем нажимать на инпуты до загрузки svg комплектов и после их загрузки нужно ещё раз всё проверить чтоб удостоверится что все выделено правильно
                    this.update_template_svg_configuration(); //функция проверяет все инпуты и опираясь на их активность подсвечивает соответствующие детали
                });
                //дожидаемся загрузки набора и помечаем что он загружен
            }
            //если набор ещё не загружен

            //если набор ещё уже загружен
            else {
                this.back_svg_complete = true; //помечаем что набор загружен
            }
            //если набор ещё уже загружен
        }
        //если есть набор для данной ориентации
    },
    //запускаем проверку готовности наборов svg картинок дял каждой ориентации

    //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен
    konfigurator_input_state_chenge: function (input) {
        this.local_starage_write_data(); //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов
        this.toggle_svg_active_status(input); //меняет заливку svg детали связанной с данным инпутом
        this.check_selected_all_kit_detals(); //проверяет если все детали комплекта выбраны то нужно показать скидку и полную цену
    },
    //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен

    //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен на странице детали
    konfigurator_single_detal_input_state_chenge: function (input) {
        this.local_starage_write_or_chenge_single_detal_data(input); //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов для страницы детали
        this.toggle_svg_active_status(input); //меняет заливку svg детали связанной с данным инпутом
    },
    //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен на странице детали

    //проверяет если все детали комплекта выбраны то нужно показать скидку и полную цену
    check_selected_all_kit_detals: function () {
        //убираем классы если они были
        this.configurator.classList.remove('komplekt-2-select-kit-composition--selected-all-kit');
        this.configurator.classList.remove('komplekt-2-select-kit-composition--nothing-selected');

        //если отмечены все инпуты пкоазываем скидку и полную цену с ценой по скидке
        if ([...this.all_inputs].every(input => input.checked)) {
            this.configurator.classList.add('komplekt-2-select-kit-composition--selected-all-kit');
            this.price_area.textContent = GDS.product.price.toLocaleString('ru');
        }
        //если отмечены все инпуты пкоазываем скидку и полную цену с ценой по скидке

        //если не отмечен ни один инпут то делаем кнопку неактивной ВИЗУАЛЬНО меняем цвета чекбоксов, выводим предупреждающий текст и ставим цену в 0 руб
        else if ([...this.all_inputs].every(input => !input.checked)) {
            this.configurator.classList.add('komplekt-2-select-kit-composition--nothing-selected');
            this.price_area.textContent = 0;
        }
        //если не отмечен ни один инпут то делаем кнопку неактивной ВИЗУАЛЬНО меняем цвета чекбоксов, выводим предупреждающий текст и ставим цену в 0 руб

        //если просто отмечены какие-то инпуты, но не все
        else {
            let result_price = 0;

            //получаем цену для каждой активныой детали и формируем из их суммы цены для текущей конфигурации комплекта
            this.all_inputs.forEach(input => {
                if (input.checked) {
                    let id = input.id.replace('-checkbox', '');
                    result_price += GDS.product.composition[id];
                }
            });

            this.price_area.textContent = result_price.toLocaleString('ru');
        }
        //если просто отмечены какие-то инпуты, но не все
    },
    //проверяет если все детали комплекта выбраны то нужно показать скидку и полную цену

    //меняет заливку svg детали связанной с данным инпутом
    toggle_svg_active_status: function (input) {
        let svg_position = input.getAttribute('data-position'), //получаем какая позиция у svg привязанной к данному инпуту
            svg_id = input.id.replace('-checkbox', ''), //получаем id svg для данного инпута
            target_svg; //тут будет записана найденая svg

        //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
        if (svg_position === 'front' && this.front_svg_complete) {
            target_svg = qs('[data-front] #' + svg_id, this.configurator); //находим нужную svg
            target_svg.toggleAttribute('data-active'); //добавляем/удаляем атрибут
        }
        //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции

        //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
        if (svg_position === 'back' && this.back_svg_complete) {
            target_svg = qs('[data-back] #' + svg_id, this.configurator); //находим нужную svg
            target_svg.toggleAttribute('data-active'); //добавляем/удаляем атрибут
        }
        //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
    },
    //меняет заливку svg детали связанной с данным инпутом

    //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов для страницы детали
    local_starage_write_or_chenge_single_detal_data: function (input) {
        let kits_composition_info = JSON.parse(localStorage.getItem('kits-composition-info')), //пытаемся получить данные из локально хранилища с данными о выбраных пользователем составах комплектов
            data,
            id = input.id.replace('-checkbox', '');

        //если есть какие-то записи о состоянии комплектов
        if (kits_composition_info && Object.keys(kits_composition_info).length != 0) {
            data = kits_composition_info;

            //если есть запись для данного комплекта
            if (data[GDS.product.marka_model]) {
                let searched_index, //сюда будет записан индекс найденого элемента
                    searched = data[GDS.product.marka_model].find((el, index) => {
                        if (el === id) {
                            searched_index = index;
                            return true;
                        }
                    }); //пытаемся найти текущую деталь активной в данных комплекта

                //если нашли
                if (searched) {
                    if (!input.checked) data[GDS.product.marka_model].splice(searched_index, 1); //если нашли но инпут не активен то удаляем данную деталь из данных комплекта в хранилище
                }
                //если нашли

                //если не нашли
                else {
                    if (input.checked) data[GDS.product.marka_model].push(id); //если инпут активен записываем его
                }
                //если не нашли
            }
            //если есть запись для данного комплекта

            //если для данного комплекта ещё нет записей
            else {
                if (input.checked) data[GDS.product.marka_model] = [id, 'tools']; //создаём свойство с ms-id нашего комплекта и записью id нашей детали если она была отмечена, так же по умолчанию отмечаем ещё и инструмент
            }
            //если для данного комплекта ещё нет записей
        }
        //если есть какие-то записи о состоянии комплектов

        //если нет никаких данных
        else {
            data = {};
            if (input.checked) data[GDS.product.marka_model] = [id, 'tools']; //создаём свойство с ms-id нашего комплекта и записью id нашей детали если она была отмечена, так же по умолчанию отмечаем ещё и инструмент
        }
        //если нет никаких данных

        set_localStorage('kits-composition-info', JSON.stringify(data)); //записываем данные в локальное хранилище
    },
    //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов для страницы детали

    //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов
    local_starage_write_data: function () {
        let kits_composition_info = JSON.parse(localStorage.getItem('kits-composition-info')), //пытаемся получить данные из локально хранилища с данными о выбраных пользователем составах комплектов
            data,
            active_checkboxes = [];

        //если были какие-то данные о составе комплектов
        if (kits_composition_info && Object.keys(kits_composition_info).length != 0) {
            data = kits_composition_info; //берём данные из хранилища
        }
        //если были какие-то данные о составе комплектов

        //если ещё ничего не записано
        else {
            data = {}; //создаём новый пустой объект для того чтоб записать в него первые данные
            set_localStorage('kits-composition-last-update', new Date().getTime()); //записываем текущее время как дату последнего обновления
        }
        //если ещё ничего не записано

        //перебираем все инпуты и те которые активные записываем в массив их id без постфикса -checkbox
        this.all_inputs.forEach(input => {
            if (input.checked) active_checkboxes.push(input.id.replace('-checkbox', ''));
        });
        //перебираем все инпуты и те которые активные записываем в массив их id без постфикса -checkbox

        //ПРИМЕЧАНИЕ: тут я могу использовать просто типы активных деталей т.к. тут не критично уникальный ms-id, даже если мы вдруг удалим деталь фар а потом создадим их то мы так же оставим их тут выделеными, а вот для корзины уже важно наличие уникального  ms-id

        data[GDS.product.marka_model] = active_checkboxes; //записываем для данного комплекта активные детали

        set_localStorage('kits-composition-info', JSON.stringify(data)); //записываем обновлённые данные в хранилище
    },
    //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов

    //отправляет запрос на сервер каждый понедельник для проверки актуальности выделенных чекбоксов для каждого комплекта, на случай если буду удаляться или обновлятсяся составы комплектов и чтоб у пользователя не оставалось в локальном хранилище не нужно инфы по удалённым комплектам
    // send_data_on_server_for_check: async function () {
    //     let interval = 10 * 24 * 60 * 60 * 1000, //временной интервал в милисекундах длительностью 10 дней
    //         time_is_now = new Date().getTime(), //текущее время
    //         last_check = localStorage.getItem('kits-composition-last-update'); //дата последнего обновления

    //     if (time_is_now - last_check < interval) return; //если с последнего обновления ещё не прошло 10 дней прерываем запрос на проверку актуальности данных

    //     let request_data = {
    //         //запрос на сервер
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json;charset=utf-8' },
    //         body: JSON.stringify({
    //             action: 'check_actual_kits_composition_checkbox_info',
    //             data: localStorage.getItem('kits-composition-info'),
    //         }),
    //     };

    //     //отправляем запрос на сервер что отправить сообщение и выводим соответсвующие всплывающие окна
    //     await fetch(GDS.ajax_url, request_data)
    //         .then(response => response.json()) //считываем переданные данные
    //         .then(result => {
    //             //если переданы какие-то комплекты для обновления
    //             if (result.length > 0) {
    //                 let current_data = JSON.parse(localStorage.getItem('kits-composition-info')); //получаем текущие данные активныех деталей комплектов

    //                 //перебираем все комплекты которые нужно обновить
    //                 result.forEach(item => {
    //                     for (let marka_model in item) {
    //                         current_data[marka_model] = item[marka_model]; //обнволяем для текущего комплекта его активные детали которые есть в базе
    //                     }
    //                 });
    //                 //перебираем все комплекты которые нужно обновить

    //                 set_localStorage('kits-composition-info', JSON.stringify(current_data)); //обновляем данные
    //             }
    //             //если переданы какие-то комплекты для обновления

    //             set_localStorage('kits-composition-last-update', new Date().getTime()); //записываем текущее время как дату последнего обновления
    //         })
    //         .catch(e => {});
    // },
    //отправляет запрос на сервер каждый понедельник для проверки актуальности выделенных чекбоксов для каждого комплекта, на случай если буду удаляться или обновлятсяся составы комплектов и чтоб у пользователя не оставалось в локальном хранилище не нужно инфы по удалённым комплектам

    //меяняет значение счётчиков корзины в хедере и в самой корзине
    chenge_cart_counters: function(){
        let cart_data = localStorage.getItem('cart');
    },
    //меяняет значение счётчиков корзины в хедере и в самой корзине

    //срабатывает при клике на кнопку кобавить полный комплект
    add_full_kit_in_cart: function(){
        this.chenge_cart_counters();
    },
    //срабатывает при клике на кнопку кобавить полный комплект

    init: async function () {
        let kit_komplekt_configurator = qs('.komplekt-2-select-kit-composition'),
            detal_komplekt_configurator = qs('.detal-1-add-to-kit'), //блок с конфигуратором на странице комплекта или на странице отдельной детали
            configurator = kit_komplekt_configurator ?? detal_komplekt_configurator;

        if (!configurator) return; //если нет ни какого конфигуратора прерываем

        this.configurator = configurator; //оболочка конфигуратора
        this.all_inputs = qsa('input', configurator); //все инпуты в конфигураторе
        this.front_svg_complete = false; //загружены все необходимые изображеняи для взаимодействия с передними частями комплекта в конфигураторе
        this.back_svg_complete = false; //загружены все необходимые изображеняи для взаимодействия с задними частями комплекта в конфигураторе

        this.check_load_dependency_imges(); //запускаем проверку готовности наборов svg картинок дял каждой ориентации

        //если мы на странице комплекта
        if (kit_komplekt_configurator) {
            this.all_inputs.forEach(input => {
                input._on('change', this.konfigurator_input_state_chenge.bind(this, input)); //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен

                input.disabled = false; //делаем инпут доступным для взаимодействия, т.к. мы его отключали до момента загрузки скрипта чтоб была активна синхронизация с локальным хранилищем
            });

            this.price_area = qs('.komplekt-configurator__full-wrap-composition-price-current', configurator); //блок с ценой комплекта

            this.local_starage_write_data(); //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов

            this.button_add_full_kit = qs('.komplekt-1-full-kit .komplekt-configurator__full-wrap-composition-button');//кнопка для добавления комплекта полностью
            this.button_add_configuration_kit = qs('.komplekt-2-select-kit-composition .komplekt-configurator__full-wrap-composition-button');//кнопка для добавленяи в корзину сконфигурированного из частей комплекта
            this.header_cart_counter = qs('.header-visible__cart-counter');//счётчик корзины в хедере
            this.inner_cart_counter = qs('.cart .cart__header-counter');//счётчик корзины в самой корзине

            //this.button_add_full_kit._on('click')
        }
        //если мы на странице комплекта

        //если мы на странице детали
        else {
            let input = this.all_inputs[0]; //тут у нас всего один инпут

            input._on('change', this.konfigurator_single_detal_input_state_chenge.bind(this, input)); //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен

            input.disabled = false; //делаем инпут доступным для взаимодействия, т.к. мы его отключали до момента загрузки скрипта чтоб была активна синхронизация с локальным хранилищем
        }
        //если мы на странице детали

        //пока отложу тут нужно переписывать скрипт на сервере чтоб учитывал в случае если такого комплекта для марки и модели вообще нет, а не только его деталей
        //this.send_data_on_server_for_check(); //отправляет запрос на сервер каждый понедельник для проверки актуальности выделенных чекбоксов для каждого комплекта, на случай если буду удаляться или обновлятсяся составы комплектов и чтоб у пользователя не оставалось в локальном хранилище не нужно инфы по удалённым комплектам
    },
};

CONFIGURATOR_CONTROLLER.init();
