//ВАЖНО: на одном элементе может быть только одно событие свайпа для корректной работы!
export default class {
    constructor(params) {
        console.log(params);
        this.el = params.element; //текущий элемент для отслеживания свайпа

        if (!params.listener_action) return this.remove_swipe_event(); //если передано что нужно удалить слушатель

        if (this.el.swipe_event_data) return console.error('На элементе может быть только одно событие свайпа'); //если у элемента уже есть слушатель свайпа то прерываем выполнение

        this.el.swipe_event_data = this; //создаём свойство с данными для свайпа

        // настройки по умолчанию
        this.settings = {
            touch_swipe: true, //отслеживать свайп на сенсорных устройствах
            mouse_swipe: true, //отслеживать свайп на устройствах с мышкой
            min_percent_dist_x: 2, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в % от ширины экрана
            max_percent_dist_x: 90, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от ширины экрана
            min_percent_dist_y: 2, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от высоты экрана
            max_percent_dist_y: 90, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от высоты экрана
            min_px_dist_x: null, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в пикселях px
            max_px_dist_x: null, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            min_px_dist_y: null, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            max_px_dist_y: null, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            min_time: 50, //минимальное время, за которое должен быть совершен свайп (ms)
            max_time: 1000, //максимальное время, за которое должен быть совершен свайп (ms)
            allow_leave: true, //считать ли жесты при которых указатель покидал границы элемента свайпом, если false то если указатиль покинул границы элемента свайп не будет засчитан







            remove_default_events: true, //убирать ли события click mousedown touchstart mousemove touchmove mouseup touchend mouseleave touchcancel по умолчанию для элемента









            /*callback_success: () => console.log("SUCCESS"), //функция которая будет вызвана если жест над элементом был свайпом, тоже самое что и срабатывае события, но выполяняется раньше чем событие будет инициализированно, а следоовательно запустится раньше чем те функции которые прикреплены к событию swipe
            callback_fail: () => console.log("FAIL"), //функция которая будет вызвана если жест над элементом не был свайпом
            callback_finally: () => console.log("FINALLY"), //функция которая будет вызвана по завершенни проверки действия на свайп, вне зависимости как завершилась проверка
            callback_start: () => console.log("START"), //функция которая будет вызвана каждый раз при старте свайпа, когда указатель нажали
            callback_move: () => console.log("MOVE"), //функция которая будет вызвана каждый раз в момент движения указателя
            callback_leave: () => console.log("LEAVE"), //функция которая будет вызвана когдя указатель  покинет элемент или будет ошибка регистрации указателя*/
            callback_success: () => {},
            callback_fail: () => {},
            callback_finally: () => {},
            callback_start: () => {},
            callback_move: () => {},
            callback_leave: () => {},
            el: this.el, //элемент на котором изначально было привязано событие свайпа
            terget_el: null, //элемент который является целевым в данные момент времени, т.е. в начале это элемент по кторому кликнули потом элементы по которым движется курсор, вконце элемент над которым отпустили мышку, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале
            start_terget_el: null, //элемент на котором начат свайп, т.е. нажали мышь или палец
            finall_target_el: null, //элемент на котором окончен свайп, т.е. отпустили кнопку мыши или палец, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале
            direction: '', //направление свайпа
            start_direction: null, //начальное направление свайпа, для того чтоб понять куда изначально элемент начали смещать
            some_touches: false, //если true то будет регистрировать свайп даже при нескольких точках касания на сансорном экране (вне целевого элемента!!!), и как следствие сможет обрабатывать несколько разных свайпов или других сенсорных событий для разных элементов одновременно
            touch_identifier: null, //ВАЖНО: это для избежаения ошибки иногда индентификаторы путаются местами и получается глюки, не знаю почему так происходит, но сверяем идентификаторы мы именно чтоб избежать багов
            permission_directions: {
                top: true,
                right: true,
                bottom: true,
                left: true,
            }, //направления в которых нужно учитывать свайп
            permission_mouse_buttons: {
                1: true, //левая
                2: false, //центральная
                3: false, //правая
            }, //какие кнопки мыши учитывать при свайпе
            start_time: 0, //время начало свайпа
            total_time: 0, //сколько времени занял свайп
            start_x: 0, //позиция точки нажатия в самом начале по горизонтали
            start_y: 0, //позиция точки нажатия в самом начале по вертикали
            x: 0, //будет хранить изменяемую позицию точки нажатия при перемещении по горизонтали
            y: 0, //будет хранить изменяемую позицию точки нажатия при перемещении по вертикали
            x_dist: 0, //дистанция проейдаеная по горизонтали
            y_dist: 0, //дистанция проейдаеная по вертикали
            abort_swipe_fail: false, //может быть использованно для принудительного прерывания свайпа как неудачный
        };
        // настройки по умолчанию

        Object.assign(this.settings, params.custom_settings); // настройки по умолчанию объединяем и заменяем настройками пользователя

        if (!this.settings.touch_swipe && !this.settings.mouse_swipe) return; //если не указан ни один тип устройства для мониторинга свайпа завершаем инициализацию прослушивания свайпа

        this.generate_events_name(); //генерируем имена событий для реализации отслеживания свайпа

        this.get_min_and_max_px_swipe_distanse(); //получаем максимально и минимально дупустимые растояния в пикселях для учёта свайпа

        if (this.settings.remove_default_events) this.el._on(`click ${this.generate_events.start} ${this.generate_events.move} ${this.generate_events.finall} ${this.generate_events.leave}`, this.remove_default, { passive: false }); //отключаем события по умолчанию если задано в настройках

        this.run_monitoring_swipe(); //начитает мониторинг свайпа после клика и/или тача на элементе
    }

    //начитает мониторинг свайпа после клика и/или тача на элементе
    run_monitoring_swipe() {
        this.el._on(this.generate_events.start, this.start); //начинаем слушать событие нажатия мыши и/или касания
        w._on('resize_throttle', this.get_min_and_max_px_swipe_distanse); //при ресайзе окна пересчитываем новые значение минимальных и максимальных дистанций для срабатывания свайпа
    }
    //начитает мониторинг свайпа после клика и/или тача на элементе

    //удаляем все события нужные для прослушивания свайпа
    remove_swipe_event() {}
    //удаляем все события нужные для прослушивания свайпа

    //генерируем имена событий для реализации отслеживания свайпа
    generate_events_name() {
        this.generate_events = {}; //содержит события нужные для генерации события свайпа

        this.generate_events.start = []; //тут будут храниться события которые будут вызываться для начала слушания свайпа mousedown touchstart
        this.generate_events.move = []; //тут будут храниться события которые будут вызываться во время движения указателя mousemove touchmove
        this.generate_events.finall = []; //тут будут храниться события которые будут вызываться во время окончания жеста mouseup touchend
        this.generate_events.leave = []; //тут будут храниться события которые будут вызываться в момент когда указатель покидает элемент или всевозможные ошибки mouseleave touchcancel

        //формируем нужные имена событий
        if (this.settings.touch_swipe) {
            this.generate_events.start.push('touchstart');
            this.generate_events.move.push('touchmove');
            this.generate_events.finall.push('touchend');
            this.generate_events.leave.push('touchcancel');
        }

        if (this.settings.mouse_swipe) {
            this.generate_events.start.push('mousedown');
            this.generate_events.move.push('mousemove');
            this.generate_events.finall.push('mouseup');
            this.generate_events.leave.push('mouseleave');
        }
        //формируем нужные имена событий

        this.generate_events.start = this.generate_events.start.join(' ');
        this.generate_events.move = this.generate_events.move.join(' ');
        this.generate_events.finall = this.generate_events.finall.join(' ');
        this.generate_events.leave = this.generate_events.leave.join(' ');
    }
    //генерируем имена событий для реализации отслеживания свайпа

    //получаем максимально и минимально дупустимые растояния в пикселях для учёта свайпа
    get_min_and_max_px_swipe_distanse() {
        let el_width = parseFloat(w.getComputedStyle(this.el).width),
            el_height = parseFloat(w.getComputedStyle(this.el).height);

        this.settings.min_px_dist_x = this.settings.min_px_dist_x || (el_width / 100) * this.settings.min_percent_dist_x;
        this.settings.max_px_dist_x = this.settings.max_px_dist_x || (el_width / 100) * this.settings.max_percent_dist_x;
        this.settings.min_px_dist_y = this.settings.min_px_dist_y || (el_height / 100) * this.settings.min_percent_dist_y;
        this.settings.max_px_dist_y = this.settings.max_px_dist_y || (el_height / 100) * this.settings.max_percent_dist_y;
    }
    //получаем максимально и минимально дупустимые растояния в пикселях для учёта свайпа

    //функция призвана остановить события браузера по умолчанию для click mousedown touchstart mousemove touchmove mouseup touchend mouseleave touchcancel
    remove_default(e) {
        e.preventDefault();
    }
    //функция призвана остановить события браузера по умолчанию для click mousedown touchstart mousemove touchmove mouseup touchend mouseleave touchcancel

    //стартует после нажатия клавиши мыши или касания пальца на элементе
    start() {
        let settings = this.swipe_event_data.settings;
        console.log(settings);
    }
    //стартует после нажатия клавиши мыши или касания пальца на элементе
}
//тут храним все необходимые данные для работы функций
const list_data = {
    swipe: [],
};
//тут храним все необходимые данные для работы функций

//ПРИМЕЧАНИЕ: не знаю почему но при движении нескольких точек по экрану в момент одновременного их события touchmove идентификаторы и соответсвенно события первого касание перекрывает более позние, тем самым переодически получаются глюки что когда движется второй палец браузер считает что движентся первый

//ВАЖНО: если к элементу применён слушатель swipe то все действия по умолчанию у элемента будут убраны (click mousedown touchstart mousemove touchmove mouseup touchend), а так же к одному элементу может быть привязано только ОДНО событие свайпа !!!
//el - элемент DOM
//settings - настройки для определения был ли данный жест свайпом
//add_listener - уесли функция вызвана с true значит мы добавляем слушатель данного события, если с false то удаляем
const swipe_event = {
    /*touchstart — начало касания, пользователь нажал на экран;
    touchmove — пользователь двигает пальцем по экрану;
    touchend — пользователь отпустил экран;
    touchcancel — отмена касания. Это событие срабатывает, если пользователь заходит за край страницы, переворачивает экран, сворачивает браузер и так далее.*/
    //срабатывает в момент подключения слушателя swipe к элементу
    init: function (el, settings, add_listener = true) {
        //если передано что нужно удалить слушатель
        //ПРИМЕЧАНИЕ: это используется когда мы отключаем слушатель события от элемента
        if (!add_listener) {
            let settings = swipe_event.get_settings(el); //настройки свайпа текущего элемента

            //функция удаляет прослушивание всех событий для обнаружения свайпа
            $(el).off({
                events: 'click ' + settings.start_events + ' ' + settings.move_events + ' ' + settings.finall_events + ' ' + settings.leave_events,
                callback: swipe_event.remove_default,
            }); //включаем события по умолчанию
            $(el).off({
                events: settings.start_events,
                callback: swipe_event.start,
            }); //отключаем прослушивани событий mousedown touchstart для функции start
            //функция удаляет прослушивание всех событий для обнаружения свайпа
            return; //прерываем дальнейщее выполнение функции
        }
        //если передано что нужно удалить слушатель

        // настройки по умолчанию
        let default_settings = {
            touch_swipe: true, //отслеживать свайп на сенсорных устройствах
            mouse_swipe: true, //отслеживать свайп на устройствах с мышкой
            min_percent_dist_x: 2, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в % от ширины экрана
            max_percent_dist_x: 90, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от ширины экрана
            min_percent_dist_y: 2, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от высоты экрана
            max_percent_dist_y: 90, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от высоты экрана
            min_px_dist_x: null, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в пикселях px
            max_px_dist_x: null, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            min_px_dist_y: null, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            max_px_dist_y: null, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            min_time: 50, //минимальное время, за которое должен быть совершен свайп (ms)
            max_time: 1000, //максимальное время, за которое должен быть совершен свайп (ms)
            allow_leave: true, //считать ли жесты при которых указатель покидал границы элемента свайпом, если false то если указатиль покинул границы элемента свайп не будет засчитан
            remove_default_events: true, //убирать ли события click mousedown touchstart mousemove touchmove mouseup touchend mouseleave touchcancel по умолчанию для элемента
            /*callback_success: () => console.log("SUCCESS"), //функция которая будет вызвана если жест над элементом был свайпом, тоже самое что и срабатывае события, но выполяняется раньше чем событие будет инициализированно, а следоовательно запустится раньше чем те функции которые прикреплены к событию swipe
            callback_fail: () => console.log("FAIL"), //функция которая будет вызвана если жест над элементом не был свайпом
            callback_finally: () => console.log("FINALLY"), //функция которая будет вызвана по завершенни проверки действия на свайп, вне зависимости как завершилась проверка
            callback_start: () => console.log("START"), //функция которая будет вызвана каждый раз при старте свайпа, когда указатель нажали
            callback_move: () => console.log("MOVE"), //функция которая будет вызвана каждый раз в момент движения указателя
            callback_leave: () => console.log("LEAVE"), //функция которая будет вызвана когдя указатель  покинет элемент или будет ошибка регистрации указателя*/
            callback_success: () => {},
            callback_fail: () => {},
            callback_finally: () => {},
            callback_start: () => {},
            callback_move: () => {},
            callback_leave: () => {},
            el: el, //элемент на котором изначально было привязано событие свайпа
            terget_el: null, //элемент который является целевым в данные момент времени, т.е. в начале это элемент по кторому кликнули потом элементы по которым движется курсор, вконце элемент над которым отпустили мышку, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале
            start_terget_el: null, //элемент на котором начат свайп, т.е. нажали мышь или палец
            finall_target_el: null, //элемент на котором окончен свайп, т.е. отпустили кнопку мыши или палец, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале
            direction: '', //направление свайпа
            start_direction: null, //начальное направление свайпа, для того чтоб понять куда изначально элемент начали смещать
            some_touches: false, //если true то будет регистрировать свайп даже при нескольких точках касания на сансорном экране (вне целевого элемента!!!), и как следствие сможет обрабатывать несколько разных свайпов или других сенсорных событий для разных элементов одновременно
            touch_identifier: null, //ВАЖНО: это для избежаения ошибки иногда индентификаторы путаются местами и получается глюки, не знаю почему так происходит, но сверяем идентификаторы мы именно чтоб избежать багов
            permission_directions: {
                top: true,
                right: true,
                bottom: true,
                left: true,
            }, //направления в которых нужно учитывать свайп
            permission_mouse_buttons: {
                1: true, //левая
                2: false, //центральная
                3: false, //правая
            }, //какие кнопки мыши учитывать при свайпе
            start_time: 0, //время начало свайпа
            total_time: 0, //сколько времени занял свайп
            start_x: 0, //позиция точки нажатия в самом начале по горизонтали
            start_y: 0, //позиция точки нажатия в самом начале по вертикали
            x: 0, //будет хранить изменяемую позицию точки нажатия при перемещении по горизонтали
            y: 0, //будет хранить изменяемую позицию точки нажатия при перемещении по вертикали
            x_dist: 0, //дистанция проейдаеная по горизонтали
            y_dist: 0, //дистанция проейдаеная по вертикали
            abort_swipe_fail: false, //может быть использованно для принудительного прерывания свайпа как неудачный
        };
        // настройки по умолчанию

        settings = Object.assign({}, default_settings, settings); // настройки по умолчанию объединяем и заменяем настройками пользователя

        if (!settings.touch_swipe && !settings.mouse_swipe) return; //если не указан ни один тип устройства для мониторинга свайпа завершаем инициализацию прослушивания свайпа

        settings.start_events = ''; //тут будут храниться события которые будут вызываться для начала слушания свайпа mousedown touchstart
        settings.move_events = ''; //тут будут храниться события которые будут вызываться во время движения указателя mousemove touchmove
        settings.finall_events = ''; //тут будут храниться события которые будут вызываться во время окончания жеста mouseup touchend
        settings.leave_events = ''; //тут будут храниться события которые будут вызываться в момент когда указатель покидает элемент или всевозможные ошибки mouseleave touchcancel

        //формируем нужные имена событий
        if (settings.touch_swipe) {
            settings.start_events += settings.start_events.length > 0 ? ' touchstart' : 'touchstart';
            settings.move_events += settings.move_events.length > 0 ? ' touchmove' : 'touchmove';
            settings.finall_events += settings.finall_events.length > 0 ? ' touchend' : 'touchend';
            settings.leave_events += settings.leave_events.length > 0 ? ' touchcancel' : 'touchcancel';
        }

        if (settings.mouse_swipe) {
            settings.start_events += settings.start_events.length > 0 ? ' mousedown' : 'mousedown';
            settings.move_events += settings.move_events.length > 0 ? ' mousemove' : 'mousemove';
            settings.finall_events += settings.finall_events.length > 0 ? ' mouseup' : 'mouseup';
            settings.leave_events += settings.leave_events.length > 0 ? ' mouseleave' : 'mouseleave';
        }
        //формируем нужные имена событий

        //получаем максимально и минимально дупустимые растояния в пикселях для учёта свайпа
        let el_width = $(el).width(),
            el_height = $(el).height();

        settings.min_px_dist_x = settings.min_px_dist_x === null ? (el_width / 100) * settings.min_percent_dist_x : settings.min_px_dist_x;
        settings.max_px_dist_x = settings.max_px_dist_x === null ? (el_width / 100) * settings.max_percent_dist_x : settings.max_px_dist_x;
        settings.min_px_dist_y = settings.min_px_dist_y === null ? (el_height / 100) * settings.min_percent_dist_y : settings.min_px_dist_y;
        settings.max_px_dist_y = settings.max_px_dist_y === null ? (el_height / 100) * settings.max_percent_dist_y : settings.max_px_dist_y;
        //получаем максимально и минимально дупустимые растояния в пикселях для учёта свайпа

        //записываем в глобальный список данные этого элемента
        list_data.swipe.push({
            element: el,
            settings: settings,
        });
        //записываем в глобальный список данные этого элемента

        //w.getEventListeners($(".top_banner_wrap")[0])

        //отключаем события по умолчанию если задано в настройках
        if (settings.remove_default_events) {
            $(el).on({
                events: 'click ' + settings.start_events + ' ' + settings.move_events + ' ' + settings.finall_events + ' ' + settings.leave_events,
                callback: swipe_event.remove_default,
                options_event: { passive: false },
            });
        }
        //отключаем события по умолчанию если задано в настройках

        $(el).on({ events: settings.start_events, callback: swipe_event.start }); //начинаем слушать событие нажатия мыши и/или касания
        $(w).on({ events: 'resize_optimize', callback: swipe_event.resize_recalculete }); //он добавляется и его НЕ нужно удалять
    },
    //срабатывает в момент подключения слушателя swipe к элементу

    //при ресайзе пересчитываем максимальные и минимальные длинны свайпа в пикселях
    resize_recalculete: function () {
        for (let i = 0; i < list_data.swipe.length; i++) {
            let settings = list_data.swipe[i].settings,
                el_width = $(settings.el).width(),
                el_height = $(settings.el).height();

            settings.min_px_dist_x = (el_width / 100) * settings.min_percent_dist_x;
            settings.max_px_dist_x = (el_width / 100) * settings.max_percent_dist_x;
            settings.min_px_dist_y = (el_height / 100) * settings.min_percent_dist_y;
            settings.max_px_dist_y = (el_height / 100) * settings.max_percent_dist_y;
        }
    },
    //при ресайзе пересчитываем максимальные и минимальные длинны свайпа в пикселях

    //ищем текущий элемент с его настройками для свайпа
    get_settings: function (el) {
        for (let i = 0; i < list_data.swipe.length; i++) {
            if (list_data.swipe[i].element === el) {
                return list_data.swipe[i].settings;
            }
        }
    },
    //ищем текущий элемент с его настройками для свайпа

    //проверяем сколько точек касания на экране и какая кнопка мыши нажата
    check_touch_and_mouses_buttons: function (e, settings) {
        /*touches: список всех точек соприкосновения пальцев с экраном.
        targetTouches: список всех точек соприкосновения с текущим элементом DOM.
        changedTouches: список всех точек соприкосновения, участвующих в текущем событии. Например, в случае события touchend это будет точка, в которой пользователь убрал палец с экрана.*/

        if (typeof e.touches !== 'undefined' && e.targetTouches.length > 1) return false; //если экран сенсорный экран и на данном элементе уже есть касание то мы игнорируем все остальные касание по данному элементу

        let event = swipe_event.events_props(e); //получаем объект с событиями для текущего типа устройства

        if (typeof event.which !== 'undefined' && !settings.permission_mouse_buttons[event.which]) return false; // игнорирование нажатие неразрешённых кнопок мыши

        return event;
    },
    //проверяем сколько точек касания на экране и какая кнопка мыши нажата

    //стартует после нажатия клавиши мыши или касания пальца на элементе
    start: function (e) {
        //this элемент до которого дошло всплытие события, т.е. element.addEventListener(type, test) в данном случае если клик был по любому дочернему элементу element или нему самому , то в this будет этот element на котором вызвано слушанье события
        let settings = swipe_event.get_settings(this); //настройки свайпа текущего элемента

        settings.start_time = Math.round(performance.now()); //время начало свайпа

        if (typeof e.touches !== 'undefined' && !settings.some_touches && e.touches.length > 1) return; //для сенсорных экранов и если запрещено более чем одно сенсорное соприкосновение с экраном и на экране сейчас более одного касания

        let event = swipe_event.check_touch_and_mouses_buttons(e, settings); //вернёт объект события или false если указатель не прошёл проверку

        if (typeof event.identifier !== 'undefined') settings.touch_identifier = event.identifier; //ВАЖНО: это для избежаения ошибки иногда индентификаторы путаются местами и получается глюки, не знаю почему так происходит, но сверяем идентификаторы мы именно чтоб избежать багов

        if (!event) return; //если указатель не прошёл проврку, больше одного касания или не разрешённая кнопка миши

        settings.start_x = event.pageX; //записываем стартовое положение точки нажатия на документе
        settings.start_y = event.pageY; //записываем стартовое положение точки нажатия на документе

        settings.x = event.pageX; //записываем текущее положение точки нажатия на документе
        settings.y = event.pageY; //записываем текущее положение точки нажатия на документе

        //добаляем слушатели в зависимости от типов устройств для которых свайп будет отслеживаться
        $(settings.el).on({ events: settings.move_events, callback: swipe_event.move, options_event: { passive: false } }); //добавляем слушатель события для перемещения курсора или пальца
        $(settings.el).on({ events: settings.finall_events, callback: swipe_event.finall, options_event: { passive: false } }); //добавляем слушатель события когда кнопка мыши отпущена или палец поднят
        $(settings.el).on({ events: settings.leave_events, callback: swipe_event.leave, options_event: { passive: false } }); //добавляем слушатель события курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на сенсоре
        //добаляем слушатели в зависимости от типов устройств для которых свайп будет отслеживаться

        settings.start_terget_el = event.target; //записываем элемент на котором было нажатие

        settings.start_direction = null; //сбрасаваем стартовое направление свайпа

        settings.callback_start();
    },
    //стартует после нажатия клавиши мыши или касания пальца на элементе

    //перемещения курсора или пальца
    move: function (e) {
        let settings = swipe_event.get_settings(this), //настройки свайпа текущего элемента
            event = swipe_event.check_touch_and_mouses_buttons(e, settings); //вернёт объект события или false если не указатель не прошёл проверку

        if (typeof event.identifier !== 'undefined' && settings.touch_identifier !== event.identifier) return; //ВАЖНО: это для избежаения ошибки иногда индентификаторы путаются местами и получается глюки, не знаю почему так происходит, но сверяем идентификаторы мы именно чтоб избежать багов
        if (!event) {
            swipe_event.end(false, settings);
            return; //если указатель не прошёл проврку, больше одного касания или не разрешённая кнопка миши
        }

        //если через калбеки было прервано выполение свайпа
        if (settings.abort_swipe_fail) {
            swipe_event.end(false, settings);
            return;
        }

        settings.terget_el = event.target; //записываем элемент над которым проходит сейчас указатель, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале

        settings.x = event.pageX; //записываем текущее положение точки нажатия на документе
        settings.y = event.pageY; //записываем текущее положение точки нажатия на документе

        //определяем изначальное напрвление свайпа
        if (!settings.start_direction) {
            let x_dist = Math.abs(settings.x - settings.start_x), //получаем на сколько пикселей было смещение по горизонтали
                y_dist = Math.abs(settings.y - settings.start_y); //получаем на сколько пикселей было смещение по вертикали

            //нужно чтоб разница в смещении сталь хоть немного существенной что +- точно пределить направление свайпа и отсеять ложные напраления
            if (Math.abs(x_dist - y_dist) > 3) {
                if (x_dist > y_dist) {
                    if (settings.x > settings.start_x) {
                        settings.start_direction = 'right';
                    } else {
                        settings.start_direction = 'left';
                    }
                } else if (x_dist < y_dist) {
                    if (settings.y > settings.start_y) {
                        settings.start_direction = 'bottom';
                    } else {
                        settings.start_direction = 'top';
                    }
                }
            }
        }
        //определяем изначальное напрвление свайпа

        settings.callback_move();
    },
    //перемещения курсора или пальца

    //курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на сенсоре
    leave: function (e) {
        let settings = swipe_event.get_settings(this), //настройки свайпа текущего элемента
            result = swipe_event.analiz_swipe(settings), //определяем соответствует ли жест свайпу
            event = swipe_event.check_touch_and_mouses_buttons(e, settings); //вернёт объект события или false если не указатель не прошёл проверку

        if (!event) {
            swipe_event.end(false, settings);
            return; //если указатель не прошёл проврку, больше одного касания или не разрешённая кнопка миши
        }

        settings.finall_target_el = settings.el;

        settings.callback_leave();

        settings.allow_leave ? swipe_event.end(result, settings) : swipe_event.end(false, settings); //передаём в конечный обработчик end результат проверки был ли это свайп если разрешено покидать элемент при свайпе
    },
    //курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на сенсоре

    //будет вызвана когда указатель будет отпущен
    finall: function (e) {
        let settings = swipe_event.get_settings(this), //настройки свайпа текущего элемента
            result = swipe_event.analiz_swipe(settings), //определяем соответствует ли жест свайпу
            event = swipe_event.check_touch_and_mouses_buttons(e, settings); //вернёт объект события или false если не указатель не прошёл проверку

        if (!event) {
            swipe_event.end(false, settings);
            return; //если указатель не прошёл проврку, больше одного касания или не разрешённая кнопка миши
        }

        settings.finall_target_el = event.target; //записываем элемент над которым отпустили указатель, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале
        swipe_event.end(result, settings); //анализируем жест и результат передаём в завершающую функцию
    },
    //будет вызвана когда указатель будет отпущен

    //завершаем обработку события
    end: function (result, settings) {
        swipe_event.clean(settings); //функция чистит все ненужные слушатели после того как указатель убран

        if (result) {
            //свайп
            settings.callback_success();
            swipe_event.run_event(settings);
        } else {
            //не свайп
            settings.callback_fail();
        }

        settings.callback_finally();
    },
    //завершаем обработку события

    //возвращает объект со списком свойств текущего события для текущего устройства
    events_props: function (e) {
        if (typeof e.touches !== 'undefined') {
            let event = null;
            //перебираем события данного типа (touchemove например) которые происходят в данный момент
            for (let i = 0; i < e.changedTouches.length; i++) {
                let changed_id = e.changedTouches[i].identifier; //для каждого события получаем идентификатор касание который его вызвал

                //перебираем события которые применяются конкретно к этому элементу в данный момент времени
                for (let b = 0; b < e.targetTouches.length; b++) {
                    let target_id = e.changedTouches[b].identifier; //для каждого события получаем идентификатор касание который его вызвал
                    if (changed_id === target_id) event = e.changedTouches[b]; //находи те касания которые применяются к текущему элементу и соответствуют текущему событию
                }
                //перебираем события которые применяются конкретно к этому элементу в данный момент времени
            }
            //перебираем события данного типа (touchemove например) которые происходят в данный момент

            if (event === null) return e.changedTouches[0]; //для touchend

            return event;
        } else {
            return e;
        }
    },
    //возвращает объект со списком свойств текущего события для текущего устройства

    //функция чистит все ненужные слушатели
    clean: function (settings) {
        $(settings.el).off({
            events: settings.move_events,
            callback: swipe_event.move,
        }); //удаляем слушатель события для перемещения курсора или пальца
        $(settings.el).off({
            events: settings.finall_events,
            callback: swipe_event.finall,
        }); //удаляем слушатель события когда кнопка мыши отпущена или палец поднят
        $(settings.el).off({
            events: settings.leave_events,
            callback: swipe_event.leave,
        }); //удаляем слушатель курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на
    },
    //функция чистит все ненужные слушатели

    //оцениваем жест как свайп
    analiz_swipe: function (settings) {
        settings.x_dist = Math.abs(settings.x - settings.start_x); //получаем на сколько пикселей было смещение по горизонтали
        settings.y_dist = Math.abs(settings.y - settings.start_y); //получаем на сколько пикселей было смещение по вертикали

        settings.total_time = Math.round(performance.now() - settings.start_time); //сколько времени длился свайп

        //проверяем не превышено ли время разрешённое на свайп
        if (settings.total_time < settings.min_time || settings.total_time > settings.max_time) {
            console.log('NO swipe timeout');
            return false;
        }
        //проверяем не превышено ли время разрешённое на свайп

        //спайп по горизонтали
        if (settings.x_dist >= settings.y_dist) {
            //если дистанция свайпа больше минимально счиаемой дистанции и меньше максимальной дистации
            if (settings.x_dist >= settings.min_px_dist_x && settings.x_dist <= settings.max_px_dist_x) {
                if (settings.x > settings.start_x) {
                    settings.direction = 'right';
                    console.log('RIGHT swipe');
                    return settings.permission_directions.right ? true : false;
                } else {
                    settings.direction = 'left';
                    console.log('LEFT swipe');
                    return settings.permission_directions.left ? true : false;
                }
            }
            //если дистанция свайпа больше минимально счиаемой дистанции и меньше максимальной дистации

            //пройдена слишком маленькая дистация
            else {
                console.log('NO swipe distance x');
                return false;
            }
            //пройдена слишком маленькая дистация
        }
        //спайп по горизонтали

        //спайп по вертикали
        else {
            //если дистанция свайпа больше минимально счиаемой дистанции и меньше максимальной дистации
            if (settings.y_dist >= settings.min_px_dist_y && settings.y_dist <= settings.max_px_dist_y) {
                if (settings.y > settings.start_y) {
                    settings.direction = 'bottom';
                    console.log('BOTTOM swipe');
                    return settings.permission_directions.bottom ? true : false;
                } else {
                    settings.direction = 'top';
                    console.log('TOP swipe');
                    return settings.permission_directions.top ? true : false;
                }
            }
            //если дистанция свайпа больше минимально счиаемой дистанции и меньше максимальной дистации

            //пройдена слишком маленькая дистация
            else {
                console.log('NO swipe distance y');
                return false;
            }
            //пройдена слишком маленькая дистация
        }
        //спайп по вертикали
    },
    //оцениваем жест как свайп

    remove_default: function (e) {
        e.preventDefault();
    }, //функция призвана остановить события браузера по умолчанию для тех элементов и событий к которым она вызвана

    //запускаем привязку события
    run_event: function (settings) {
        //данные которые будут переданы в событие
        let data = {
                direction: settings.direction,
                x_dist: settings.x_dist,
                y_dist: settings.y_dist,
                total_time: settings.total_time,
            },
            //данные которые будут переданы в событие

            //создаём кастомное событие
            swipeEvent = new CustomEvent('swipe', {
                bubbles: true, //если true то все его родительские элменты у которых есть слушатели события свайпа будут тоже вызваны
                detail: data,
            });
        //создаём кастомное событие

        settings.el.dispatchEvent(swipeEvent); //привязываем событие к элементу
    },
    //запускаем привязку события
};
//функция реализует событие свайпа
