import Swiper, { Navigation } from 'swiper';
import { add_in_observe } from '@images-main-js';
import { px_to_px, adaptiv_size, rem, show, hide } from '@js-libs/func-kit';
import { forced_download } from '@images-main-js';
//slideReset - этот метод сбрасывает позицию слайдер к ближайшему активному слайду, можно использовать для прерывания долгого свайпа

//не забыть менять размеры зазоров и смещений слайдов при ресайзе

let slider = qs('.komplekt-4__slider-wrap>.swiper'), //элемент слайдера
    CONTROLLER = {
        gap: 20, //растояние между слайдами в пикселях
        animation_speed: 200, //время анимации перехода между слайдами

        //инициализируем объект слайдера
        init_swiper: function () {
            let _this = this;

            this.swiper = new Swiper(slider, {
                modules: [Navigation],
                navigation: {
                    nextEl: '.komplekt-4__control-buttons-button-next',
                    prevEl: '.komplekt-4__control-buttons-button-prev',
                },
                on: {
                    afterInit: function () {
                        this.slides.forEach(el => add_in_observe([qs('[data-img-type]', el)])); //все картинки в слайдере добавляем на отслеживание, т.к. при цикличной прокрутке создаются дубликаты которые тоже нужно отслеживать

                        this.el.classList.remove('wait-init-slider-swiper'); //убираем класс скрывающий слайдер до его инициализации

                        //отвечает за перемотку слайдера при клике на крайние слайды
                        this.on('click', function (_, e) {
                            let find_target_slide_el = el => (el.classList.contains('swiper-slide') ? el : find_target_slide_el(el.parentNode)),
                                clicked_slide = find_target_slide_el(e.target),
                                clicked_slide_index = clicked_slide.getAttribute('data-swiper-slide-index'),
                                activ_slide_real_index = this.realIndex,
                                slider_full_view = GDS.win.width_rem >= 40 ? 2 : 1; //текущее количиство полных слайдов на экране, т.е. в этом случае тот  слайд который будет скраю будет объектом клика

                            if (clicked_slide.classList.contains('swiper-slide-prev')) return this.slidePrev(); //если кликнули по предидущему сладеру мотаем назад

                            if ((activ_slide_real_index + slider_full_view >= _this.slides_amount ? Math.abs(_this.slides_amount - activ_slide_real_index - slider_full_view) : activ_slide_real_index + slider_full_view) == clicked_slide_index) this.slideNext(); //если кликнули по крайнему слайду мотаем вперёд
                        });
                        //отвечает за перемотку слайдера при клике на крайние слайды
                    },
                },
                grabCursor: true,
                loop: true,
                speed: this.animation_speed ?? GDS.anim.time, //скорость переходов слайдера, если не задана то берём по умолчанию скорость анимационных переходов
                spaceBetween: this.get_slider_spaceBetween(),
                slidesPerView: this.get_slider_slidesPerView(), //это значение менять динамически в зависимости от ширины экрана
            });
        },
        //инициализируем объект слайдера

        get_slider_slidesPerView: function () {
            if (GDS.win.width_rem >= rem(640)) {
                return 2;
            } else {
                return 1;
            }
        },

        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна
        get_slider_spaceBetween: function () {
            return GDS.win.width_rem >= rem(1920) ? adaptiv_size(this.gap, 1920) : px_to_px(this.gap); //для данного слайдера у нас на всех экранах до 1920 одинаковые зазоры
        },
        //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна

        init: function () {
            if (!slider) return; //завершаем инициализацию если на странице не данного слайдера

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

                    this.swiper.params.slidesPerView = this.get_slider_slidesPerView(); //пересчитываем количиество слайдов на экране после ресайза
                }
                //если свайпер уже инициализирован
            });
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
