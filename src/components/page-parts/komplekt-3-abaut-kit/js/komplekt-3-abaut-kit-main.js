import { px_to_px, adaptiv_size } from '@js-libs/func-kit';

let wrap = qs('.komplekt-3__kit-data-template-interactiv-img-wrap'),
    //getBoundingClientRect - не живая колекция, в отличии от getComputedStyle
    all_plusiki,
    CONTROLLER = {
        visible_time: 2000, //вреям видимости подсказуки в отсутствии наведеняи

        //скрывает все всплывающие подсказки и переводит плюсик в исходное состояние
        hide_all_pop_up: function () {
            all_plusiki.forEach(el => el.classList.remove('hovered', 'touched'));
            d._off('click', this.check_outside_ckick_function);
        },
        //скрывает все всплывающие подсказки и переводит плюсик в исходное состояние

        //инициализирует события необходимые для работыть события с мышкой при событии hover
        hoverd_init: function (el) {
            //при наведении мыши на элемент
            el._on('mouseenter', () => {
                clearTimeout(this.hide_timer); //удаляем старый таймер для закрытия подсказки
                this.hide_all_pop_up(); //закрываем все подсказки если вдруг были открыты

                el.classList.add('hovered'); //показываем подсказку

                d._on('click', this.check_outside_ckick_function); //если клик был вне плюсиков и подсказок закрываем, все подсказки
            });
            //при наведении мыши на элемент

            //когда мыш покидает элемент
            el._on('mouseleave', () => {
                //скрываем данную подсказку через интервал времени
                this.hide_timer = setTimeout(() => {
                    el.classList.remove('hovered');
                    d._off('click', this.check_outside_ckick_function); //если клик был вне плюсиков и подсказок закрываем, все подсказки
                }, this.visible_time);
                //скрываем данную подсказку через интервал времени
            });
            //когда мыш покидает элемент
        },
        //инициализирует события необходимые для работыть события с мышкой при событии hover

        //инициализирует событи для сенсорных экранов
        touched_init: function (el) {
            qs('.komplekt-3__kit-data-template-interactiv-img-wrap-plusik-icon', el)._on('touchend', () => {
                let is_touched = el.classList.contains('touched'); //записываем видна ли кликнутая подсказка
                
                this.hide_all_pop_up(); //закрываем все подсказки если вдруг были открыты

                //показываем или скрываем подсказку в зависимости от того видна она в данны момен или нет
                if(is_touched){
                    el.classList.remove('touched');
                } else{
                    el.classList.add('touched');
                    d._on('click', this.check_outside_ckick_function);
                }
                //показываем или скрываем подсказку в зависимости от того видна она в данны момен или нет

                
            });
        },
        //инициализирует событи для сенсорных экранов

        //функция задаёт позицию для окна подсказок в зависмости от размеров экрана, сверху или справа они будут позиционироваться
        set_pop_up_position: function () {
            all_plusiki.forEach(el => {
                let ww = GDS.win.width, //ширина окна браузера
                    pop_up = qs('.komplekt-3__kit-data-template-interactiv-img-wrap-plusik-pop-up', el), //окно с ссылкой
                    icon_plusik = qs('.komplekt-3__kit-data-template-interactiv-img-wrap-plusik-icon', el), //иконка плюсика в синей обводке
                    pop_up_data = pop_up.getBoundingClientRect(), //данныйе о позиции и размерах
                    pop_up_width = pop_up_data.width,
                    pop_up_height = pop_up_data.height,
                    icon_plusik_data = icon_plusik.getBoundingClientRect(), //данныйе о позиции и размерах
                    right_plus_position = icon_plusik_data.right, //крайняя правая позиция иконки плюсика относитеьно страницы
                    left_plus_position = icon_plusik_data.left,
                    icon_plusik_height = icon_plusik_data.height,
                    icon_plusik_width = icon_plusik_data.width,
                    margin = (() => {
                        let base_margin = w.matchMedia('(min-width:40rem)').matches ? px_to_px(30) : adaptiv_size(20, 320, 30, 640),
                            left_win_gap = left_plus_position,
                            right_win_gap = ww - right_plus_position;

                        if (left_win_gap >= base_margin && right_win_gap >= base_margin) return base_margin;

                        return left_win_gap >= right_win_gap ? right_win_gap : left_win_gap; //иногда плюсик может стояить так что выперает за пределы родителя, в этом случае вместо маргина мы бёрм растояние от плюсика до края окна браузера
                    })(), //получаем минимальное растояние от края окна браузера до контента, выше 30 можно не расчитывать, т.к. меньше уже не будет
                    gap = w.matchMedia('(min-width:120rem)').matches ? adaptiv_size(10, 1920) : px_to_px(10), //зазор между плюсик и окном подсказки как по вертикали так и по горизонтали
                    right_space = ww - right_plus_position - margin, //разрешённое для заполнени пространство справа от подсказки
                    left_space = left_plus_position - margin; //разрешённое для заполнени пространство слева от подсказки

                //если элемент помещается для отображения справа
                if (right_space - gap > pop_up_width) {
                    pop_up.style.left = icon_plusik_width + gap + 'px'; //задаём позицию подсказки справа с отступом

                    pop_up.style.top = (icon_plusik_height - pop_up_height) / 2 + 'px'; //располагаем элемент точно по центру по вертикали, относительно плюсика
                }

                //если элемент не помещается для отображения справа, помещаем его сверху
                else {
                    pop_up.style.top = '-' + (pop_up_height + gap) + 'px'; //здвигаем подсказку выше над плюсиком

                    let max_smeshenie_gorisontal = pop_up_width / 2 - icon_plusik_width / 2; //в идеале подсказка должна быть так чтоб плюсик был чётко по центру, и это значение определяет максимальное смещение в сторону для этого эффекта

                    //если места слева больше или столько же сколько места справа
                    if (left_space >= right_space) {
                        pop_up.style.left = right_space >= max_smeshenie_gorisontal ? '-' + max_smeshenie_gorisontal + 'px' : right_space - max_smeshenie_gorisontal * 2 + 'px'; //если справа от подсказки хватает места то мы стараемся спозиционировать её так чтоб плюсик был по центру, если место меньше то мы сдвигаем подсказку левее
                    } else {
                        pop_up.style.left = left_space >= max_smeshenie_gorisontal ? '-' + max_smeshenie_gorisontal + 'px' : -left_space + 'px'; //если слева от подсказки хватает места то мы стараемся спозиционировать её так чтоб плюсик был по центру, если место меньше то мы сдвигаем подсказку правее
                    }
                }
            });
        },
        //функция задаёт позицию для окна подсказок в зависмости от размеров экрана, сверху или справа они будут позиционироваться

        //если клик был вне плюсиков и подсказок закрываем, все подсказки
        check_if_click_outside_plusik: function (e) {
            let path_elems = e.composedPath();

            (() => {
                for (let i = 0; i < all_plusiki.length; i++) {
                    if (path_elems.indexOf(all_plusiki[i]) !== -1) return false; //клик был хотябы по одному плюсику или его потомку
                }

                return true; //можно закрывать клик был вне наших плюсиков и подсказок
            })() && this.hide_all_pop_up(); //закрываем все подсказки
        },
        //если клик был вне плюсиков и подсказок закрываем, все подсказки

        init: function () {
            if (!wrap) return; //если на этой странице нет такого модуля

            all_plusiki = qsa('.komplekt-3__kit-data-template-interactiv-img-wrap-plusik', wrap); //все интерактивные элементы плюсиков

            this.set_pop_up_position(); //позиционируем всплывающие подсказки
            w._on('resize_throttle', this.set_pop_up_position.bind(this)); //при ресайзах пересчитываем позиционирование

            //иницализируем все необходимые события
            all_plusiki.forEach(el => {
                w.matchMedia('(any-hover: hover)').matches && this.hoverd_init(el);
                this.touched_init(el);
            });
            //иницализируем все необходимые события

            this.check_outside_ckick_function = this.check_if_click_outside_plusik.bind(this); //записывае в свойства объекта ссылку на функцию проверки кликов вне плюсиков чтоб можно было её отменять
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля
