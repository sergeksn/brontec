import Swiper, { Navigation } from 'swiper';
import { add_in_observe } from '@images-main-js';
import { px_to_px, adaptiv_size } from '@js-libs/func-kit';
//написать новую функцию для получения размеров в пикселях

//ВАЖНО: останавливать слайдер когад его не видно на экране

//не забыть менять размеры зазоров и смещений слайдов при ресайзе

// this.params.slidesOffsetBefore = parseFloat(w.getComputedStyle(this.slides[0]).width) / 2 + (GDS.win.width_rem >= 120 ? adaptiv_size(20, 1920) : px_to_px(20)) / 2;

let slider = qs('.glavnaya-4__wrap-slider-swiper-wrap'), //элемент слайдера
    CONTROLLER = {
        gap: 20, //растояние между слайдами в пикселях
        animation_speed: 500, //время анимации перехода между слайдами

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

                        //this.params.slidesOffsetBefore = parseFloat(w.getComputedStyle(this.slides[0]).width)*0.60345 + (GDS.win.width_rem >= 120 ? adaptiv_size(20, 1920) : px_to_px(20)) / 2;

                        // this.params.slidesOffsetBefore = (GDS.win.width - 1180) / 2;
                    },
                },
                grabCursor: true,

                loop: true,
                speed: this.animation_speed ?? GDS.anim.time, //скорость переходов слайдера, если не задана то берём по умолчанию скорость анимационных переходов
                spaceBetween: this.get_slider_gap(),

                slidesOffsetBefore: 30,

                slidesPerView: 2.1, //это значение менять динамически в зависимости от ширины экрана

                //roundLengths попробовать


                
            });
        },
        //инициализируем объект слайдера

        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна
        get_slider_gap: function () {
            return GDS.win.width_rem >= 120 ? adaptiv_size(this.gap, 1920) : px_to_px(this.gap); //для данного слайдера у нас на всех экранах до 1920 одинаковые зазоры
        },
        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна

        init: function () {
            this.visible_observer = new IntersectionObserver(entries => {
                entries.forEach(entrie => {
                    //если слайдер есть на экране
                    if (entrie.isIntersecting) {
                        this.init_swiper(); //инициализируем объект слайдера только когда он виден на экране
                        this.visible_observer.unobserve(slider);
                    } //если слайдер есть на экране
                });
            }); //создаём наблюдатель за видимостью элементов на экране

            this.visible_observer.observe(slider); //добавляем наш слайдер на отслеживание видимости

            w._on('resize_optimize', () => {
                if (this.swiper) this.swiper.params.spaceBetween = this.get_slider_gap(); //пересчитываем размеры зазором между слайдами после ресайза если свайпер уже инициализирован
            });
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
