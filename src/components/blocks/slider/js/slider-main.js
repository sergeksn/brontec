import { get_translate } from '@js-libs/func-kit';
import Swipe_Slider from './swipe-slider';
/*
По настройкам:
moduls - массив с модулями необходимыми для работы слайдера напрмер погинация, автопрокрутка или стрелки навигации, пример [Autoplay, Navigation], так же важно не забыть импортировать эти модули в файл
translate_type - тип перехода слайдера
sliders_wrap_class - класс оболочки слайдов, нужно на слуйчай если бует слайдер в слайдере и тогда нужно будет отличать их оболочки
slides_class - класс слайдов, нужно на слуйчай если бует слайдер в слайдере и тогда нужно будет отличать их слайды
space_between - растояние между слайдами в пикселях
sliders_previv - количество слайдов которое видно на экране, если нужна половина слайда то можно указывать дробные значения
offset - смещаение по горизонтали в правую сторону, по вертикали вниз, если нужно двинуть начальную позицию слайдов, для сдвига влево указать отцательное значение, смещение можно указывать в пикселях или в частях от ширину слайда например 1.4 смещение будет на 140% ширины слайдера или высоты при вертикальном слайдере
vertical_slider - сообщает что слайдер вертикальный (false, true)
touch_swipe - будет ли слайдер реагировать на серсорные свайпы
mouse_swipe - будет ли слайдер реагировать на движение активного курсора мышки
slide_delay - задержака перед переходом слайда
slide_duration - длительность анимации перехода слайда
slide_tf - временная css функция анимации перехода слайда
lock - отвечает за блокировку слайдера, если true то сладйер не реагирует ни на какие команды
loop - указывает на что слайдер должен быть зацикленым
min_slide_distence - минимальная дистанция перемещения слайдера чтоб произошло переключение на следующий в данном направлении слайд
*/

class Slider {
    constructor(settings) {
        if (!settings.slider) return console.error('Не задан элемент слайдера!'); //выводим в консоль ошибку если нет элемента слайдера

        //заменяем настройки по умолчанию настройками пользователя если он переданы
        settings = {
            ...{
                moduls: [Swipe_Slider],
                translate_type: 'swiper',
                sliders_wrap_class: 'slider-wrap',
                slides_class: 'slider-slide',
                space_between: 20,
                sliders_previv: 2,
                offset: 0,
                vertical_slider: false,
                touch_swipe: true,
                mouse_swipe: true,
                slide_delay: 0,
                slide_duration: 2000,
                slide_tf: 'linear',
                lock: false,
                loop: true,
                min_slide_distence: 1,
            },
            ...settings,
        };
        //заменяем настройки по умолчанию настройками пользователя если он переданы

        let _this = this;

        _this.settings = settings; //записываем настройки в свойства

        settings.slider_wrap = qs('.' + settings.sliders_wrap_class + '', settings.slider); //записываем оболочку в настройки чтоб не получать её каждый раз

        settings.slider_wrap_sl = w.getComputedStyle(settings.slider_wrap); //записываем живую коллекцию стилей оболочки слайдера т.к. мы будем часто к ней обращатся

        settings.slider.ksn_slider = _this; //записываем в свойства DOM элемента слайдера его объект для дальнейшеого удобства управления извне

        _this.init(); //иницализируем слайдер, тут задаются все размеры позиции отступы и вешаются все слушатели

        settings.moduls.forEach(modul => new modul(_this)); //инициализируем все доп модули для данного слайдера
    }

    //иницализируем слайдер, тут задаются все размеры позиции отступы и вешаются все слушатели
    init() {
        let { loop, slider, slider_wrap, slides_class } = this.settings,
            all_slides = qsa('.' + slides_class + '', slider);

        all_slides.forEach(el => el._on('click', () => console.log(el.textContent)));

        this.set_slider_direction(); //задаём нужные стили слайдеру в зависимости от того вертикальный он или горизонтальный

        this.write_all_slides(); //записываем все слайды

        this.init_loop(); //инициализируем события для цикличного слайдера если он цикличный

        this.set_slides_size(); //устанавливает размеры слайдов

        this.set_slides_gap(); //устанавливаем растояние между слайдами

        this.set_slides_offset(); //устанавливает смещение слайдов слайдера по горизонтали в правую сторону, по вертикали вниз

        w._on('resize', this.resize_recalculate.bind(this)); //при изменение размеров окна браузера пересчитываем все необхдимые значение по новой
    }
    //иницализируем слайдер, тут задаются все размеры позиции отступы и вешаются все слушатели

    //задаём нужные стили слайдеру в зависимости от того вертикальный он или горизонтальный
    set_slider_direction() {
        let { slider_wrap, vertical_slider } = this.settings;

        slider_wrap.style.gridAutoFlow = vertical_slider ? 'row' : 'column'; //задём настрйоки грид сетки
    }
    //задаём нужные стили слайдеру в зависимости от того вертикальный он или горизонтальный

    //записываем все слайды
    write_all_slides() {
        let _this = this,
            { slides_class, slider } = _this.settings;

        _this.settings.all_slides = qsa('.' + slides_class + '', slider);
    }
    //записываем все слайды

    //инициализируем события для цикличного слайдера если он цикличный
    init_loop() {
        let _this = this,
            { loop, slider_wrap, all_slides } = _this.settings;

        if (!loop) return; //прерываем если слайдер не цикличный

        slider_wrap.prepend(all_slides[all_slides.length - 1]); //записываем последний слайд перед первым

        _this.write_all_slides();
    }
    //инициализируем события для цикличного слайдера если он цикличный

    //устанавливает размеры слайдов
    set_slides_size() {
        let _this = this,
            { slider, sliders_previv, space_between, all_slides, vertical_slider } = _this.settings;

        let slider_sl = w.getComputedStyle(slider), //живая коллекция стилей слайдера
            slider_width = +slider_sl.width.replace('px', ''), //получаем ширину слайдера в виде числа
            slider_height = +slider_sl.height.replace('px', ''), //получаем высоту слайдера в виде числа
            full_slides_previv_count = Math.ceil(sliders_previv), //получаем количество слайдов которые видны пользователю округлённое до целого чесла
            slide_width = slider_width, //будет содержать ширину слайда. по умолчанию берём данные от слайдера а потом уже переопределим в зависимости от того что за слайдер вертикальный или горизонтальный
            slide_height = slider_height; //будет содержать высоту слайда

        //если это вертикальный слайдер
        if (vertical_slider) {
            let slider_height_for_slides = slider_height - (full_slides_previv_count - 1) * space_between; //получаем высоту которую должны занимать слайды с учётом их количества на экране

            slide_height = slider_height_for_slides / sliders_previv; //высота одного слайда с учётом количества слайдов на экране
        }
        //если это вертикальный слайдер

        //если горизонтальный слайдер
        else {
            let slider_width_for_slides = slider_width - (full_slides_previv_count - 1) * space_between; //получаем ширину которую должны занимать слайды с учётом их количества на экране

            slide_width = slider_width_for_slides / sliders_previv; //ширина одного слайда с учётом количества слайдов на экране
        }
        //если горизонтальный слайдер

        all_slides.forEach(el => {
            el.style.width = slide_width + 'px'; //здаём ширину каждому слайду
            el.style.height = slide_height + 'px'; //здаём высоту каждому слайду
        });

        _this.settings.slide_width = slide_width; //записываем в свойства ширину слайда
        _this.settings.slide_height = slide_height; //записываем в свойства высоту слайда
    }
    //устанавливает размеры слайдов

    //устанавливаем растояние между слайдами
    set_slides_gap() {
        let { slider_wrap, space_between } = this.settings;

        slider_wrap.style.gridGap = space_between + 'px';
    }
    //устанавливаем растояние между слайдами

    //устанавливает смещение слайдов слайдера по горизонтали в правую сторону, по вертикали вниз
    set_slides_offset() {
        let { vertical_slider, offset, slider_wrap, slider_wrap_sl, slide_width, slide_height } = this.settings;

        if (offset == 0) return; //если не задана смещение завершаем данную функцию

        //если это вертикальный слайдер
        if (vertical_slider) {
            offset = ('' + offset).includes('px') ? +offset.replace('px', '') : slide_height * offset; //если смещение указано не в пикселях то значит оно указано в часятх размера слайда и его нужно вычислить, если же в пикселях то превращаем в число

            slider_wrap.style.transform = 'translateY(' + offset + 'px)'; //задаём смещение
        }
        //если это вертикальный слайдер

        //если горизонтальный слайдер
        else {
            offset = ('' + offset).includes('px') ? +offset.replace('px', '') : slide_width * offset; //если смещение указано не в пикселях то значит оно указано в часятх размера слайда и его нужно вычислить, если же в пикселях то превращаем в число

            slider_wrap.style.transform = 'translateX(' + offset + 'px)'; //задаём смещение
        }
        //если горизонтальный слайдер

        this.settings.slider_base_translate = offset; //записываем базове смещение сладера с учтом отсупа чтоб в дальнейшем при перемотке слайдов не вычислять его по новой
    }
    //устанавливает смещение слайдов слайдера по горизонтали в правую сторону, по вертикали вниз

    //при изменение размеров окна браузера пересчитываем все необхдимые значение по новой
    resize_recalculate() {
        this.set_slides_size(); //устанавливает размеры слайдов
        this.set_slides_offset(); //устанавливает смещение слайдов слайдера по горизонтали в правую сторону, по вертикали вниз
    }
    //при изменение размеров окна браузера пересчитываем все необхдимые значение по новой
}

export default Slider;
