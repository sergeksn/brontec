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
                bubbles: true,
                cancelable: true,
                detail: data,
            });
        //создаём кастомное событие

        settings.el.dispatchEvent(swipeEvent); //привязываем событие к элементу
    },
    //запускаем привязку события
};
//функция реализует событие свайпа

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
        initiator: swipe_event.init,
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
