import Swiper, { Navigation, Autoplay, EffectFade } from 'swiper';
import Overlay from '@overlays-main-js';
import Scroll_To_Top_Button from '@scroll-to-top-button-main-js';
import { add_in_observe } from '@images-main-js';
import { px_to_px, adaptiv_size, rem, wait } from '@js-libs/func-kit';
import { forced_download } from '@images-main-js';
//slideReset - этот метод сбрасывает позицию слайдер к ближайшему активному слайду, можно использовать для прерывания долгого свайпа

//не забыть менять размеры зазоров и смещений слайдов при ресайзе

let body = qs('body'),
    header = qs('header'),
    slider = qs('.komplekt-4__slider-wrap>.swiper'), //элемент слайдера
    pop_up_body = qs('.komplekt-4__pop-up'),
    pop_up_overlay = qs('#overlay-galery-pop-up'),
    pop_up_close_buttton = qs('.komplekt-4__pop-up-close-button'),
    pop_up_control_butttons = qs('.komplekt-4__pop-up-control-buttons'),
    slider_pop_up = qs('.komplekt-4__pop-up-slider-wrap>.swiper'), //элемент слайдера попап
    slider_pop_up_nead_open_id, //хранит индекс слайда который нужно открыть в поп апе
    slides_amount,
    GALERY_SLIDER = {
        autoplay_paused_timer: null, //хранит id таймера для отложенного запуска автопрокрутки
        is_hover: false, //хранит информацию о том наведён ли указатель на слайдер или нет
        newly_was_click: false, //сообщает о том что толкьо что был произведён клик, нужно для того чтоб при уходе курсора со слайдера после клика он запускался не сразу, а с такой же задержкой как и при кликах на стрелки управления
        delay_autoplay_after_action: 5000, //задержка перед включением автопрокрутки после взаимодействия со слайдером или его элементами управления, не считая наведения мыши!

        gap: 20, //растояние между слайдами в пикселях
        animation_speed: 500, //время анимации перехода между слайдами
        autoplay_delay: 3000, //пауза между автопереключениями слайдера

        //инициализируем объект слайдера
        init_swiper: function () {
            let _this = this;

            this.swiper = new Swiper(slider, {
                modules: [Navigation, Autoplay],
                navigation: {
                    nextEl: '.komplekt-4__control-buttons-button-next',
                    prevEl: '.komplekt-4__control-buttons-button-prev',
                },
                on: {
                    afterInit: function () {
                        this.slides.forEach(el => add_in_observe([qs('[data-img-type]', el)])); //все картинки в слайдере добавляем на отслеживание, т.к. при цикличной прокрутке создаются дубликаты которые тоже нужно отслеживать

                        this.el.classList.remove('wait-init-slider-swiper'); //убираем класс скрывающий слайдер до его инициализации

                        //мышка находится на слайдере
                        this.el._on('mouseenter', () => {
                            this.autoplay.stop(); //останавливаем автопрокрутку
                            _this.is_hover = true; //помечаем что сейчас на слайдере есть курсор мышки
                        });
                        //мышка находится на слайдере

                        //мышка покинула слайдер
                        this.el._on('mouseleave', () => {
                            if (!_this.newly_was_click && GALERY_POP_UP.status === 'hide') this.autoplay.start(); //если в ближайшее время не ыбло клика по слайдеру то можно запустить автопрокрутку

                            _this.is_hover = false; //помечаем что на слайдере больше нет указателя
                        });
                        //мышка покинула слайдер
                    },
                    navigationNext: this.click_on_controls_or_slider.bind(this), //останавливаем автопрокрутку при клике на кнопку и всключаем с задержкой
                    navigationPrev: this.click_on_controls_or_slider.bind(this), //останавливаем автопрокрутку при клике на кнопку и всключаем с задержкой
                    touchEnd: this.click_on_controls_or_slider.bind(this), //останавливаем автопрокрутку при клике на слайдере и всключаем с задержкой
                },
                loop: true,
                autoplay: {
                    delay: this.autoplay_delay,
                },
                speed: this.animation_speed ?? GDS.anim.time, //скорость переходов слайдера, если не задана то берём по умолчанию скорость анимационных переходов
                spaceBetween: this.get_slider_spaceBetween(),
                slidesPerView: this.get_slider_slidesPerView(), //это значение менять динамически в зависимости от ширины экрана
            });
        },
        //инициализируем объект слайдера

        //обрабатывает клик по элементам управления слайдера и по самому слайдеру
        click_on_controls_or_slider: function () {
            this.newly_was_click = true; //по завершению клика помечаем что недавно был клик
            this.delay_autoplay_start(); //останавливаем автопрокрутку и запускаем ожидание включение автопрокрутки слайдов
        },
        //обрабатывает клик по элементам управления слайдера и по самому слайдеру

        //останавливает автопрокрутку и запускает ее с задержкой
        delay_autoplay_start: function () {
            clearTimeout(this.timer); //удаляем преидущий таймер для запуска автопрокрутки

            this.swiper.autoplay.stop(); //останавливаем автопрокрутку

            this.timer = setTimeout(() => {
                this.newly_was_click = false; //убираем пометку о том что недавно был клик

                if (!this.is_hover && GALERY_POP_UP.status === 'hide') {
                    this.swiper.autoplay.start(); //запускаем автопрокрутку если на слайдере не курсора и попап окно закрыто
                    this.swiper.autoplay.run();
                }
            }, this.delay_autoplay_after_action);
        },
        //останавливает автопрокрутку и запускает ее с задержкой

        get_slider_slidesPerView: function () {
            return GDS.win.width_rem >= rem(640) ? 2 : 1;
        },

        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна
        get_slider_spaceBetween: function () {
            return GDS.win.width_rem >= rem(1920) ? adaptiv_size(this.gap, 1920) : px_to_px(this.gap); //для данного слайдера у нас на всех экранах до 1920 одинаковые зазоры
        },
        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна

        //ПРИМЕЧАНИЕ: отлельные обработки кликов нужны потому что при активном слайдере он не корректно воспринимает клики через внешние обработчики по слайдам, а кога он вкличени при нехватке слайдов то его внутрение обработчики кликов не срабатывают
        //открываем попап при клике на слайды при выключенном слайдере
        click_on_slide_swiper_disabled: function (e) {
            slider_pop_up_nead_open_id = e
                .composedPath()
                .find(el => el?.classList.contains('swiper-slide'))
                .getAttribute('data-popup-id'); //получаем порядковый номер кликнутого слайда что сопоставить его со слайдом в попапе
            GALERY_POP_UP.show();
        },
        //открываем попап при клике на слайды при выключенном слайдере

        //открываем попап при клике на слайды при активном слайдере
        click_on_slide_swiper_enabled: function (_, e) {
            slider_pop_up_nead_open_id = e
                .composedPath()
                .find(el => el?.classList.contains('swiper-slide'))
                .getAttribute('data-popup-id'); //получаем порядковый номер кликнутого слайда что сопоставить его со слайдом в попапе
            GALERY_POP_UP.show();
        },
        //открываем попап при клике на слайды при активном слайдере

        toggle_swiper_state: function () {
            //отключаем обоа слушателя
            [...this.swiper.slides].forEach(el => el._off('click', this.click_on_slide_swiper_disabled));
            this.swiper.off('click', this.click_on_slide_swiper_enabled);

            let enable = () => {
                    this.swiper.loopCreate();
                    this.swiper.update();
                    this.swiper.enable();
                    this.swiper.autoplay.start();
                    this.swiper.autoplay.run();
                    this.swiper.on('click', this.click_on_slide_swiper_enabled);
                },
                disable = () => {
                    this.swiper.loopDestroy();
                    this.swiper.update();
                    this.swiper.disable();
                    [...this.swiper.slides].forEach(el => el._on('click', this.click_on_slide_swiper_disabled));
                };

            if (GDS.win.width_rem >= rem(640)) {
                if (slides_amount > 2) {
                    enable();
                } else {
                    disable();
                }
            } else {
                if (slides_amount > 1) {
                    enable();
                } else {
                    disable();
                }
            }
        },

        init: function () {
            if (!slider) return; //завершаем инициализацию если на странице не данного слайдера

            //создаём наблюдатель за видимостью элементов на экране
            this.visible_observer = new IntersectionObserver(entries => {
                entries.forEach(entrie => {
                    //если слайдер есть на экране
                    if (entrie.isIntersecting) {
                        if (entrie.target === slider) {
                            slides_amount = qs('.swiper-wrapper', slider).children.length; //записываем количество слайдов

                            this.init_swiper(); //инициализируем объект слайдера

                            this.toggle_swiper_state(); //включаем функционал слайдера если подходит по условиям и выключаем если не удовлетворяет

                            this.visible_observer.unobserve(slider); //убаляем сладер из отслеживания видимости

                            qsa('[data-img-type]', slider).forEach(img => this.visible_observer.observe(img)); //добавляем все картинки в сладере на отслеживание видимости, это нужно т.к. стандартно картинки обнаруживаются если виден определённый кусок картинки на экране, ну а тут нам нужно чтоб картинка загружалась если виден даже 1 пиксель
                        } else {
                            !entrie.target.classList.contains('uploaded') && forced_download(entrie.target); //если картинка видна и ещё не загружена принудительно её загружаем

                            this.visible_observer.unobserve(entrie.target); //после того как картинка обнаружена удаляем её с отслеживания в этом обозревателе
                        }
                    } //если слайдер есть на экране
                });
            });
            //создаём наблюдатель за видимостью элементов на экране

            this.visible_observer.observe(slider); //добавляем наш слайдер на отслеживание видимости

            w._on('resize_optimize', () => {
                //если свайпер уже инициализирован
                if (this.swiper) {
                    this.swiper.params.spaceBetween = this.get_slider_spaceBetween(); //пересчитываем размеры зазором между слайдами после ресайза

                    this.swiper.params.slidesPerView = this.get_slider_slidesPerView(); //пересчитываем количиество слайдов на экране после ресайза

                    this.toggle_swiper_state();
                }
                //если свайпер уже инициализирован
            });
        },
    },
    GALERY_POP_UP = {
        status: 'hide',
        Overlay: new Overlay({ el: pop_up_overlay }), //создаём экземпляр подложки

        //показываем поап окно галереи
        show: async function () {
            if (this.status !== 'hide') return;

            GALERY_SLIDER.swiper.autoplay.stop(); //отсанавливаем автопрокрутку основного слайдера

            this.size_recalculate(); //расчитываем размеры и позицию элементов в окне попапа

            if (!GALERY_POP_UP_SLIDER.swiper) GALERY_POP_UP_SLIDER.init(); //если слайдер галереи ещё не создан создаём его

            GALERY_POP_UP_SLIDER.swiper.slideTo(slider_pop_up_nead_open_id); //делаем нужный активный слайд

            this.status = 'pending to show';

            body.scrollbar.lock(); //блокируем прокуртку документа
            body.scrollbar.show_scrollbar_space(); //добавляем пространство имитирующее скролбар
            header.scrollbar.show_scrollbar_space(); //добавляем пространство имитирующее скролбар

            await Promise.all([this.Overlay.show(), Scroll_To_Top_Button.hide()]);

            Scroll_To_Top_Button.lock = true; //блокируем кнопку скролла вверх

            pop_up_body.style.zIndex = '12';
            pop_up_body.style.pointerEvents = 'auto';
            pop_up_body.style.opacity = '1';

            let sl = w.getComputedStyle(pop_up_body);

            await wait(() => sl.opacity, '1');

            this.status = 'show';
        },
        //показываем поап окно галереи

        //скрываем поап окно галереи
        hide: async function () {
            if (this.status !== 'show') return;

            this.status = 'pending to hide';

            body.scrollbar.unlock(); //разблокируем прокуртку документа
            body.scrollbar.hide_scrollbar_space(); //убираем пространство имитирующее скролбар
            header.scrollbar.hide_scrollbar_space(); //убираем пространство имитирующее скролбар

            Scroll_To_Top_Button.lock = false; //разблокируем кнопку скролла вверх

            pop_up_body.style.pointerEvents = '';
            pop_up_body.style.opacity = '';

            let sl = w.getComputedStyle(pop_up_body);

            await wait(() => sl.opacity, '0');

            pop_up_body.style.zIndex = '';

            await Promise.all([this.Overlay.hide(), Scroll_To_Top_Button.toggle_show_button()]);

            GALERY_SLIDER.delay_autoplay_start(); //возобновляем автопрокрутку основного слайдера с задержкой

            this.status = 'hide';
        },
        //скрываем поап окно галереи

        //расчитываем размеры и позицию элементов в окне попапа
        size_recalculate: function () {
            let img = qs('[data-img-type]', slider_pop_up),
                ls_img = w.getComputedStyle(img),
                img_w = parseFloat(ls_img.width),
                img_h = parseFloat(ls_img.height),
                ls_pop_up_body = w.getComputedStyle(pop_up_body),
                max_width_pop_up_body = GDS.vars.standart_container_max_width,
                pt_pop_up_body = parseFloat(ls_pop_up_body.paddingTop),
                nead_width = ((GDS.win.height - pt_pop_up_body * 2) * img_w) / img_h,
                nead_height,
                text_data_base_pt = (() => {
                    //верхни отступ при условии что текст разположен под картинкой
                    if (GDS.win.width_rem >= rem(1920)) {
                        return adaptiv_size(20, 1920);
                    } else if (GDS.win.width_rem >= rem(960)) {
                        return adaptiv_size(10, 960, 20, 1920);
                    } else {
                        return px_to_px(10);
                    }
                })(),
                max_text,
                max_text_length = 0,
                expected_max_text_height;

            //получаем наибольшую строку
            qsa('.text-data', pop_up_body).forEach(el => {
                let t = el.textContent;
                if (t.length > max_text_length) {
                    max_text_length = t.length;
                    max_text = t;
                }
            });
            //получаем наибольшую строку

            nead_width = nead_width >= max_width_pop_up_body ? max_width_pop_up_body : nead_width; //ширина не должна превывать 1180, т.е. ширину осеновного контейнера

            nead_width = nead_width + GDS.vars.standart_container_margin_lr * 2 >= GDS.win.width ? GDS.win.width - GDS.vars.standart_container_margin_lr * 2 : nead_width;

            nead_height = (nead_width * img_h) / img_w; //высота которая нужна для созхранения блоком пропорций

            //получаем высоту которую займёт самый длинный текст при необходмой ширине картинки
            let test_div = d.createElement('div');
            test_div.innerText = max_text;
            test_div.style.position = 'absolute';
            test_div.style.visibility = 'hidden';
            test_div.style.pointerEvents = 'none';
            d.body.append(test_div);
            test_div.style.width = nead_width + 'px';
            expected_max_text_height = parseFloat(w.getComputedStyle(test_div).height);
            test_div.remove();
            //получаем высоту которую займёт самый длинный текст при необходмой ширине картинки

            pop_up_body.style.width = nead_width + 'px';

            //применяем разные стили в зависимости от того влазит текст снизу или нет
            if (expected_max_text_height + pt_pop_up_body * 2 + nead_height + text_data_base_pt <= GDS.win.height) {
                pop_up_body.classList.remove('overlay-version');
            } else {
                pop_up_body.classList.add('overlay-version');
            }
            //применяем разные стили в зависимости от того влазит текст снизу или нет

            //управляем позиционирование кнопки закрытия окна попапа
            let pop_up_close_buttton_sl = w.getComputedStyle(pop_up_close_buttton),
                pop_up_close_buttton_size = parseFloat(pop_up_close_buttton_sl.width);

            pop_up_close_buttton.classList.remove('right-version', 'top-version', 'inner-version');

            if ((GDS.win.width - parseFloat(ls_pop_up_body.width)) / 2 >= pop_up_close_buttton_size + GDS.vars.gap) {
                pop_up_close_buttton.classList.add('right-version');
            } else if ((GDS.win.height - parseFloat(ls_pop_up_body.height)) / 2 >= pop_up_close_buttton_size + GDS.vars.gap) {
                pop_up_close_buttton.classList.add('top-version');
            } else {
                pop_up_close_buttton.classList.add('inner-version');
            }
            //управляем позиционирование кнопки закрытия окна попапа

            if (slides_amount < 2) return; //если у нас в галереи меньше двух картинок значит сладйера нет, и пересчитывать стреки управления не нужно

            pop_up_control_butttons.style.top = nead_height / 2 + 'px'; //опускаем стрелки управления слайдером поп апа до середины картинки

            let controll_button = qs('button', pop_up_control_butttons),
                controll_button_width = parseFloat(w.getComputedStyle(controll_button).width);

            pop_up_control_butttons.classList.remove('inner-arrows', 'outer-arrows');

            //меняем тип стрелок в зависимости от свободного по блокам места
            if ((controll_button_width + GDS.vars.gap) * 2 < GDS.win.width - nead_width) {
                pop_up_control_butttons.classList.add('outer-arrows');
            } else {
                pop_up_control_butttons.classList.add('inner-arrows');
            }
            //меняем тип стрелок в зависимости от свободного по блокам места
        },
        //расчитываем размеры и позицию элементов в окне попапа

        init: function () {
            if (!pop_up_body) return; //прерываем сне нет попап галереи

            w._on('resize_throttle', () => {
                if (this.status !== 'show') return; //пересчитываем размеры только если окно открыто
                this.size_recalculate();
            });

            [pop_up_close_buttton, pop_up_overlay].forEach(el => el._on('click', this.hide.bind(this))); //закрываем попап при клике на кнопку закрытия или на подложку попапа
        },
    },
    GALERY_POP_UP_SLIDER = {
        //инициализируем объект слайдера
        init_swiper: function () {
            this.swiper = new Swiper(slider_pop_up, {
                modules: [Navigation, Autoplay, EffectFade],
                navigation: {
                    nextEl: '.komplekt-4__pop-up-control-buttons-button-next',
                    prevEl: '.komplekt-4__pop-up-control-buttons-button-prev',
                },
                on: {
                    afterInit: function () {
                        this.slides.forEach(el => add_in_observe([qs('[data-img-type]', el)])); //все картинки в слайдере добавляем на отслеживание, т.к. при цикличной прокрутке создаются дубликаты которые тоже нужно отслеживать

                        this.el.classList.remove('wait-init-slider-swiper'); //убираем класс скрывающий слайдер до его инициализации

                        //переключаем слайды главного слайдера при смене слайдов в попапе
                        pop_up_control_butttons._on('click', () => {
                            GALERY_SLIDER.swiper.slideTo([...this.slides].find(el => el.classList.contains('swiper-slide-active')).getAttribute('data-popup-id'));
                        });
                        //переключаем слайды главного слайдера при смене слайдов в попапе
                    },
                },
                effect: 'fade',
                fadeEffect: {
                    crossFade: true,
                },
                allowTouchMove: false,
                loop: slides_amount > 1,
                speed: 100, //скорость переходов слайдера, если не задана то берём по умолчанию скорость анимационных переходов
                slidesPerView: 1,
            });
        },
        //инициализируем объект слайдера

        init: function () {
            if (!slider_pop_up) return; //завершаем инициализацию если на странице не данного слайдера

            this.init_swiper(); //инициализируем объект слайдера

            //создаём наблюдатель за видимостью элементов на экране
            this.visible_observer = new IntersectionObserver(entries => {
                entries.forEach(entrie => {
                    //если картинка есть на экране
                    if (entrie.isIntersecting) {
                        !entrie.target.classList.contains('uploaded') && forced_download(entrie.target); //если картинка видна и ещё не загружена принудительно её загружаем

                        this.visible_observer.unobserve(entrie.target); //после того как картинка обнаружена удаляем её с отслеживания в этом обозревателе
                    } //если картинка есть на экране
                });
            });
            //создаём наблюдатель за видимостью элементов на экране

            qsa('[data-img-type]', slider_pop_up).forEach(img => this.visible_observer.observe(img)); //добавляем все картинки в сладере на отслеживание видимости, это нужно т.к. стандартно картинки обнаруживаются если виден определённый кусок картинки на экране, ну а тут нам нужно чтоб картинка загружалась если виден даже 1 пиксель
        },
    };

GALERY_SLIDER.init(); //выполянем действия необходимые при загрузке модуля
GALERY_POP_UP.init();
