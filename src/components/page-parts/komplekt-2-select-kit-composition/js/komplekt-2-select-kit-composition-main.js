import { set_localStorage } from '@js-libs/func-kit';
import { Header_Cart } from '@header-main-js';
//ПРИМЕЧАНИЕ: разделитель вида @@ между маркой и моделью сделан что точно отделить марку от модели т.к. марака или модель может состоять из двух слов, а не одного, а так мы точно их разделим

let configurator = qs('.komplekt-2-select-kit-composition') ?? qs('.detal-1-add-to-kit'), //блок с конфигуратором на странице комплекта ли детали
    detal_single_input = qs('.detal-1-add-to-kit input'), //инпут страницы детали
    all_inputs = detal_single_input ? [detal_single_input] : qsa('.komplekt-configurator input'), //все инпуты в конфигураторе для любой из страниц комплекта или детали
    button_add_full_kit = qs('.komplekt-1-full-kit .komplekt-configurator__full-wrap-composition-button'), //кнопка для добавления комплекта полностью
    button_add_configuration_kit = qs('.komplekt-2-select-kit-composition .komplekt-configurator__full-wrap-composition-button'), //кнопка для добавленяи в корзину сконфигурированного из частей комплекта
    CONFIGURATOR_CONTROLLER = {
        //функция проверяет все инпуты и опираясь на их активность подсвечивает соответствующие детали
        update_template_svg_configuration: function () {
            all_inputs.forEach(input => {
                let is_checked_input = input.checked,
                    svg_position = input.getAttribute('data-position'), //получаем какая позиция у svg привязанной к данному инпуту
                    svg_id = input.id.replace('-checkbox', ''), //получаем id svg для данного инпута
                    target_svg; //тут будет записана найденая svg

                //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
                if (svg_position === 'front') {
                    target_svg = qs('[data-front] #' + svg_id, configurator); //находим нужную svg
                    is_checked_input ? target_svg.setAttribute('data-active', '') : target_svg.removeAttribute('data-active'); //добавляем/удаляем атрибут
                }
                //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции

                //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
                if (svg_position === 'back') {
                    target_svg = qs('[data-back] #' + svg_id, configurator); //находим нужную svg
                    is_checked_input ? target_svg.setAttribute('data-active', '') : target_svg.removeAttribute('data-active'); //добавляем/удаляем атрибут
                }
                //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
            });
        },
        //функция проверяет все инпуты и опираясь на их активность подсвечивает соответствующие детали

        //запускаем проверку готовности наборов svg картинок дял каждой ориентации
        check_load_dependency_imges: function () {
            let front_svg_wrap = qs('[data-front] [data-img-type="svg-kit-items"]', configurator), //оболочка набора картинок svg для комплекта вид спереди
                back_svg_wrap = qs('[data-back] [data-img-type="svg-kit-items"]', configurator); //оболочка набора картинок svg для комплекта вид сзади

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
            //убираем у кнопки конфигуратора все пометки они выставтся новые если такая конфигурация будет обнаружена в корзине
            button_add_configuration_kit.removeAttribute('data-in-cart');
            button_add_configuration_kit.removeAttribute('data-product-cart-id');

            this.local_starage_write_data(); //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов
            this.toggle_svg_active_status(input); //меняет заливку svg детали связанной с данным инпутом
            ksn_product_configurator_func.set_configurator_price_and_status(); //функция задёт цену для текущей конфигурации и если ничего не выделено блокирыет кнопку конфигуроатора
            ksn_product_configurator_func.check_cart_composition_and_edit_buttons_action(); //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
        },
        //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен

        //меняет заливку svg детали связанной с данным инпутом
        toggle_svg_active_status: function (input) {
            let svg_position = input.getAttribute('data-position'), //получаем какая позиция у svg привязанной к данному инпуту
                svg_id = input.id.replace('-checkbox', ''), //получаем id svg для данного инпута
                target_svg; //тут будет записана найденая svg

            //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
            if (svg_position === 'front' && this.front_svg_complete) {
                target_svg = qs('[data-front] #' + svg_id, configurator); //находим нужную svg
                target_svg.toggleAttribute('data-active'); //добавляем/удаляем атрибут
            }
            //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции

            //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
            if (svg_position === 'back' && this.back_svg_complete) {
                target_svg = qs('[data-back] #' + svg_id, configurator); //находим нужную svg
                target_svg.toggleAttribute('data-active'); //добавляем/удаляем атрибут
            }
            //проверяем задана ли у инпута позиция и загружен ли набор для даннйо позиции
        },
        //меняет заливку svg детали связанной с данным инпутом

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
            all_inputs.forEach(input => {
                if (input.checked) active_checkboxes.push(input.id.replace('-checkbox', ''));
            });
            //перебираем все инпуты и те которые активные записываем в массив их id без постфикса -checkbox

            //ПРИМЕЧАНИЕ: тут я могу использовать просто типы активных деталей т.к. тут не критично уникальный ms-id, даже если мы вдруг удалим деталь фар а потом создадим их то мы так же оставим их тут выделеными, а вот для корзины уже важно наличие уникального  ms-id

            data[GDS.product.marka_model] = active_checkboxes; //записываем для данного комплекта активные детали

            set_localStorage('kits-composition-info', JSON.stringify(data)); //записываем обновлённые данные в хранилище
        },
        //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов

        //отправляет запрос на сервер каждые 10 дней для проверки актуальности выделенных чекбоксов, ели более точно то если данного комплекта больше нет, его данные удаляются из локального хранилища, и так же проверяет есть ли данняа деталоь у данного комплекта
        send_data_on_server_for_check: function () {
            let interval = 10 * 24 * 60 * 60 * 1000, //временной интервал в милисекундах длительностью 10 дней
                time_is_now = new Date().getTime(), //текущее время
                last_check = localStorage.getItem('kits-composition-last-update'); //дата последнего обновления

            if (time_is_now - last_check < interval) return; //если с последнего обновления ещё не прошло 10 дней прерываем запрос на проверку актуальности данных

            all_inputs.forEach(el => (el.disabled = true)); //чтоб пользователь не смог ничего поменять пока не прийдёт обработанные данные мы блокируем инпуты чекбоксов

            let request_data = {
                //запрос на сервер
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=utf-8' },
                body: JSON.stringify({
                    action: 'check_actual_kits_composition_checkbox_info',
                    data: localStorage.getItem('kits-composition-info'),
                }),
            };

            //отправляем запрос на сервер что отправить сообщение и выводим соответсвующие всплывающие окна
            fetch(GDS.ajax_url, request_data)
                .then(response => response.json()) //считываем переданные данные
                .then(result => {
                    set_localStorage('kits-composition-info', JSON.stringify(result)); //обновляем данные
                    set_localStorage('kits-composition-last-update', new Date().getTime()); //записываем текущее время как дату последнего обновления
                })
                .finally(() => {
                    all_inputs.forEach(el => (el.disabled = false)); //после завершеняи запрсоа разблокируем чекбоксы
                })
                .catch(e => console.error(e));
        },
        //отправляет запрос на сервер каждые 10 дней для проверки актуальности выделенных чекбоксов, ели более точно то если данного комплекта больше нет, его данные удаляются из локального хранилища, и так же проверяет есть ли данняа деталоь у данного комплекта

        //при нажатии на кнопки добавлени/перехода в корзину у полного комплекта и конфигуратора комплекта
        add_or_go_to_cart: async function (e) {
            let path = e.composedPath(); //полный путь до нажатой кнопки

            if (path.find(el => el?.classList?.contains('komplekt-2-select-kit-composition--nothing-selected'))) return; //если кнопка дял конфигуратора и ничего не выбрано в конфигураторе то ничего не делаем при нажатии на кнопку, данняа пометка может быть только у конфигуратора но неу  полного комплекта

            let is_full_kit_button = path.find(el => el?.classList?.contains('komplekt-1-full-kit')), //проверяем что это за кнопка
                button = e.target;

            if (!button.dataset.inCart) {
                Header_Cart.add_to_cart(is_full_kit_button); //добавляет товар в корзину
                ksn_product_configurator_func.check_cart_composition_and_edit_buttons_action(); //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
            }
            //добавляем данные комплекта только если у кнпки нет атрибута сообщающего нам о том что данная конфигурация или комплект уже был добавлен в корзину

            //если комплект уже в корзине то открываем корзину
            else {
               await Header_Cart.toggle_cart(); //если комплект уже в корзине то открываем корзину
               Header_Cart.scroll_to_the_traget_product(button.dataset.productCartId); //функция получает id товара до которого нужно достролить чтоб он был в фокусе
            }
            //если комплект уже в корзине то открываем корзину
        },
        //при нажатии на кнопки добавлени/перехода в корзину у полного комплекта и конфигуратора комплекта

        init: async function () {
            this.front_svg_complete = false; //загружены все необходимые изображеняи для взаимодействия с передними частями комплекта в конфигураторе
            this.back_svg_complete = false; //загружены все необходимые изображеняи для взаимодействия с задними частями комплекта в конфигураторе

            if (configurator) this.check_load_dependency_imges(); //запускаем проверку готовности наборов svg картинок дял каждой ориентации, если есть хоть один из конфигураторов

            if (!qs('.komplekt-2-select-kit-composition')) return; //если нет конфигуратора полного комплекта прерываем

            //включаем инпуты и подключаем прослушку на их изменение
            all_inputs.forEach(input => {
                input._on('change', this.konfigurator_input_state_chenge.bind(this, input)); //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен

                input.disabled = false; //делаем инпут доступным для взаимодействия, т.к. мы его отключали до момента загрузки скрипта чтоб была активна синхронизация с локальным хранилищем
            });
            //включаем инпуты и подключаем прослушку на их изменение

            this.local_starage_write_data(); //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов

            [button_add_full_kit, button_add_configuration_kit].forEach(button => button._on('click', this.add_or_go_to_cart.bind(this))); //при нажатии на кнопки добавлени/перехода в корзину у полного комплекта и конфигуратора комплекта

            this.send_data_on_server_for_check(); //отправляет запрос на сервер каждые 10 дней для проверки актуальности выделенных чекбоксов, ели более точно то если данного комплекта больше нет, его данные удаляются из локального хранилища
        },
    };

CONFIGURATOR_CONTROLLER.init();

export default CONFIGURATOR_CONTROLLER;
