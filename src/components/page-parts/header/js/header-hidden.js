import { Header, Header_Search } from '@header-main-js';
import Scroll_To_Top_Button from '@scroll-to-top-button-main-js';
import { Header_Overlay } from '@overlays-main-js';
import { wait } from '@js-libs/func-kit';
import { get_cookie } from '@js-libs/cookie';
import anime from '@js-libs/anime';

export default new (class {
    //pending to close - в процессе закрытия меню
    //close - меню закрыто
    //pending to open - в процессе открытия меню
    //open - меню открыто
    status = 'close'; //статус открытия меню

    //определяет какую часть экрана занимает блок после открытия
    //part - после открытия занимает часть экрана, т.е. высота меню + высота открытого блока меньше высоты окна раузера
    //full - после открытия занимает всё окно браузера, т.е. высота меню + высота открытого блока больше или равноа высоте окна раузера
    size;

    //инициализируем все скрипты для работы открывающиегося блока в хедере
    constructor() {
        let d = document;
        //записываем все неоходимые переменные для удобства доступа
        this.body = d.getElementsByTagName('body')[0];
        this.header = d.getElementsByTagName('header')[0];
        this.header_visible = d.querySelector('.header-visible'); //постоянно видимая часть меню
        this.header_visible_search_button = d.querySelector('.header-visible__search-button');
        this.header_hidden = d.querySelector('.header-hidden'); //скрытая часть меню с поиском и мобильным меню
        this.burger = d.querySelector('.header-visible__burger'); //кнопка бургер меню
        //записываем все неоходимые переменные для удобства доступа

        [this.header_visible_search_button, this.burger].forEach(el => {
            el._on('click touchend', this.toggle_header_hidden_block.bind(this)); //открываем/закрываем скрытый блок при клике на бургер кнопку и кнопку поиска в видимой части хедеера
        });

        window._on('resize_optimize', this.size_recalculate.bind(this)); //выполяем нужные действия при ресайзе
    }
    //инициализируем все скрипты для работы открывающиегося блока в хедере

    //функция будет выполянять нужные действия в зависимости от размеров экрана
    size_recalculate() {
        if (Header_Search.status === 'pending to open' || Header_Search.status === 'open') return; //если окно с результатами поиска открыто или в процессе открытия то заверашем данную функцию

        this.size = Header.get_header_h({ header_poster: Header.has_header_poster, header_visible: true, header_hidden: true }) >= GDS.win.height ? 'full' : 'part'; //если высота хедера с банером + выоста скрытого блока больше или равна высоте окна браузера full, если же высота хедера с банером + выоста скрытого блока меньше высоты окна браузера part
        //если высота хедера с банером + выоста скрытого блока больше или равна высоте окна браузера

        let update_size = () => {
            this.header.style.height = ''; //у хедеар могла быть задана высота если высота окна была меньше восоты скрытого блока меню, чистим её

            if (this.size === 'full') {
                this.header.style.height = GDS.win.height + 'px';
                this.header.style.overflow = ''; //т.к. блок уже открылся ставим значение по умолчанию чтоб добавлять прокуртку в хедер если нужно
            } //если размер открытого блока больше или равен высоте окна задаём хедеру высоту окна чтоб хедер имел прокуту и стал чем-то вроде нового документа
            else {
                this.header.style.overflow = 'visible'; //нужно добавлять чтоб было видно всё содержимое хедера когда он не больше окна браузера, чтоб было видно тень скрытого блока снизу
            }
        };

        if (Header_Search.status === 'pending to close') return wait(() => this.status, 'close').then(() => update_size()); //если блок с результатами поиска в процессе закрытия дожидаемся закрытия блока с результатами поиска и перестичитываем парметры хедера

        if (this.status === 'open') return update_size(); //если скрытый блок открыт обновляем значения размеров и прокрутки хедера

        if (this.status === 'pending to open') return wait(() => this.status, 'open').then(() => update_size()); //если скрытый блок в процессе открытия дожидаемся открытия блока и перестичитываем парметры хедера
    }
    //функция будет выполянять нужные действия в зависимости от размеров экрана

    //открываем/закрываем скрытый блок при клике на бургер кнопку и кнопку поиска в видимой части хедеера
    //ПРИМЕЧАНИЕ: так же если в куки есть поисковой запрос откроет блок с результатами поиска
    async toggle_header_hidden_block() {
        if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

        Header.active_elements.lock(); //блокируем активные элементы в хедере

        if (Header.status !== 'open') await Header.show(); //если мы кликнули в момент когда хедер не открыт, вероятнее всего он в процессе закрытия или открытия, то мы дожидаемся пока хедер не откроется

        //if (GDS.cart.status === "open") await GDS.cart.close_cart(); //если открыта корзина то перед открытием или закрытием блока дожидаемся скрытия корзины

        if (this.status === 'close') {
            let search_data = get_cookie('search_data'), //получаем последнее что пользователь вводил для поиска
                search_data_cookie_status = search_data !== undefined && search_data.length > 1 ? true : false; //проверяем соответствует ли запись в куки условию

            //если в куки есть поисковой запрос и он блоше чем один символ
            if (search_data_cookie_status) {
                Header_Search.search_input.value = search_data; //записываем текст поиска в инпут
                Header_Search.search_input.classList.add('started-inputed'); //помечаем что в инпуте есть текст
            }
            //если в куки есть поисковой запрос и он блоше чем один символ

            await this.open(); //открываем блок

            if (!GDS.device.is_touch) Header_Search.search_input.focus({ preventScroll: true }); //ставим курсор на наше поле ввода НЕ на сенсорных экранах

            //если в куки есть поисковой запрос и он блоше чем один символ, начинаем вывод результатов поиска и ждём его окончания
            if (search_data_cookie_status) {
                await Header_Search.open_results_block(); //открываем блок для выдачи результатов поиска

                Header_Search.render_results(search_data); //не ждём т.к. нам нужно чтоб пользователь мог закрыть окно до того как загрузятся результаты
            }
            //если в куки есть поисковой запрос и он блоше чем один символ, начинаем вывод результатов поиска и ждём его окончания
        } else if (this.status === 'open') {
            if (Header_Search.status === 'open') await Header_Search.close_results_block(); //если блок с результатами поиска открыт дожидаемся его закрытия

            await this.close(); //дожидаемся сворачивания скрытого блока

            [Header_Search.header_hidden_menu, Header_Search.header_hidden_phone].forEach(el=>{
                el.style.display = '';
                el.style.opacity = '';
            });//убераем стили после полного скрытия скрытого блока чтоб при новом открытия они не мешали правильной визуализации
        }

        Header.active_elements.unlock(); //разблокируем активные элементы в хедере
    }
    //открываем/закрываем скрытый блок при клике на бургер кнопку и кнопку поиска в видимой части хедеера

    //открываем меню
    async open() {
        this.status = 'pending to open'; //помечаем что началось открытие блока

        this.body.classList.add('lock-scroll'); //блокируем прокуртку документа

        this.header.classList.add('--open-header-hidden'); //помечаем что открыта скрытая часть хедера, это трансформирует бургер кнопку

        this.header.style.overflow = 'visible'; //добавляем чтоб во время открытия хедера он был виден по мере появления

        this.header_hidden.style.display = 'block'; //показываем блок в документе

        let anim_open_header_hidden = anime({
            targets: this.header_hidden,
            translateY: window.getComputedStyle(this.header_hidden).height,
            duration: GDS.anim.time,
            easing: GDS.anim.graph,
        }).finished; //опускаем весь скрытый блок

        //ждём завершение открытия
        await Promise.all([
            anim_open_header_hidden, //опускаем весь скрытый блок

            Scroll_To_Top_Button.hide(), //плавно скрываем кнопку скрола вверх

            Header_Overlay.show(), //показываем подложку и ждём завершения её появления
        ]);
        //ждём завершение открытия

        this.header_hidden.style.transform = ''; //убираем стили отставленые после анимации

        this.header_hidden.style.position = 'relative'; //меняем позицию скрытого блока

        this.size_recalculate(); //обновляем стили хедера после открытия

        this.status = 'open'; //помечеам что блок открыт
    }
    //открываем меню

    //закрываем меню
    async close() {
        this.status = 'pending to close'; //статус откряытия блока

        this.header.classList.remove('--open-header-hidden'); //помечаем что закрыта скрытая часть хедера, это трансформирует крестик в бургер кнопку

        this.header.style.height = ''; //у хедеар могла быть задана высота, чистим её

        this.header.style.overflow = 'visible'; //для того чтоб скрытый блок стал непрокручиваемой частью хедера и его можно было скрыть

        this.header_hidden.style.position = ''; //меняем позиционирование чтоб скрыть блок

        this.header_hidden.style.transform = `translateY(${window.getComputedStyle(this.header_hidden).height})`; //расчитываем и устанавливаем стартовое значение смещение по оси Y для скрытого блока

        let anim_close_header_hidden = anime({
            targets: this.header_hidden,
            translateY: 0,
            duration: GDS.anim.time,
            easing: GDS.anim.graph,
        }).finished; //закрываем скртый блок

        await Promise.all([Header_Overlay.hide(), anim_close_header_hidden]); //плавно скрываем блок меню и подложку, а так же меняем высоту скролбара хедера

        this.header.style.overflow = ''; //возвращаем стандартную прокрутку в хедер

        this.header_hidden.style.display = ''; //скрываем блок из документа

        this.body.classList.remove('lock-scroll'); //разблокируем прокуртку документа

        Scroll_To_Top_Button.toggle_show_button(); //показываем кнопку скрола если нужно

        this.status = 'close'; //помечеам что меню закрыто
    }
    //закрываем меню
})();