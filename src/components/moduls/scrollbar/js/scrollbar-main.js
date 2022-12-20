let html = qs('html'),
    body = qs('body'),
    header = qs('header');

//управляет скролом body
body.scrollbar = {
    //блокируем прокрутку
    lock: () => {
        html.style.scrollbarGutter = 'auto'; //для фаерфокса нужно ещё уберать резервное место под скролбар в html
        body.style.overflow = 'hidden';
    },
    //разблокируем прокрутку
    unlock: () => {
        html.style.scrollbarGutter = ''; //для фаерфокса
        body.style.overflow = '';
    },
    //убираем пространство имитирующее скролбар
    hide_scrollbar_space: () => {
        body.style.marginRight = '0px';
    },
    //добавляем пространство имитирующее скролбар
    show_scrollbar_space: () => {
        body.style.marginRight = GDS.scroll.custom_page_scrollbar_width + 'px';
    },
};

//управляет скролом header
header.scrollbar = {
    lock: () => {
        header.style.overflow = 'hidden';
    },
    unlock: () => {
        header.style.overflow = '';
    },
    hide_scrollbar_space: () => {
        header.style.paddingRight = '0px';
    },
    show_scrollbar_space: () => {
        header.style.paddingRight = GDS.scroll.custom_page_scrollbar_width + 'px';
    },
};
