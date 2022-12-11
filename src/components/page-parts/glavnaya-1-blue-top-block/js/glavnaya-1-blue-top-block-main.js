import Swiper, { Navigation, Autoplay } from 'swiper';
import { Img_Loader } from '@images-main-js';
import { px_to_px, adaptiv_size } from '@js-libs/func-kit';
//написать новую функцию для получения размеров в пикселях

//ВАЖНО: останавливать слайдер когад его не видно на экране

//не забыть менять размеры зазоров и смещений слайдов при ресайзе

// this.params.slidesOffsetBefore = parseFloat(w.getComputedStyle(this.slides[0]).width) / 2 + (GDS.win.width_rem >= 120 ? adaptiv_size(20, 1920) : px_to_px(20)) / 2;

export default new (class {
    constructor() {
        this.slider = d.querySelector('.glavnaya-1-blue-top-block__second-part-marki-slider-swiper'); //элемент слайдера
        this.autoplay_paused_timer = null; //хранит id таймера для отложенного запуска автопрокрутки
        this.is_hover = false; //хранит информацию о том наведён ли указатель на слайдер или нет
        this.newly_was_click = false; //сообщает о том что толкьо что был произведён клик, нужно для того чтоб при уходе курсора со слайдера после клика он запускался не сразу, а с такой же задержкой как и при кликах на стрелки управления

        this.gap = 20; //растояние между слайдами в пикселях
        this.animation_speed = 500; //время анимации перехода между слайдами
        this.autoplay_delay = 1000; //пауза между автопереключениями слайдера
        this.delay_autoplay_after_action = 5000; //задержка перед включением автопрокрутки после взаимодействия со слайдером или его элементами управления, не считая наведения мыши!

        this.visible_observer = new IntersectionObserver(entries => {
            entries.forEach(entrie => {
                //если слайдер есть на экране
                if (entrie.isIntersecting) {
                    this.swiper ? this.swiper.autoplay.start() : this.init_swiper(); //инициализируем объект слайдера только когда он виден на экране если ещё не создан, если создан то включаем автопрокрутку
                } //если слайдер есть на экране

                //если слайдера нет на экране
                else {
                    if (this.swiper) this.swiper.autoplay.stop(); //если слайдер уже создан то в этом случае мы должны остановить автопрокрутку чтоб экономить ресурсы браузера
                }
                //если слайдера нет на экране
            });
        }); //создаём наблюдатель за видимостью элементов на экране

        this.visible_observer.observe(this.slider); //добавляем наш слайдер на отслеживание видимости

        w._on('resize_optimize', () => {
            if (this.swiper) this.swiper.params.spaceBetween = this.get_slider_gap(); //пересчитываем размеры зазором между слайдами после ресайза если свайпер уже инициализирован
        });
    }

    //инициализируем объект слайдера
    init_swiper() {
        let _this = this;

        this.swiper = new Swiper(this.slider, {
            modules: [Navigation, Autoplay],
            navigation: {
                nextEl: '.glavnaya-1-blue-top-block__second-part-marki-slider-control-buttons-button-next',
                prevEl: '.glavnaya-1-blue-top-block__second-part-marki-slider-control-buttons-button-prev',
            },
            on: {
                afterInit: function () {
                    this.slides.forEach(el => Img_Loader.add_in_observe([el.querySelector('[data-img-type]')])); //все картинки в слайдере добавляем на отслеживание, т.к. при цикличной прокрутке создаются дубликаты которые тоже нужно отслеживать

                    this.el.classList.remove('wait-init-slider-swiper'); //убираем класс скрывающий слайдер до его инициализации

                    //мышка находится на слайдере
                    this.el.addEventListener('mouseenter', () => {
                        this.autoplay.stop(); //останавливаем автопрокрутку
                        _this.is_hover = true; //помечаем что сейчас на слайдере есть курсор мышки
                    });
                    //мышка находится на слайдере

                    //мышка покинула слайдер
                    this.el.addEventListener('mouseleave', () => {
                        !_this.newly_was_click && this.autoplay.start(); //если в ближайшее время не ыбло клика по слайдеру то можно запустить автопрокрутку
                        _this.is_hover = false; //помечаем что на слайдере больше нет указателя
                    });
                    //мышка покинула слайдер
                },
                navigationNext: this.click_on_controls_or_slider.bind(this), //останавливаем автопрокрутку при клике на кнопку и всключаем с задержкой
                navigationPrev: this.click_on_controls_or_slider.bind(this), //останавливаем автопрокрутку при клике на кнопку и всключаем с задержкой
                touchEnd: this.click_on_controls_or_slider.bind(this), //останавливаем автопрокрутку при клике на слайдере и всключаем с задержкой
            },
            grabCursor: true,
            autoplay: {
                delay: this.autoplay_delay,
            },
            loop: true,
            speed: this.animation_speed ?? GDS.anim.time, //скорость переходов слайдера, если не задана то берём по умолчанию скорость анимационных переходов
            spaceBetween: this.get_slider_gap(),
            slidesPerView: 6,
            loopedSlides: 0,
        });
    }
    //инициализируем объект слайдера

    //обрабатывает клик по элементам управления слайдера и по самому слайдеру
    click_on_controls_or_slider() {
        this.newly_was_click = true; //по завершению клика помечаем что недавно был клик
        this.delay_autoplay_start(); //останавливаем автопрокрутку и запускаем ожидание включение автопрокрутки слайдов
    }
    //обрабатывает клик по элементам управления слайдера и по самому слайдеру

    //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна
    get_slider_gap() {
        return GDS.win.width_rem >= 120 ? adaptiv_size(this.gap, 1920) : px_to_px(this.gap); //для данного слайдера у нас на всех экранах до 1920 одинаковые зазоры
    }
    //функция определяет нужное растояние между слайдами с учётом шрифта по умолчанию и ширины окна

    //останавливает автопрокрутку и запускает ее с задержкой
    delay_autoplay_start() {
        clearTimeout(this.timer); //удаляем преидущий таймер для запуска автопрокрутки

        this.swiper.autoplay.stop(); //останавливаем автопрокрутку

        this.timer = setTimeout(() => {
            this.newly_was_click = false; //убираем пометку о том что недавно был клик

            !this.is_hover && this.swiper.autoplay.start(); //запускаем автопрокрутку если на слайдере не курсора
        }, this.delay_autoplay_after_action - this.autoplay_delay);
        //задержка это разница между нужной длительностью и интервалом автопрокрутки, т.к. после включения автопрокрутка начнётся через промежуток времени autoplay_delay
    }
    //останавливает автопрокрутку и запускает ее с задержкой
})();
