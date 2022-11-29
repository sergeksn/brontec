import { custom_events_list } from './custom-events.js';

//ВАЖНО: если к элементу применён слушатель swipe то все действия по умолчанию у элемента будут убраны (click mousedown touchstart mousemove touchmove mouseup touchend), а так же к одному элементу может быть привязано только ОДНО событие свайпа !!!
export default class {
    constructor(params) {
        this.el = params.element; //текущий элемент для отслеживания свайпа

        // настройки по умолчанию
        this.settings = {
            touch_swipe: true, //отслеживать свайп на сенсорных устройствах
            mouse_swipe: true, //отслеживать свайп на устройствах с мышкой
            min_percent_dist_x: 2, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в % от ширины экрана
            max_percent_dist_x: 100, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от ширины экрана
            min_percent_dist_y: 2, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от высоты экрана
            max_percent_dist_y: 100, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в % от высоты экрана
            //min_px_dist_x: undefined, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в пикселях px
            //max_px_dist_x: undefined, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            //min_px_dist_y: undefined, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            //max_px_dist_y: undefined, //максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп в пикселях px
            min_time: 50, //минимальное время, за которое должен быть совершен свайп (ms)
            max_time: 1000, //максимальное время, за которое должен быть совершен свайп (ms)
            allow_leave: true, //считать ли жесты при которых указатель покидал границы элемента свайпом, если false то если указатиль покинул границы элемента свайп не будет засчитан
            /*callback_success: () => console.log("SUCCESS"), //функция которая будет вызвана если жест над элементом был свайпом, тоже самое что и срабатывае события, но выполяняется раньше чем событие будет инициализированно, а следоовательно запустится раньше чем те функции которые прикреплены к событию swipe
            callback_faill: () => console.log("FAIL"), //функция которая будет вызвана если жест над элементом не был свайпом
            callback_finally: () => console.log("FINALLY"), //функция которая будет вызвана по завершенни проверки действия на свайп, вне зависимости как завершилась проверка
            callback_start: () => console.log("START"), //функция которая будет вызвана каждый раз при старте свайпа, когда указатель нажали
            callback_move: () => console.log("MOVE"), //функция которая будет вызвана каждый раз в момент движения указателя
            callback_leave: () => console.log("LEAVE"), //функция которая будет вызвана когдя указатель  покинет элемент или будет ошибка регистрации указателя*/
            terget_el: null, //элемент который является целевым в данные момент времени, т.е. в начале это элемент по кторому кликнули потом элементы по которым движется курсор, вконце элемент над которым отпустили мышку, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале
            start_terget_el: null, //элемент на котором начат свайп, т.е. нажали мышь или палец
            finall_target_el: null, //элемент на котором окончен свайп, т.е. отпустили кнопку мыши или палец, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале
            direction: null, //направление свайпа
            start_direction: null, //начальное направление свайпа, для того чтоб понять куда изначально элемент начали смещать
            touch_identifier: null, //ВАЖНО: это для избежаения ошибки иногда индентификаторы путаются местами и получается глюки, не знаю почему так происходит, но сверяем идентификаторы мы именно чтоб избежать багов
            permission_directions: {
                top: true,
                right: true,
                bottom: true,
                left: true,
            }, //направления в которых нужно учитывать свайп
            permission_click_buttons: {
                0: true, //будет при сенсорном нажатии
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
            abort_swipe_faill: false, //может быть использованно для принудительного прерывания свайпа как неудачный
            max_ugol: 30, //максимальный угол смещения свайпа от изначальной прямой его направления
            exceptions_el: [],//хранит массив с элементами исключений, если свайп начался на этих элементах то от будет сразуже прерван
            find_exceptions_el: false,//индикатор того найдены ли элементы исключения или нет
        };
        // настройки по умолчанию

        Object.assign(this.settings, params.custom_settings); // настройки по умолчанию объединяем и заменяем настройками пользователя

        if (!this.settings.touch_swipe && !this.settings.mouse_swipe) return; //если не указан ни один тип устройства для мониторинга свайпа завершаем инициализацию прослушивания свайпа

        this.generate_events_name(); //генерируем имена событий для реализации отслеживания свайпа

        if (!params.listener_action) return this.remove_swipe_event(); //если передано что нужно удалить слушатель

        if (this.el.swipe_event_data) return console.error('На элементе может быть только одно событие свайпа'); //если у элемента уже есть слушатель свайпа то прерываем выполнение

        this.el.swipe_event_data = this; //создаём свойство с данными для свайпа

        this.get_min_and_max_px_swipe_distanse(); //получаем максимально и минимально дупустимые растояния в пикселях для учёта свайпа

        this.run_observe_swipe(); //начитает отслеживание свайпа после клика и/или тача на элементе
    }

    //начитает отслеживание свайпа после клика и/или тача на элементе
    run_observe_swipe() {
        this.el._on(this.generate_events.start, this.start); //начинаем слушать событие нажатия мыши и/или касания

        this.el.swipe_event_data.resize_support_event = this.get_min_and_max_px_swipe_distanse.bind(this); //сохранеям слушатель ресайза через bind чтоб передать в него нужый this и записываем его в свойства элемента для возможности дальнейшей отмены

        w._on('resize_throttle', this.el.swipe_event_data.resize_support_event); //при ресайзе окна пересчитываем новые значение минимальных и максимальных дистанций для срабатывания свайпа
    }
    //начитает отслеживание свайпа после клика и/или тача на элементе

    //удаляем все события нужные для прослушивания свайпа
    remove_swipe_event() {
        this.el._off(this.generate_events.start, this.start); //заверщаем слушать событие нажатия мыши и/или касания

        w._off('resize_throttle', this.el.swipe_event_data.resize_support_event); //снимаем слашатель с ресайза окна
    }
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
        e.cancelable && e.preventDefault(); //ВАЖНО: отменяем по умолчанию только если данное событие может быть отменено иначе будут предупреждения
    }
    //функция призвана остановить события браузера по умолчанию для click mousedown touchstart mousemove touchmove mouseup touchend mouseleave touchcancel

    //проверяем сколько точек касания на экране и какая кнопка мыши нажата
    check_touch_and_mouses_buttons(e, settings) {
        /*touches: список всех точек соприкосновения пальцев с экраном.
            targetTouches: список всех точек соприкосновения с текущим элементом DOM.
            changedTouches: список всех точек соприкосновения, участвующих в текущем событии. Например, в случае события touchend это будет точка, в которой пользователь убрал палец с экрана.*/

        if (e.touches && (e.touches.length > 1 || e.targetTouches.length > 1)) return false; //если экран сенсорный экран и если на экране сейчас более одного касания или на данном элементе уже есть касание то мы игнорируем все остальные касание по данному элементу

        if (e.which && !settings.permission_click_buttons[e.which]) return false; // игнорирование нажатие неразрешённых кнопок
    }
    //проверяем сколько точек касания на экране и какая кнопка мыши нажата

    //проверяет не является ли в данный момент целевой объект исключением
    check_premision_el(data, e) {
        let s = data.settings,
            ex_el = s.exceptions_el;

        e = e.touches === undefined ? e : e.touches[0];

        for (let i = 0; i < ex_el.length; i++) {
            let result = [],
                find_childs = el => {
                    result.push(el);
                    [...el.children].forEach(item => find_childs(item));
                };

            find_childs(ex_el[i]);

            if (result.includes(e.target)) {
                //если исключение нашли
                s.find_exceptions_el = true;
                break;
            }
        }

        if (s.find_exceptions_el) return false; //если исключение нашли

        data.el._on(`click ${data.generate_events.start} ${data.generate_events.move} ${data.generate_events.finall} ${data.generate_events.leave}`, data.remove_default, { passive: false }); //отключаем события по умолчанию для вспомогательных событий

        return true;
    }
    //проверяет не является ли в данный момент целевой объект исключением

    //стартует после нажатия клавиши мыши или касания пальца на элементе
    start(e) {
        //в this будет этот element на котором вызвано слушанье события
        let data = this.swipe_event_data,
            s = data.settings,
            el = data.el; //целевой элемент

            //делаем сброс настроек которые моглы быть изменены в предидущем свайпе
            s.start_direction = null; //сбрасаваем стартовое направление свайпа
            s.find_exceptions_el = false; //сбрасываем индикатор обнаруженных исключений

        if (!data.check_premision_el(data, e)) return data.end(false, el); //если кликнули на элемент исключения завершаем, т.к. этот жест нельзя рассматривать как свайп

        s.start_time = Math.round(performance.now()); //время начало свайпа

        if (this.swipe_event_data.check_touch_and_mouses_buttons(e, s) === false) return; //если указатель не прошёл проврку, больше одного касания или не разрешённая кнопка

        e = e.touches === undefined ? e : e.touches[0];

        s.start_x = e.pageX; //записываем стартовое положение точки нажатия на документе
        s.start_y = e.pageY; //записываем стартовое положение точки нажатия на документе

        s.x = e.pageX; //записываем текущее положение точки нажатия на документе
        s.y = e.pageY; //записываем текущее положение точки нажатия на документе

        el._on(this.swipe_event_data.generate_events.move, this.swipe_event_data.move, { passive: false }); //добавляем слушатель события для перемещения курсора или пальца

        el._on(this.swipe_event_data.generate_events.finall, this.swipe_event_data.finall, { passive: false }); //добавляем слушатель события когда кнопка мыши отпущена или палец поднят

        el._on(this.swipe_event_data.generate_events.leave, this.swipe_event_data.leave, { passive: false }); //добавляем слушатель события курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на сенсоре

        s.start_terget_el = e.target; //записываем элемент на котором было нажатие

        s.callback_start && s.callback_start(el.swipe_event_data);
    }
    //стартует после нажатия клавиши мыши или касания пальца на элементе

    //перемещения курсора или пальца
    move(e) {
        //в this будет этот element на котором вызвано слушанье события
        let s = this.swipe_event_data.settings,
            el = this.swipe_event_data.el; //целевой элемент

        if (el.swipe_event_data.check_touch_and_mouses_buttons(e, s) === false || s.abort_swipe_faill) return el.swipe_event_data.end(false, el); //если указатель не прошёл проврку, больше одного касания или не разрешённая кнопка или если через калбеки было прервано выполение свайпа

        e = e.touches === undefined ? e : e.touches[0];

        s.terget_el = e.target; //записываем элемент над которым проходит сейчас указатель, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале

        s.x = e.pageX; //записываем текущее положение точки нажатия на документе
        s.y = e.pageY; //записываем текущее положение точки нажатия на документе

        //определяем изначальное напрвление свайпа если оно не определено
        if (!s.start_direction) {
            let x_dist = Math.abs(s.x - s.start_x), //получаем на сколько пикселей было смещение по горизонтали
                y_dist = Math.abs(s.y - s.start_y); //получаем на сколько пикселей было смещение по вертикали

            //нужно чтоб разница в смещении сталь хоть немного существенной чтоб +- точно определить направление свайпа и отсеять ложные напраления
            if (Math.abs(x_dist - y_dist) > 3) {
                if (x_dist > y_dist) {
                    if (s.x > s.start_x) {
                        s.start_direction = 'right';
                    } else {
                        s.start_direction = 'left';
                    }
                } else if (x_dist < y_dist) {
                    if (s.y > s.start_y) {
                        s.start_direction = 'bottom';
                    } else {
                        s.start_direction = 'top';
                    }
                }
            }
        }
        //определяем изначальное напрвление свайпа если оно не определено

        s.callback_move && s.callback_move(el.swipe_event_data);
    }
    //перемещения курсора или пальца

    //курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на сенсоре
    leave(e) {
        //в this будет этот element на котором вызвано слушанье события
        let s = this.swipe_event_data.settings,
            el = this.swipe_event_data.el; //целевой элемент

        if (el.swipe_event_data.check_touch_and_mouses_buttons(e, s) === false || s.abort_swipe_faill) return el.swipe_event_data.end(false, el); //если указатель не прошёл проврку, больше одного касания или не разрешённая кнопка или если через калбеки было прервано выполение свайпа

        s.finall_target_el = s.el;

        s.callback_leave && s.callback_leave(el.swipe_event_data);

        s.allow_leave ? this.swipe_event_data.end(this.swipe_event_data.analiz_swipe(s), el) : this.swipe_event_data.end(false, el); //передаём в конечный обработчик end результат проверки был ли это свайп если разрешено покидать элемент при свайпе
    }
    //курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на сенсоре

    //будет вызвана когда указатель будет отпущен
    finall(e) {
        //в this будет этот element на котором вызвано слушанье события
        let s = this.swipe_event_data.settings,
            el = this.swipe_event_data.el; //целевой элемент

        if (el.swipe_event_data.check_touch_and_mouses_buttons(e, s) === false || s.abort_swipe_faill) return el.swipe_event_data.end(false, el); //если указатель не прошёл проврку, больше одного касания или не разрешённая кнопка или если через калбеки было прервано выполение свайпа

        e = e.touches === undefined ? e : e.changedTouches[0]; //для touchend

        s.finall_target_el = e.target; //записываем элемент над которым отпустили указатель, не особо работает для сенсорых экранов там почему-то всего элемент который мы нажали вначале
        this.swipe_event_data.end(this.swipe_event_data.analiz_swipe(s), el); //анализируем жест и результат передаём в завершающую функцию
    }
    //будет вызвана когда указатель будет отпущен

    //завершаем обработку события
    end(result, el) {
        let data = el.swipe_event_data,
            s = data.settings;

        data.clean(el); //функция чистит все ненужные слушатели и настройки после того как указатель убран

        if (result) {
            //свайп
            s.callback_success && s.callback_success(data);
            el.dispatchEvent(custom_events_list.swipe.event); //вызываем событие на элементе
        } else {
            //не свайп
            s.callback_faill && s.callback_faill(data);
        }

        s.callback_finally && s.callback_finally(data);
    }
    //завершаем обработку события

    //функция чистит все ненужные слушатели
    clean(el) {
        let data = el.swipe_event_data,
            events = data.generate_events;

        el._off(`click ${events.start} ${events.move} ${events.finall} ${events.leave}`, data.remove_default, { passive: false }); //возвращаем события по умолчанию для вспомогательных событий

        el._off(events.move, data.move); //удаляем слушатель события для перемещения курсора или пальца

        el._off(events.finall, data.finall); //удаляем слушатель события когда кнопка мыши отпущена или палец поднят

        el._off(events.leave, data.leave); //удаляем слушатель курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на
    }
    //функция чистит все ненужные слушатели

    //оцениваем жест как свайп
    analiz_swipe(s) {
        s.x_dist = Math.abs(s.x - s.start_x); //получаем на сколько пикселей было смещение по горизонтали
        s.y_dist = Math.abs(s.y - s.start_y); //получаем на сколько пикселей было смещение по вертикали

        s.total_time = Math.round(performance.now() - s.start_time); //сколько времени длился свайп

        //проверяем не превышено ли время разрешённое на свайп
        if (s.total_time < s.min_time || s.total_time > s.max_time) {
            //console.log('NO swipe timeout');
            return false;
        }
        //проверяем не превышено ли время разрешённое на свайп

        //функция проверяет угловое смещение для свайпа
        let check_ugol = catet => {
            let gipotinuza = Math.sqrt(Math.pow(s.x_dist, 2) + Math.pow(s.y_dist, 2)),
                s_ugol_sin = Math.sin((s.max_ugol * Math.PI) / 180);

            return s_ugol_sin >= catet / gipotinuza;
        };
        //функция проверяет угловое смещение для свайпа

        //спайп по горизонтали
        if (s.x_dist >= s.y_dist) {
            //если дистанция свайпа больше минимально счиаемой дистанции и меньше максимальной дистации
            if (s.x_dist >= s.min_px_dist_x && s.x_dist <= s.max_px_dist_x) {
                if (!check_ugol(s.y_dist)) return false; //если угол смещени превышает максимально допустимео значение

                if (s.x > s.start_x) {
                    s.direction = 'right';
                    //console.log('RIGHT swipe');
                    return s.permission_directions.right ? true : false;
                } else {
                    s.direction = 'left';
                    //console.log('LEFT swipe');
                    return s.permission_directions.left ? true : false;
                }
            }
            //если дистанция свайпа больше минимально счиаемой дистанции и меньше максимальной дистации

            //пройдена слишком маленькая дистация
            else {
                //console.log('NO swipe distance x');
                return false;
            }
            //пройдена слишком маленькая дистация
        }
        //спайп по горизонтали

        //спайп по вертикали
        else {
            //если дистанция свайпа больше минимально счиаемой дистанции и меньше максимальной дистации
            if (s.y_dist >= s.min_px_dist_y && s.y_dist <= s.max_px_dist_y) {
                if (!check_ugol(s.x_dist)) return false; //если угол смещени превышает максимально допустимео значение

                if (s.y > s.start_y) {
                    s.direction = 'bottom';
                    //console.log('BOTTOM swipe');
                    return s.permission_directions.bottom ? true : false;
                } else {
                    s.direction = 'top';
                    //console.log('TOP swipe');
                    return s.permission_directions.top ? true : false;
                }
            }
            //если дистанция свайпа больше минимально счиаемой дистанции и меньше максимальной дистации

            //пройдена слишком маленькая дистация
            else {
                //console.log('NO swipe distance y');
                return false;
            }
            //пройдена слишком маленькая дистация
        }
        //спайп по вертикали
    }
    //оцениваем жест как свайп
}
