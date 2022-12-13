import { Header, Header_Search, Header_Cart } from '@header-main-js';
import Scroll_To_Top_Button from '@scroll-to-top-button-main-js';
import { wait, anime } from '@js-libs/func-kit';

let body = qs('body'),
    header = qs('header'),
    header_hidden = qs('.header-hidden'); //скрытая часть меню с поиском и мобильным меню

export default new (class {
    //инициализируем все скрипты для работы открывающиегося блока в хедере
    constructor() {
        //pending to close - в процессе закрытия меню
        //close - меню закрыто
        //pending to open - в процессе открытия меню
        //open - меню открыто
        this.status = 'close'; //статус открытия меню

        [
            qs('.header-visible__search-button'), //кнопка поиска в хедере
            qs('.header-visible__burger-button'), //кнопка бургер меню
            qs('.header-search__close-button'), //кнопка закрытия окна поиска
            qs('#header-overlay'), //подложка хедера
        ].forEach(el => {
            el._on('click', () => this.toggle_header_hidden_block()); //открываем/закрываем скрытый блок при клике на бургер кнопку, кнопку поиска в видимой части хедеера или на подложку хедера
        });

        w._on('resize_optimize', () => this.size_recalculate()); //выполяем нужные действия при ресайзе
    }
    //инициализируем все скрипты для работы открывающиегося блока в хедере

    //функция будет выполянять нужные действия в зависимости от размеров экрана
    size_recalculate() {
        let update_size = () => {
            let hh = Header.get_header_h({ header_poster: true, header_visible: true, header_hidden: true }); //высота хедера
            header.style.height = (hh >= GDS.win.height ? GDS.win.height : hh) + 'px'; //если высота хедера больше высоты окна ставим ему высоту окна чтоб была правильная прокрутка
        };

        if (Header_Search.status === 'pending to close') return wait(() => Header_Search.status, 'close').then(() => update_size()); //если блок с результатами поиска в процессе закрытия дожидаемся закрытия блока с результатами поиска и перестичитываем парметры хедера

        if (Header_Search.status === 'pending to open') return wait(() => Header_Search.status, 'open').then(() => update_size()); //если блок с результатами поиска в процессе открытия дожидаемся открытия блока с результатами поиска и перестичитываем парметры хедера

        if (this.status === 'pending to open') return wait(() => this.status, 'open').then(() => update_size()); //если скрытый блок в процессе открытия дожидаемся открытия блока и перестичитываем парметры хедера

        if (this.status === 'pending to close') return wait(() => this.status, 'close').then(() => update_size()); //если скрытый блок в процессе закрытия дожидаемся закрытия блока и перестичитываем парметры хедера

        update_size(); //для остальных случае просто пересчитываем размеры хедера
    }
    //функция будет выполянять нужные действия в зависимости от размеров экрана

    //открываем/закрываем скрытый блок при клике на бургер кнопку и кнопку поиска в видимой части хедеера
    //ПРИМЕЧАНИЕ: так же если в куки есть поисковой запрос откроет блок с результатами поиска
    async toggle_header_hidden_block() {
        if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

        Header.active_elements.lock(); //блокируем активные элементы в хедере

        await Header.show().catch(e => {}); //пытаем показать хедер, т.к. клик мог произойти в момент когда хедер в движении после скрола, в этом случае мы дождёмся пока хедер полностью не покажется, сели же он уже был полностью виден этот пункт завершится мгновенно
        //ПРИМЕЧАНИЕ: catch(e=>{}) НЕЛЬЗЯ убирать т.к. при попытке закрыть блоки получим исключение в виде того что невозможно показать хедер т.к. он заблокирован

        //если корзина открыта то была заблокированна прокутка хедера, а для правильной анимации открытия хедера нам нужно на вреям вернуть ему прокрутку
        if (Header_Cart.status === 'show') {
            header.scrollbar.unlock(); //разблокируем прокуртку хедера
            header.scrollbar.hide_scrollbar_space(); //убираем пространство имитирующее скролбар
        }
        //если корзина открыта то была заблокированна прокутка хедера, а для правильной анимации открытия хедера нам нужно на вреям вернуть ему прокрутку

        //если скрытый блок хедера закрыт
        if (this.status === 'close') {
            let search_text = localStorage.getItem('search-text'); //пытаемся получить сохранённый поисковой запрос

            //если в локальном хранилище есть сохранённый поисковой запрос
            if (search_text) {
                Header_Search.search_input.value = search_text; //записываем текст поиска в инпут
                Header_Search.search_input.classList.add('started-inputed'); //помечаем что в инпуте есть текст
            }
            //если в локальном хранилище есть сохранённый поисковой запрос

            await this.open(); //открываем блок

            if (!GDS.device.is_touch) Header_Search.search_input.focus({ preventScroll: true }); //ставим курсор на наше поле ввода НЕ на сенсорных экранах

            //если в локальном хранилище есть сохранённый поисковой запрос, начинаем вывод результатов поиска и ждём его окончания
            if (search_text) {
                await Header_Search.open_results_block(); //открываем блок для выдачи результатов поиска

                Header_Search.render_results(search_text); //не ждём т.к. нам нужно чтоб пользователь мог закрыть окно до того как загрузятся результаты
            }
            //если в локальном хранилище есть сохранённый поисковой запрос, начинаем вывод результатов поиска и ждём его окончания
        } //если скрытый блок хедера закрыт

        //если скрытый блок хедера открыт
        else {
            if (Header_Search.status === 'open') await Header_Search.close_results_block(true); //если блок с результатами поиска открыт дожидаемся его закрытия, не показываем меню, а скрываем один инпут

            await this.close(); //дожидаемся сворачивания скрытого блока

            [Header_Search.header_hidden_menu, Header_Search.header_hidden_phone].forEach(el => {
                el.style.display = '';
                el.style.opacity = '';
            }); //убераем стили после полного скрытия скрытого блока чтоб при новом открытия они не мешали правильной визуализации
        }
        //если скрытый блок хедера открыт

        //если корзина открыта, то после завершения анимации открытия хедера нужно снова заблокировать его прокрутку
        if (Header_Cart.status === 'show') {
            header.scrollbar.lock(); //блокируем прокуртку хедера перед показом корзины если открыт скрытый блок хедера
            header.scrollbar.hide_scrollbar_space(); //так же нужно удалить пространство которое резервируется под скрол
        }
        //если корзина открыта, то после завершения анимации открытия хедера нужно снова заблокировать его прокрутку

        Header.active_elements.unlock(); //разблокируем активные элементы в хедере
    }
    //открываем/закрываем скрытый блок при клике на бургер кнопку и кнопку поиска в видимой части хедеера

    //открываем меню
    async open() {
        this.status = 'pending to open'; //помечаем что началось открытие блока

        Header.lock = true; //запрещаем хедеру сворачиваться при прокрутке

        header.classList.add('--open-header-hidden'); //помечаем что открыта скрытая часть хедера

        body.scrollbar.lock(); //блокируем прокуртку документа
        body.scrollbar.show_scrollbar_space(); //добавляем пространство имитирующее скролбар

        //ждём завершение открытия
        await Promise.all([
            anime({
                //увеличиваем высоту хедера чтоб показался скрытый блок
                targets: header,
                height: '+=' + w.getComputedStyle(header_hidden).height,
            }).finished,

            Scroll_To_Top_Button.hide(), //дожидаемся скрытия кнопки скрола вверх

            Header.Overlay.show(), //показываем подложку и ждём завершения её появления
        ]);
        //ждём завершение открытия

        header_hidden.style.position = 'relative'; //меняем позицию скрытого блока чтоб при уменьшении высоты экрана до размера хедера, хедер нормально прокручивался, а если оставим абсолютную розицию то блок просто поднимется под хедером без создания прокрутки

        this.size_recalculate(); //обновляем высоту хедера и данные о его размерме

        this.status = 'open'; //помечеам что блок открыт
    }
    //открываем меню

    //закрываем меню
    async close() {
        this.status = 'pending to close'; //статус откряытия блока

        header.style.height = Header.get_header_h({ header_poster: true, header_visible: true, header_hidden: true }) + 'px'; //для того чтоб хедер плавно скрылся ему нужно задать явно высоту, тут важно получить высоту именно так

        header_hidden.style.position = ''; //меняем позиционирование чтоб скрыть блок снова стал абсолютным, и при уменьшении высоты хедера скрывался под хедером

        await Promise.all([
            Header.Overlay.hide(), //скрываем пожложку хедера
            anime({
                //уменьшаем высоту хедера чтоб скрыть скрытй блок под хедером
                targets: header,
                height: Header.get_header_h({ header_poster: true, header_visible: true }), //уменьшаем высоту до суммы высот постера и видимой части хедера
            }).finished,
        ]);

        //если корзина закрыта
        if (Header_Cart.status !== 'show') {
            body.scrollbar.unlock(); //разблокируем прокуртку документа
            body.scrollbar.hide_scrollbar_space(); //убираем пространство имитирующее скролбар
        }
        //если корзина закрыта

        Scroll_To_Top_Button.toggle_show_button(); //показываем кнопку скрола если нужно

        Header.lock = false; //разрешаем хедеру сворачиваться при прокрутке

        this.size_recalculate(); //обновляем высоту хедера и данные о его размерме

        header.classList.remove('--open-header-hidden'); //помечаем что закрыта скрытая часть хедера

        this.status = 'close'; //помечеам что меню закрыто
    }
    //закрываем меню
})();
