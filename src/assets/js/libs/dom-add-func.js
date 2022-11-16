import { custom_events_list } from './custom-events.js';

(() => {
    //action - true/false дабавлить или удалить слушатель
    function toggle_listener_events_func(elem, events, callback, options_event, custom_settings, action) {
        let events_list = events.split(' '); //преобрзуем строковый список в масив

        options_event = Object.assign({ passive: true }, options_event); //объединяем параметры пользователя с параметрами по умолчанию

        events_list.forEach(event => {
            //если событие кастомное
            if (custom_events_list.hasOwnProperty(event) && event === 'swipe') {
                custom_events_list[event].initiator(elem, custom_settings, action); //запускаем соответствующую функцию для регистрации данного события
            }
            //если событие кастомное

            //если событие кастомное
            if (custom_events_list.hasOwnProperty(event) && event !== 'swipe') {
                //event - кастомное имя события наприаер resize_optimize
                //elem - лемент DOM к которому нужно применить прослушку данного события
                custom_events_list[event].initiator({
                    custom_event_name: event,
                    el_callback: callback,
                    element: elem,
                    custom_settings: custom_settings,
                    listener_action: action,
                }); //запускаем соответствующую функцию для регистрации данного события
            }
            //если событие кастомное

            action ? elem.addEventListener(event, callback, options_event) : elem.removeEventListener(event, callback, options_event); //в зависимоти от параметра action включаем или отключаем слушатель на элементе
        });
    }

    //функции которые будут добавлены как методы для объектов dom_obj_list таких как HTMLElement, NodeList, HTMLCollection для удобста взаимодествия с этими элементами
    let dom_added_func = {
        //добавляем слушатель события
        //events - строка событий которые нужно прослушивать на элементе, пример: "touchend click resize focus blur"
        //callback - функция которую нужно вызвать при срабатывании события из строки events, можно указать название функции, пример: touch_menu_open_close ; или указать функцию, пример: function(){console.log("Выполняем что-то, при срабатывании события из массива events")}
        //options_event - сюда нужно передать объект с обциями для данного слушателя
        //custom_settings - настрйоки которые будт переданы в кастомные события созданые пользователем такие как swipe
        on: function (events, callback, options_event = {}, custom_settings) {
            if (this instanceof HTMLElement || this === w) return toggle_listener_events_func(this, events, callback, options_event, custom_settings, true); //если одиночный элемент
            //ПРИМЕЧАНИЕ: нужно обязательно преобразовать this в массив, т.к. HTMLCollection к примеру не имеет метода forEach
            [...this].forEach(elem => toggle_listener_events_func(elem, events, callback, options_event, custom_settings, true)); //для каждого элемента ищем элементы по методу поиска func и записываем подходящих в результат
        },
        //добавляем слушатель события

        //удаляем слушатель события
        //events - строка событий которые нужно прослушивать на элементе, пример: "touchend click resize focus blur"
        //callback - функция которую нужно вызвать при срабатывании события из строки events, можно указать название функции, пример: touch_menu_open_close ; или указать функцию, пример: function(){console.log("Выполняем что-то, при срабатывании события из массива events")}
        //options_event - сюда нужно передать объект с обциями для данного слушателя
        //custom_settings - настрйоки которые будт переданы в кастомные события созданые пользователем такие как swipe
        off: function (events, callback, options_event = {}, custom_settings) {
            if (this instanceof HTMLElement || this === w) return toggle_listener_events_func(this, events, callback, options_event, custom_settings, false); //если одиночный элемент
            //ПРИМЕЧАНИЕ: нужно обязательно преобразовать this в массив, т.к. HTMLCollection к примеру не имеет метода forEach
            [...this].forEach(elem => toggle_listener_events_func(elem, events, callback, options_event, custom_settings, false)); //для каждого элемента ищем элементы по методу поиска func и записываем подходящих в результат
        },
        //удаляем слушатель события
    };
    //функции которые будут добавлены как методы для объектов dom_obj_list таких как HTMLElement, NodeList, HTMLCollection для удобста взаимодествия с этими элементами

    let dom_obj_list = [HTMLElement, NodeList, HTMLCollection]; //к каким объектам добавлять новые методы для взаимодействия

    //ПРИМЕЧАНИЕ: приписка _ перед функциями необходима для того чтоб избежать возможной перезаписи метода в исходном объекте
    //добавляем новые методы в объекты для взаиможействия с элементоми
    dom_obj_list.forEach(item => {
        for (let func in dom_added_func) item.prototype['_'+func] = dom_added_func[func];
    });
    //добавляем новые методы в объекты для взаиможействия с элементом

    w._on = dom_added_func.on;
    w._off = dom_added_func.off;
})();
