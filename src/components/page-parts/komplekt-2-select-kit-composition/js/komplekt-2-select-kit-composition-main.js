import { set_localStorage } from '@js-libs/func-kit';

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
    },
    //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен

    //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен на странице детали
    konfigurator_single_detal_input_state_chenge: function (input) {
        this.local_starage_write_or_chenge_single_detal_data(input); //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов для страницы детали
        this.toggle_svg_active_status(input); //меняет заливку svg детали связанной с данным инпутом
    },
    //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен на странице детали

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
            if (data[GDS.product.kit_ms_id]) {
                let searched_index, //сюда будет записан индекс найденого элемента
                    searched = data[GDS.product.kit_ms_id].find((el, index) => {
                        if (el === id) {
                            searched_index = index;
                            return true;
                        }
                    }); //пытаемся найти текущую деталь активной в данных комплекта

                //если нашли
                if (searched) {
                    if (!input.checked) data[GDS.product.kit_ms_id].splice(searched_index, 1); //если нашли но инпут не активен то удаляем данную деталь из данных комплекта в хранилище
                }
                //если нашли

                //если не нашли
                else {
                    if (input.checked) data[GDS.product.kit_ms_id].push(id); //если инпут активен записываем его
                }
                //если не нашли
            }
            //если есть запись для данного комплекта

            //если для данного комплекта ещё нет записей
            else {
                if (input.checked) data[GDS.product.kit_ms_id] = [id]; //создаём свойство с ms-id нашего комплекта и записью id нашей детали если она была отмечена
            }
            //если для данного комплекта ещё нет записей
        }
        //если есть какие-то записи о состоянии комплектов

        //если не никаких данных
        else {
            data = {};
            if (input.checked) data[GDS.product.kit_ms_id] = [id]; //создаём свойство с ms-id нашего комплекта и записью id нашей детали если она была отмечена
        }
        //если не никаких данных

        set_localStorage('kits-composition-info', JSON.stringify(data)); //записываем данные в локальное хранилище
    },
    //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов для страницы детали

    //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов
    local_starage_write_data: function () {
        let kits_composition_info = JSON.parse(localStorage.getItem('kits-composition-info')), //пытаемся получить данные из локально хранилища с данными о выбраных пользователем составах комплектов
            data = kits_composition_info && Object.keys(kits_composition_info).length != 0 ? kits_composition_info : {}, //если были какие-то данные о составе комплектов то используем, если нет то используем пустой объект как основу
            active_checkboxes = [];

        //перебираем все инпуты и те которые активные записываем в массив их id без постфикса -checkbox
        this.all_inputs.forEach(input => {
            if (input.checked) active_checkboxes.push(input.id.replace('-checkbox', ''));
        });
        //перебираем все инпуты и те которые активные записываем в массив их id без постфикса -checkbox

        //ПРИМЕЧАНИЕ: тут я могу использовать просто типы активных деталей т.к. тут не критично уникальный ms-id, даже если мы вдруг удалим деталь фар а потом создадим их то мы так же оставим их тут выделеными, а вот для корзины уже важно наличие уникального  ms-id

        data[GDS.product.kit_ms_id] = active_checkboxes;

        set_localStorage('kits-composition-info', JSON.stringify(data));

        // console.log(data);
    },
    //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов

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

            this.local_starage_write_data(); //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов
        }
        //если мы на странице комплекта

        //если мы на странице детали
        else {
            let input = this.all_inputs[0]; //тут у нас всего один инпут

            input._on('change', this.konfigurator_single_detal_input_state_chenge.bind(this, input)); //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен

            input.disabled = false; //делаем инпут доступным для взаимодействия, т.к. мы его отключали до момента загрузки скрипта чтоб была активна синхронизация с локальным хранилищем
        }
        //если мы на странице детали
    },
};

CONFIGURATOR_CONTROLLER.init();
