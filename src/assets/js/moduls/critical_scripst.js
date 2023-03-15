//в функции include_neaded_polyfils_and_include_main_js_fill поменять http://localhost:3579/

//содержит все скрипты которые необходимы до полной загрузки страницы
w.critical_scripts = {
    //фнукция проверяет есть ли в корзине товары и если есть то мы отображаем их количество в счётчиках корзины
    check_cart_count_and_show_counter: function () {
        /*если в корзине что-то есть то показываем счётчик*/
        let cart_data = localStorage.getItem('cart-data');
        /*проверяем чтоб корзина не была пуста*/
        if (cart_data && cart_data != '{}') {
            cart_data = JSON.parse(cart_data);
            let count = Object.keys(cart_data).length; /*получаем количество товаров в корзине*/
            [qs('.cart__header-counter'), qs('.header-visible__cart-counter')].forEach(el => {
                el.textContent = count;
                el.style.opacity = '1';
            });
        }
    },
    //фнукция проверяет есть ли в корзине товары и если есть то мы отображаем их количество в счётчиках корзины

    //првоеряем локальное хранилище и если нужно скрываем рекламный постер в хедере
    check_if_nead_remove_poster_data: function () {
        let header_poster = qs('.header-poster'),
            header_poster_id = header_poster.getAttribute('id'),
            storage_header_poster = JSON.parse(w.localStorage.getItem('advertising-posters')); /*пытаемся получить значение для данного рекламоного постера скрыт он или нет*/

        if (storage_header_poster?.header_poster?.[header_poster_id] === 'hide') header_poster.remove(); //если еслить запись о постере хедера и там указано что он должен быть скрыт удаляем его из документа
    },
    //првоеряем локальное хранилище и если нужно скрываем рекламный постер

    //задаём высоту подложки хедера чтоб верх страниц имел правильный отступ
    set_header_backgroung_heigth: function () {
        let header = qs('header'),
            header_background = qs('#header-background'),
            header_height = w.getComputedStyle(header).height; /*высота хедера числом*/
        header_background.style.height = header_height; /*задаём высоту подложки хедера*/
    },
    //задаём высоту подложки хедера чтоб верх страниц имел правильный отступ

    /*скрипт меняет высоту декорации футера в зависимости от размера экрана*/
    footer_decoration_recalkulate: function () {
        let recalkulate = () => {
            let f = d.getElementsByTagName('footer')[0],
                fd = f.querySelector('.footer__decoration'),
                fm = f.querySelector('.footer__menu'),
                fl = f.querySelector('.footer__logo');

            if (d.documentElement.clientWidth / parseFloat(w.getComputedStyle(d.documentElement).fontSize) < 40) {
                if (!fd.classList.contains('fd-small-height')) {
                    fd.style.height = parseFloat(w.getComputedStyle(f).paddingTop) + parseFloat(w.getComputedStyle(fm).height) + parseFloat(w.getComputedStyle(fl).marginTop) + parseFloat(w.getComputedStyle(fl).height) + parseFloat(w.getComputedStyle(fl).marginBottom) + 'px';

                    fd.classList.add('fd-small-height');
                    fd.classList.remove('fd-full-height');
                }
            } else {
                if (!fd.classList.contains('fd-full-height')) {
                    fd.style.height = '100%';

                    fd.classList.remove('fd-small-height');
                    fd.classList.add('fd-full-height');
                }
            }
        };
        recalkulate();
        w.addEventListener('resize', recalkulate);
    },
    /*скрипт меняет высоту декорации футера в зависимости от размера экрана*/

    /*подключаем при необходимости полифилы, а после их загрузки подключаем основной скрипт*/
    include_neaded_polyfils_and_include_main_js_fill: async function () {
        /*данные о полифилах и их процессе загрузки*/
        GDS.polyfills = [
            {
                name: 'IntersectionObserver',
                /*имя файла скрипта полифила*/
                nead_include: !('IntersectionObserver' in w) || !('IntersectionObserverEntry' in w) || !('intersectionRatio' in w.IntersectionObserverEntry.prototype) || !('isIntersecting' in w.IntersectionObserverEntry.prototype),
                /*если условие true то полифил будет загружен*/
            },
            {
                name: 'AbortController',
                nead_include: (typeof w.Request === 'function' && !w.Request.prototype.hasOwnProperty('signal')) || !w.AbortController,
            },
        ];

        let load_promise_list = [],
            /*будет сохранять примис загрузки для каждого нужного скрипта полифила и как только все промисы выполняться, т.е. все скрипты полифилов будут загружены мы начнём грузить основной скрипт*/
            wrap = d.createDocumentFragment(),
            body = d.body;

        GDS.polyfills.forEach(item => {
            if (!item.nead_include) return; /*если полифил не нужен*/

            let s = d.createElement('script');

            load_promise_list.push(new Promise(resolve => (s.onload = () => resolve())));

            s.src = GDS.host_url + `${item.name}.js`;

            wrap.append(s);
        });

        body.append(wrap);

        await Promise.all(load_promise_list); /*ждём загрузки всех полифилов*/

        /*после загрузки всех необходимых полифилов можно загружать основыне скрипты для сайта*/
        let main_s = d.createElement('script');
        main_s.src = KSN_DEV_MODE ? 'http://localhost:3579/main.js' : GDS.host_url + '/wp-content/themes/serge_produkt/assets/js/main.js';

        body.append(main_s);
    },
    /*подключаем при необходимости полифилы, а после их загрузки подключаем основной скрипт*/
};
//содержит все скрипты которые необходимы до полной загрузки страницы
