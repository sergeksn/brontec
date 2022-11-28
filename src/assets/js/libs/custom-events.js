import Swipe from '@js-libs/swipe-event';

//добавляем кастомный слушатель на элемент Optimaze_And_Throttle
class Add_Custom_Event_Optimaze_And_Throttle {
    constructor(custom_event_name, element, el_callback, custom_settings) {
        let base_event = custom_event_name.replace(/_.*/, '');

        if (base_event === 'resize' && element !== w) return; //если кастомные событие свзяно с resize, а элемент на который мы вещаем этот обработчик не w то прерываем добавление слушателя

        if (!element.hasOwnProperty(custom_event_name)) {
            element[custom_event_name] = []; //если у данного элемента ещё не было слушателей данного типа создаём масив для того чтоб записывать в него все слушатели данного типа с их данными
        } else {
            //перебираем все слушатели этого кастомного события привязанные к элементу
            for (let i = 0; i < element[custom_event_name].length; i++) {
                if (element[custom_event_name][i].callback === el_callback) return; //если у этого элемента уже есть слушатель с этим колбектом то прерываем создание нового события
            }
            //перебираем все слушатели этого кастомного события привязанные к элементу
        }

        this.permission_to_execute = true; //разрешение на выполнение события
        this.custom_event = custom_events_list[custom_event_name].event; //объект данного кстомного события
        this.element = element;

        //данные калбек функции для базового слушате слушателя этого кастомного события события
        let event_listener_data = {
            handleEvent: custom_event_name.includes('_optimize') ? this.func_optimize : this.func_throttle, //передаём ссылку на калбек функцию
            instance: this, //задём новое свойство instance с содержимым this этого экземпляра класса, это свойство instance будет доступно в this из handleEvent функции слушателя
            custom_settings: custom_settings, //передаём кастомные настройки
            callback: el_callback, //функция которая была привязанна к element для слушателя события custom_event_name
        };

        element[custom_event_name].push(event_listener_data); //создаём в элементе свойство с данными для данного кастомного слушателя

        element.addEventListener(base_event, event_listener_data); //добавляем слушатель к элементу с неоптимизированным событием, scroll например
    }

    //калбек функции для оптимизации путём тролтинга, т.е. функция колбека выполянется с интервалом в custom_settings.interval мс
    //
    //
    //ВАЖНО: что бы не забыть если событие  _throttle было вызвано на каком-то элементе с интервалом к приеру в 200 мс, то эето значит что если вызвать это событие _throttle на этом же элементе но с другим калбеком и интервалом в 500 мс, то событие будет срабатывать каждые 200 мс т.к. как оно срабатывает для самого наименьшего интервала
    //
    //
    func_throttle() {
        if (!this.instance.permission_to_execute) return; //если в данный момент не разрешено выполнение данной функции, т.е. кадр анимации в браузере ещё не выполнился

        this.instance.permission_to_execute = false; //запрещаем выполнять данную функцию при следующих вызовах пока не завершится кадр анимации в браузере

        let interval = this.custom_settings && this.custom_settings.interval ? this.custom_settings.interval : 100; //по умолчанию интервал 100 мс

        //выполянем функцию после заданной паузы
        this.instance.timeout_id = setTimeout(() => {
            // устанавливаем время ожидания
            this.instance.element.dispatchEvent(this.instance.custom_event); //вызываем срабытывание кастомного свойства, scroll_optimize к примеру
            this.instance.permission_to_execute = true; //даём разрешение на выполнении фукнции func_optimize при следующем вызове
        }, interval);
        //выполянем функцию после заданной паузы
    }
    //калбек функции для оптимизации путём тролтинга, т.е. функция колбека выполянется с интервалом в custom_settings.interval мс

    //калбек функция для неоптимизированного события event, scroll например
    func_optimize() {
        if (!this.instance.permission_to_execute) return; //если в данный момент не разрешено выполнение данной функции, т.е. кадр анимации в браузере ещё не выполнился

        this.instance.permission_to_execute = false; //запрещаем выполнять данную функцию при следующих вызовах пока не завершится кадр анимации в браузере

        //инициализируем перерисовку кадра в браузере
        requestAnimationFrame(() => {
            this.instance.element.dispatchEvent(this.instance.custom_event); //вызываем срабытывание кастомного свойства, scroll_optimize к примеру
            this.instance.permission_to_execute = true; //даём разрешение на выполнении фукнции func_optimize при следующем вызове
        });
        //инициализируем перерисовку кадра в браузере
    }
    //калбек функция для неоптимизированного события event, scroll например
}
//добавляем кастомный слушатель на элемент Optimaze_And_Throttle

//отключаем слушатель от данного элемента Optimaze_And_Throttle
class Remove_Custom_Event_Optimaze_And_Throttle {
    constructor(custom_event_name, element, el_callback) {
        let event_listener_data,
            timeout_id,
            base_event = custom_event_name.replace(/_.*/, ''),
            arr = element[custom_event_name]; //массив со всеми объектами слушателей данного кастомного события

        //перебираем все слушатели этого кастомного события привязанные к элементу
        arr.forEach((item, i) => {
            if (item.callback !== el_callback) return; //если функция калбека не там что нужно отключить

            event_listener_data = item; //находим в массиве с данными этого кастомного события элемента объект, в котором callback тот же что и тот который нужно отключить от данного элемента на этом кастомном событии и записываем нужный нам объект в event_listener_data

            timeout_id = item.instance.timeout_id; //запишет сюда таймер текущего тротлинга или будет просто undefined

            if (timeout_id) clearTimeout(timeout_id); //если есть таймер то прерываем его, чтоб не было такого что тратлинг с большой задержкой и функция слушателя выполниться через время после удаления самого слушателя

            arr.splice(i, 1); //удаляем из массива объект данного слушателя
        });
        //перебираем все слушатели этого кастомного события привязанные к элементу

        if (arr.length === 0) delete element[custom_event_name]; //если у этого элемента больше нет слушателей данного кастомного события то можно удалить его свойство из объекта элемента

        element.removeEventListener(base_event, event_listener_data); //отключаем слушатель от данного элемента
    }
}
//отключаем слушатель от данного элемента Optimaze_And_Throttle

//добавляем кастомные события измения ориентации
//ПРИМЕЧАНИЕ: этот слушатель актуален только для w, он работает как для пк так и для мобильных!
(() => {
    let mql = w.matchMedia('(orientation: portrait)'), //хранит медиа запрос, от сюда мы можем узнать соостветствует состояние страницы медиазапросу или нет
        orientation_events_list = {
            //хранит объекты кастомных событий ориентации чтоб брать их от сюда и не содавать каждый раз по новой при каждом событии смены ориентации
            orientation_chenge: new CustomEvent('orientation_chenge'),
            orientation_portrait: new CustomEvent('orientation_portrait'),
            orientation_landscape: new CustomEvent('orientation_landscape'),
        };

    //добавляет кастомные события
    function add_custom_orientation_events(e) {
        w.dispatchEvent(orientation_events_list.orientation_chenge); //срабатывает в момент смены ориентации

        e.matches ? w.dispatchEvent(orientation_events_list.orientation_portrait) : w.dispatchEvent(orientation_events_list.orientation_landscape); //в зависимости от соответствия условиям медиа запроса orientation: portrait срабатывает то или иное событие ориентации
    }

    typeof w.matchMedia('').addListener === 'function' ? mql.addListener(add_custom_orientation_events) : mql.addEventListener('change', add_custom_orientation_events); //проблема в том что addListener сейчас доступен во всех соременных браузерах, но помечен как устаревший и нужно использовать addEventListener с change, но change для matchMedia не поддерживается в версиях ios до 13, а ним их нужно поддерживать, по этому проверяем есть ли в браузере функиця addListener то используем её, если же она удалени в новых браузерах используем современное свойство addEventListener с change
})();
//добавляем кастомные события измения ориентации

//тут храняться кастомные собития и функции которые нужно вызывать при добавлени или удалении каждого события
const custom_events_list = {
    swipe: {
        event: new CustomEvent('swipe'),
        initiator: params => new Swipe(params),//ВАЖНО: на одном элементе может быть только одно событие свайпа для корректной работы!
    },
    resize_optimize: {
        event: new CustomEvent('resize_optimize'),
        initiator: custom_events_optimaze_and_throttle_init,
    },
    scroll_optimize: {
        event: new CustomEvent('scroll_optimize'),
        initiator: custom_events_optimaze_and_throttle_init,
    },
    touchmove_optimize: {
        event: new CustomEvent('touchmove_optimize'),
        initiator: custom_events_optimaze_and_throttle_init,
    },
    mousemove_optimize: {
        event: new CustomEvent('mousemove_optimize'),
        initiator: custom_events_optimaze_and_throttle_init,
    },
    resize_throttle: {
        event: new CustomEvent('resize_throttle'),
        initiator: custom_events_optimaze_and_throttle_init,
    },
    scroll_throttle: {
        event: new CustomEvent('scroll_throttle'),
        initiator: custom_events_optimaze_and_throttle_init,
    },
    touchmove_throttle: {
        event: new CustomEvent('touchmove_throttle'),
        initiator: custom_events_optimaze_and_throttle_init,
    },
    mousemove_throttle: {
        event: new CustomEvent('mousemove_throttle'),
        initiator: custom_events_optimaze_and_throttle_init,
    },
};
//тут храняться кастомные собития и функции которые нужно вызывать при добавлени или удалении каждого события

//custom_event_name - кастомное событиетипа resize, scroll, mousemove, touchmove с приставкой _optimize или _throttle
//element - элемент на котором нужно слушать данное событие
//el_callback - функция которая будет срабатывать каждый раз при срабатывании события custom_event_name на элементе element, нужна чтоб можно было в дальнейшем отличать разные обработчики custom_event_name одного типа на этом element, а сделать мы это сможем сравнивая el_callback
//custom_settings - возможно были переданны кастомные настройки
//listener_action - если true то значит слушатель нужно добавить к element, если false то удалить слушатель события custom_event_name с element для которого калбек фунункция это el_callback
function custom_events_optimaze_and_throttle_init({ custom_event_name, element, el_callback, custom_settings, listener_action }) {
    let params = [custom_event_name, element, el_callback, custom_settings]; //записываем все параметры в масив, чтоб далее удобно их в ставить в два новых экземпляпа класса

    listener_action ? new Add_Custom_Event_Optimaze_And_Throttle(...params) : new Remove_Custom_Event_Optimaze_And_Throttle(...params); //в зависимости от того что нужно добавить или удалить кастомный слушатель на элементе вызваем разные функции
}

export { custom_events_list };
