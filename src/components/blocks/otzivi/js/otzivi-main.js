import Swiper, { Navigation } from 'swiper';
import { add_in_observe } from '@images-main-js';
import { px_to_px, adaptiv_size, rem, show, hide } from '@js-libs/func-kit';
import { forced_download } from '@images-main-js';
//slideReset - этот метод сбрасывает позицию слайдер к ближайшему активному слайду, можно использовать для прерывания долгого свайпа

//не забыть менять размеры зазоров и смещений слайдов при ресайзе

let slider = qs('.otzivi>.swiper'), //элемент слайдера
    CONTROLLER = {
        animation_speed: 1000, //время анимации перехода между слайдами

        //инициализируем объект слайдера
        init_swiper: function () {
            this.swiper = new Swiper(slider, {
                modules: [Navigation],
                navigation: {
                    nextEl: '.otzivi__control-buttons-button-next',
                    prevEl: '.otzivi__control-buttons-button-prev',
                },
                on: {
                    afterInit: function () {
                        this.slides.forEach(el => add_in_observe([qs('[data-img-type]', el)])); //все картинки в слайдере добавляем на отслеживание, т.к. при цикличной прокрутке создаются дубликаты которые тоже нужно отслеживать

                        this.el.classList.remove('wait-init-slider-swiper'); //убираем класс скрывающий слайдер до его инициализации

                        //отвечает за перемотку слайдера при клике на крайние слайды
                        this.on('click', function (_, e) {
                            let find_target_slide_el = el => (el.classList.contains('swiper-slide') ? el : find_target_slide_el(el.parentNode)),
                                clicked_slide = find_target_slide_el(e.target);

                            if (clicked_slide.classList.contains('swiper-slide-prev')) return this.slidePrev(); //если кликнули по предидущему сладеру мотаем назад

                            if (clicked_slide.classList.contains('swiper-slide-next')) return this.slideNext(); //если кликнули по следующему сладеру мотаем назад
                        });
                        //отвечает за перемотку слайдера при клике на крайние слайды
                    },
                },
                grabCursor: true,
                loop: true,
                speed: this.animation_speed ?? GDS.anim.time, //скорость переходов слайдера, если не задана то берём по умолчанию скорость анимационных переходов
                spaceBetween: this.get_slider_spaceBetween(),
                slidesOffsetBefore: this.get_slider_slidesOffsetBefore(), //370,
                slidesPerView: 'auto', //это значение менять динамически в зависимости от ширины экрана
                roundLengths:true,//предотвратит размытие текта
            });
        },
        //инициализируем объект слайдера

        get_slider_slidesOffsetBefore: function () {
            if (GDS.win.width_rem >= rem(1920)) {
                return (GDS.win.width - adaptiv_size(1180, 1920)) / 2;
            } else if (GDS.win.width_rem >= rem(1240)) {
                return (GDS.win.width - px_to_px(1180)) / 2;
            } else {
                return 0;
            }
        },

        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна
        get_slider_spaceBetween: function () {
            if (GDS.win.width_rem >= rem(1240)) {
                return adaptiv_size(30, 1240, 120, 1920);
            } else if (GDS.win.width_rem >= rem(640)) {
                return px_to_px(-30);
            } else {
                return adaptiv_size(-18, 320, -27, 640);//тут не 20 - 30, а 19 - 29, для того чтоб избежать высовывания слайдов при округлении пикселей
            }
        },
        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна

        init: function () {
            if (!slider) return;//завершаем инициализацию если на странице не данного слайдера
            
            //создаём наблюдатель за видимостью элементов на экране
            this.visible_observer = new IntersectionObserver(entries => {
                entries.forEach(entrie => {
                    //если слайдер есть на экране
                    if (entrie.isIntersecting) {
                        if (entrie.target === slider) {
                            this.slides_amount = qs('.swiper-wrapper', slider).children.length; //записываем количество слайдов

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
                }
                //если свайпер уже инициализирован
            });
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
