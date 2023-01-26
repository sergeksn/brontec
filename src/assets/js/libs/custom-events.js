import Swipe from '@js-libs/swipe-event';

//добавляем кастомный слушатель на элемент Optimaze_And_Throttle
function add_custom_events_optimaze_and_throttle({ custom_event_name, element, listener_action }) {
    if (!listener_action) return; //если нужно удалить событие то мы прерываем данную функцию, т.к. она это не делает

    let base_event = custom_event_name.replace(/_.*/, ''); //получаем оригинальное событие

    if (base_event === 'resize' && element !== w) return; //если кастомные событие свзяно с resize, а элемент на который мы вещаем этот обработчик не w то прерываем добавление слушателя

    if (!element.custom_events_list) element.custom_events_list = []; //если у элемента ещё нет свойства со списком всех кастомных прослушиваемых событий создаём его

    if (element.custom_events_list.find(e => e === custom_event_name)) return; //если дайнный тип кастомного события уже слушается на элементе прерываем выполнение

    element.custom_events_list.push(custom_event_name); //записываем нове событие в список

    let permission_to_execute = true, //разрешение на выполнение события
        custom_event = custom_events_list[custom_event_name].event, //объект данного кстомного события
        event_type = custom_event_name.includes('_optimize') ? 'optimize' : 'throttle';

    //
    //
    //ВАЖНО: что бы не забыть если событие  _throttle было вызвано на каком-то элементе с интервалом к приеру в 200 мс, то эето значит что если вызвать это событие _throttle на этом же элементе но с другим калбеком и интервалом в 500 мс, то событие будет срабатывать каждые 200 мс т.к. как оно срабатывает для самого наименьшего интервала
    //
    //
    //добавляем стандартынй слушатель события на элемент чтоб вызывать кастомное событие при выполнении условий
    element.addEventListener(base_event, () => {
        if (!permission_to_execute) return; //если в данный момент не разрешено выполнение данной функции, т.е. таймаут ещё не выполнился

        permission_to_execute = false; //запрещаем выполнять данную функцию при следующих вызовах пока не завершится таймаут

        //для опитимизации по частоте кадров
        if (event_type === 'optimize') {
            //инициализируем перерисовку кадра в браузере
            requestAnimationFrame(() => {
                element.dispatchEvent(custom_event); //вызываем срабытывание кастомного свойства, scroll_optimize к примеру
                permission_to_execute = true; //даём разрешение на выполнении фукнции func_optimize при следующем вызове
            });
            //инициализируем перерисовку кадра в браузере
        }
        //для опитимизации по частоте кадров

        //для создания принудительных задержек события, т.е. не чаще чем 10 раз в секунду например
        else {
            //выполянем функцию после заданной паузы
            setTimeout(() => {
                // устанавливаем время ожидания
                element.dispatchEvent(custom_event); //вызываем срабытывание кастомного свойства, scroll_optimize к примеру
                permission_to_execute = true; //даём разрешение на выполнении фукнции func_optimize при следующем вызове
            }, 100);
            //выполянем функцию после заданной паузы
        }
        //для создания принудительных задержек события, т.е. не чаще чем 10 раз в секунду например
    });
    //добавляем стандартынй слушатель события на элемент чтоб вызывать кастомное событие при выполнении условий
}
//добавляем кастомный слушатель на элемент Optimaze_And_Throttle

//добавляем кастомные события измения ориентации
//ПРИМЕЧАНИЕ: этот слушатель актуален только для w, он работает как для пк так и для мобильных!
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

//добавляем кастомные события измения ориентации

//тут храняться кастомные собития и функции которые нужно вызывать при добавлени или удалении каждого события
const custom_events_list = {
    swipe: {
        event: new CustomEvent('swipe'),
        initiator: params => new Swipe(params), //ВАЖНО: на одном элементе может быть только одно событие свайпа для корректной работы!
    },
    resize_optimize: {
        event: new CustomEvent('resize_optimize'),
        initiator: add_custom_events_optimaze_and_throttle,
    },
    scroll_optimize: {
        event: new CustomEvent('scroll_optimize'),
        initiator: add_custom_events_optimaze_and_throttle,
    },
    touchmove_optimize: {
        event: new CustomEvent('touchmove_optimize'),
        initiator: add_custom_events_optimaze_and_throttle,
    },
    mousemove_optimize: {
        event: new CustomEvent('mousemove_optimize'),
        initiator: add_custom_events_optimaze_and_throttle,
    },
    resize_throttle: {
        event: new CustomEvent('resize_throttle'),
        initiator: add_custom_events_optimaze_and_throttle,
    },
    scroll_throttle: {
        event: new CustomEvent('scroll_throttle'),
        initiator: add_custom_events_optimaze_and_throttle,
    },
    touchmove_throttle: {
        event: new CustomEvent('touchmove_throttle'),
        initiator: add_custom_events_optimaze_and_throttle,
    },
    mousemove_throttle: {
        event: new CustomEvent('mousemove_throttle'),
        initiator: add_custom_events_optimaze_and_throttle,
    },
};
//тут храняться кастомные собития и функции которые нужно вызывать при добавлени или удалении каждого события

export { custom_events_list };
