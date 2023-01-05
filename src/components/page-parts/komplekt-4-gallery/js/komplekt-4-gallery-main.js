import Swiper, { Navigation, Autoplay } from 'swiper';
import { add_in_observe } from '@images-main-js';
import { px_to_px, adaptiv_size, rem, show, hide } from '@js-libs/func-kit';
import { forced_download } from '@images-main-js';
//slideReset - этот метод сбрасывает позицию слайдер к ближайшему активному слайду, можно использовать для прерывания долгого свайпа

//не забыть менять размеры зазоров и смещений слайдов при ресайзе

let slider = qs('.komplekt-4__slider-wrap>.swiper'), //элемент слайдера
    slides_amount,
    CONTROLLER = {
        gap: 20, //растояние между слайдами в пикселях
        animation_speed: 200, //время анимации перехода между слайдами
        autoplay_delay: 500, //пауза между автопереключениями слайдера

        //инициализируем объект слайдера
        init_swiper: function () {
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
                    },
                },
                grabCursor: true,
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

        get_slider_slidesPerView: function () {
            return GDS.win.width_rem >= rem(640) ? 2 : 1;
        },

        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна
        get_slider_spaceBetween: function () {
            return GDS.win.width_rem >= rem(1920) ? adaptiv_size(this.gap, 1920) : px_to_px(this.gap); //для данного слайдера у нас на всех экранах до 1920 одинаковые зазоры
        },
        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна

        toggle_swiper_state: function () {
            let enable = () => {
                    this.swiper.loopCreate();
                    this.swiper.update();
                    this.swiper.enable();
                    this.swiper.autoplay.start();
                },
                disable = () => {
                    this.swiper.loopDestroy();
                    this.swiper.update();
                    this.swiper.disable();
                  //  this.swiper.autoplay.stop();
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
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
