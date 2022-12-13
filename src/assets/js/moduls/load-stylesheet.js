/*функция загружает нужные стили для текущего разрешения экрана, а после полной загрузки подгружает те что пока что не нужны*/
let links_list = [
        {
            media_query: '(min-width: 40em)',
            href: '../add-style/min-640em.css',
            added_on_page: false,
        },
        {
            media_query: '(min-width: 60em)',
            href: '../add-style/min-960em.css',
            added_on_page: false,
        },
        {
            media_query: '(min-width: 80em)',
            href: '../add-style/min-1280em.css',
            added_on_page: false,
        },
        {
            media_query: '(min-width: 120em)',
            href: '../add-style/min-1920em.css',
            added_on_page: false,
        },
    ],
    head = d.getElementsByTagName('head')[0];

/*instens - объект для данной ссылки с её параметрами*/
function add_style_link(instens, check_media = true) {
    let al = () => {
        let link = d.createElement('link');

        link.setAttribute('crossorigin', '');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = instens.href;
        link.media = instens.media_query;
        head.append(link);
        instens.added_on_page = true;
        //console.log('load ' + instens.href);
    };

    if (!check_media || w.matchMedia(instens.media_query).matches) al(); /*если не нужно проверять медиа или если удовлетворяет медиаусловию*/
}

/*check_media - если false то ресурсы будут загружены не смотря на медиазапросы*/
function add_links_in_head(check_media = true) {
    links_list.forEach(item => {
        if (item.added_on_page) return; /*если уже добавлен на страницу то пропускаем*/
        add_style_link(item, check_media);
    });
}


//ВАЖНО: не забыть раскоментировать
// add_links_in_head();

// w.addEventListener('resize', add_links_in_head); /*подгружаем нужные стили при ресайзе*/

// w.addEventListener('load', () => {
//     /*после того как полностью всё загружено можно подгрузить оставшиеся стили на всякий случай и убрать загрзку стилей при ресайзе*/
//     w.removeEventListener('resize', add_links_in_head);
//     add_links_in_head(false);
// });
