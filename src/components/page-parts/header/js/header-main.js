import Header_Poster from './header-poster';
import Header_Visible from './header-visible';
import Header_Hidden from './header-hidden';
import Header_Search from './header-search';

let Header = new (class {
    status = 'show'; //хранит текущее состояние блока хедера, свёрнут он или открыт или в процессе

    constructor() {
        let d = document;
        //записываем все неоходимые переменные для удобства доступа
        this.header = d.getElementsByTagName('header')[0]; //хедер
        this.header_poster = d.querySelector('.header-poster');
        this.has_header_poster = this.header_poster ? true : false; //определяет есть ли в хедере банер
        this.header_background = d.getElementById('header-background');
        this.header_visible = d.querySelector('.header-visible');
        this.header_hidden = d.querySelector('.header-hidden');
        //записываем все неоходимые переменные для удобства доступа

        this.header_active_elements_set_data(); //задаёт и управляет доступностью активных элементов в хедере

        window._on('scroll_throttle', this.toggle_header.bind(this)); //скрываем/показываем хедер при прокрутке

        window._on('resize_optimize', () => {
            this.toggle_header.bind(this); //проверяем нужно ли скрыть хедер
            this.header_background.style.height = `${this.get_header_h({ header_poster: this.has_header_poster, header_visible: true })}px`; //пересчитываем высоту фона хедера
        });

        this.header.addEventListener('transitionend', () => (this.status = this.status === 'pending to show' ? 'show' : 'hide')); //после того как переход transition в хедере завершится ставим соответствующий текущий статус его видимости
    }

    //устанавливает список активных элементов и функции их включени/отключения
    header_active_elements_set_data() {
        let d = document;
        this.active_elements = {
            status_lock: false, //определяет заблокированны активные элементы в хедере или нет
            elements: [
                //все активные эльменты которые есть в хедере
                d.querySelector('.header-poster__close>button'),
                d.querySelector('.header-visible__burger>button'),
                d.querySelector('.header-visible__cart-button>button'),
                d.querySelector('.header-visible__search-button>button'),
                d.querySelector('.header-search__close-button'),
            ],
            lock: function () {
                //блокирует все интерактывные элемеры в хедере
                if (GDS.win.flicker_active_elements)
                    this.elements.forEach(elem => {
                        if (elem) elem.classList.add('disabled'); //обязательно проверяем существует ли данный элемент, т.к. может оказаться что той же кнопки зарытия банера нет, т.к. самого банера нет
                    }); //помечеам все элементы как отключенные
                this.status_lock = true; //указываем что все элементы успешно заблокированны
            },
            unlock: function () {
                //разблокирует все интерактывные элемеры в хедере
                if (GDS.win.flicker_active_elements)
                    this.elements.forEach(elem => {
                        if (elem) elem.classList.remove('disabled'); //обязательно проверяем существует ли данный элемент, т.к. может оказаться что той же кнопки зарытия банера нет, т.к. самого банера нет
                    }); //помечеам все элементы как активные
                this.status_lock = false; //указываем что все элементы успешно разблокированны
            },
        };
    }
    //устанавливает список активных элементов и функции их включени/отключения

    //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера
    //всё зависит от того что передано
    get_header_h(searched_height = {}) {
        searched_height = Object.assign(
            {
                header_poster: false,
                header_visible: false,
                header_hidden: false,
            },
            searched_height,
        ); //получаем те данные которые нужно получить объединов объекты по умолчанию с тем что передал скрипт

        let result = 0;

        for (let el in searched_height) {
            if (searched_height[el]) {
                let el_h = window.getComputedStyle(this[el]).height;
                if (el_h === 'auto') continue;
                result += +el_h.replace('px', '');
            }
        }

        return result;
    }
    //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера

    //отпускает вниз и показывает блок хедера
    async show() {
        if (this.status === 'show' || this.status === 'pending to show') return;

        this.status = 'pending to show';

        this.header.style.transform = `translateY(0)`;
    }
    //отпускает вниз и показывает блок хедера

    //поднимает вверх и скрывает блок хедера
    async hide() {
        if (this.status === 'hide' || this.status === 'pending to hide') return; //если скрыта или в процессе скрытия то не нужно пытаться скрывать снова

        this.status = 'pending to hide';

        let y = this.get_header_h({ header_poster: this.has_header_poster, header_visible: true });

        this.header.style.transform = `translateY(-${y}px)`;
    }
    //поднимает вверх и скрывает блок хедера

    //функция оправляет сворачиванием и разворачиванием хедера
    async toggle_header() {
        if (this.active_elements.status_lock) return; //если заблокированны интерактивные элементы в хедере мы не чего не делаем с хедером

        GDS.scroll.dir === 'bottom' && GDS.scroll.value > this.get_header_h({ header_poster: this.has_header_poster, header_visible: true }) ? await this.hide() : await this.show(); //если скролим вниз и высота скрола больше высоты хедера скрываем хедер, в противном случае показываем хедер
    }
    //функция оправляет сворачиванием и разворачиванием хедера
})();

export { Header, Header_Poster, Header_Visible, Header_Hidden, Header_Search };
