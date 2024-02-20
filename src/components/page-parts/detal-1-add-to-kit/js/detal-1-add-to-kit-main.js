import { set_local_storage } from '@js-libs/func-kit';
import Full_Kit_Configurator from '@komplekt-5-select-kit-composition-main-js';

let input = qs('.detal-1-add-to-kit input'), //инпут в конфигураторе
    CONFIGURATOR_CONTROLLER = {
        init: function () {
            if (!qs('.detal-1-add-to-kit')) return; //если нет конфигуратора детали комплекта прерываем

            input._on('change', this.konfigurator_input_state_chenge.bind(this, input)); //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен

            input.disabled = false; //делаем инпут доступным для взаимодействия, т.к. мы его отключали до момента загрузки скрипта чтоб была активна синхронизация с локальным хранилищем

            w._on('storage', e => {
                if (e.key === 'kits-composition-info') {
                    let detal_info = JSON.parse(localStorage.getItem('kits-composition-info'))?.[GDS.product.marka_model].includes(GDS.product.detal); /*пытаемся получить состяние данной детали из комплекта*/

                    qs('#' + GDS.product.detal + '-checkbox').checked = detal_info; //если такая деталь найдена выделяем её чекбокс и svg картинку

                    Full_Kit_Configurator.toggle_svg_active_status.bind(Full_Kit_Configurator)(); //меняет заливку svg детали связанной с данным инпутом
                }
            }); //синхронизирует конфигураторы в разных вкладках браузера

            let get_data = window.location.search.replace('?', ''); //получаем данные гет из адреса

            if (get_data.includes('from-configurator=true')) {
                [qs('.detal-1-add-to-kit__data a'), qs('.detal-5__link-wrap a')].forEach(el => (el.href += '#komplekt-configurator')); //если мы перешли из конфигуратора то ставим ссылку именно на блок конфигуратора
            }
        },

        //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен на странице детали
        konfigurator_input_state_chenge: function (input) {
            this.local_starage_write_or_chenge_detal_data(input); //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов для страницы детали
            Full_Kit_Configurator.toggle_svg_active_status.bind(Full_Kit_Configurator)(); //меняет заливку svg детали связанной с данным инпутом
        },
        //срабатываем при клике на чекбокс, т.е. при смене его состояния включен/выключен на странице детали

        //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов для страницы детали
        local_starage_write_or_chenge_detal_data: function (input) {
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

            set_local_storage('kits-composition-info', JSON.stringify(data)); //записываем данные в локальное хранилище
        },
        //записывает/обновляет данные в локальном хранилище для отображения активными тех или иных чекбоксов для страницы детали
    };

CONFIGURATOR_CONTROLLER.init(); //иницализируем работу конфигуратора детали
