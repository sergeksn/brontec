import Swiper, { Navigation } from 'swiper';
import { add_in_observe } from '@images-main-js';
import { px_to_px, adaptiv_size, rem, show, hide } from '@js-libs/func-kit';
import { forced_download } from '@images-main-js';
//slideReset - этот метод сбрасывает позицию слайдер к ближайшему активному слайду, можно использовать для прерывания долгого свайпа

//не забыть менять размеры зазоров и смещений слайдов при ресайзе

let slider = qs('.glavnaya-4__wrap-slider-swiper-wrap>.swiper'), //элемент слайдера
    toggler = qs('.glavnaya-4__toggler'), //блок с меняющимся текстом
    text_wrap = qs('.glavnaya-4__toggler-text-wrap'), //текстовая оболочка для текста активного слайда
    CONTROLLER = {
        gap: 20, //растояние между слайдами в пикселях
        animation_speed: 200, //время анимации перехода между слайдами

        //инициализируем объект слайдера
        init_swiper: function () {
            this.swiper = new Swiper(slider, {
                modules: [Navigation],
                navigation: {
                    nextEl: '.glavnaya-4__control-buttons-button-next',
                    prevEl: '.glavnaya-4__control-buttons-button-prev',
                },
                on: {
                    afterInit: function () {
                        this.slides.forEach(el => add_in_observe([qs('[data-img-type]', el)])); //все картинки в слайдере добавляем на отслеживание, т.к. при цикличной прокрутке создаются дубликаты которые тоже нужно отслеживать

                        this.el.classList.remove('wait-init-slider-swiper'); //убираем класс скрывающий слайдер до его инициализации

                        let update_hide_text = () => (text_wrap.innerHTML = qs('.hide-text-data', qs(`[data-swiper-slide-index="${this.realIndex}"]`, this.el)).innerHTML); //функция записывает текст с активного слайда в поле

                        update_hide_text(); //после загрузки слайдера сразу обновляем текст

                        show({ el: toggler }); //показываем текст после вставки

                        this.on('touchStart', function () {
                            hide({ el: toggler }); //как только дотронулись до слайдера скрываем текст
                        });

                        this.on('touchEnd', function () {
                            show({ el: toggler }); //когда отпустили слайдер показывает текст
                        });

                        this.on('activeIndexChange', function () {
                            update_hide_text(); //обновляем текст после смены активного слайда
                        });
                    },
                },
                grabCursor: true,

                loop: true,
                speed: this.animation_speed ?? GDS.anim.time, //скорость переходов слайдера, если не задана то берём по умолчанию скорость анимационных переходов
                spaceBetween: this.get_slider_spaceBetween(),
                slidesOffsetBefore: this.get_slider_slidesOffsetBefore(), //370,
                slidesPerView: this.get_slider_slidesPerView(), //это значение менять динамически в зависимости от ширины экрана
            });
        },
        //инициализируем объект слайдера

        get_slider_slidesPerView: function () {
            if (GDS.win.width_rem >= rem(1240)) {
                return 3.2332;
            } else if (GDS.win.width_rem >= rem(640)) {
                return 2.2;
            } else {
                return 1.3;
            }
        },

        get_slider_slidesOffsetBefore: function () {
            if (GDS.win.width_rem >= rem(1920)) {
                return adaptiv_size(350, 1920) + this.get_slider_spaceBetween();
            } else if (GDS.win.width_rem >= rem(1240)) {
                return px_to_px(350) + this.get_slider_spaceBetween();
            } else if (GDS.win.width_rem >= rem(640)) {
                return adaptiv_size(30, 640, 60, 1240);
            } else {
                return adaptiv_size(20, 320, 30, 640);
            }
        },

        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна
        get_slider_spaceBetween: function () {
            return GDS.win.width_rem >= rem(1920) ? adaptiv_size(this.gap, 1920) : px_to_px(this.gap); //для данного слайдера у нас на всех экранах до 1920 одинаковые зазоры
        },
        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна

        init: function () {
            //создаём наблюдатель за видимостью элементов на экране
            this.visible_observer = new IntersectionObserver(entries => {
                entries.forEach(entrie => {
                    //если слайдер есть на экране
                    if (entrie.isIntersecting) {
                        if (entrie.target === slider) {
                            this.init_swiper(); //инициализируем объект слайдера только когда он виден на экране

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
                    this.swiper.params.slidesOffsetBefore = this.get_slider_slidesOffsetBefore(); //пересчитываем размеры смещения слайдера вправо после ресайза
                    this.swiper.params.slidesPerView = this.get_slider_slidesPerView(); //пересчитываем количиество слайдов на экране после ресайза
                }
                //если свайпер уже инициализирован
            });
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
