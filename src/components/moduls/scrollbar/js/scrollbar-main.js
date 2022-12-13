let html = qs('html'),
    body = qs('body'),
    header = qs('header');

//управляет скролом body
body.scrollbar = {
    forbid_lock: false,
    forbid_unlock: false,
    forbid_hide_scrollbar_space: false,
    forbid_show_scrollbar_space: false,

    //блокируем прокрутку
    lock: function () {
        html.style.scrollbarGutter = 'auto'; //для фаерфокса нужно ещё уберать резервное место под скролбар в html
        body.style.overflow = 'hidden';
    },
    //разблокируем прокрутку
    unlock: function () {
        html.style.scrollbarGutter = ''; //для фаерфокса
        body.style.overflow = '';
    },
    //убираем пространство имитирующее скролбар
    hide_scrollbar_space: () => {
        body.style.marginRight = '0px';
    },
    //добавляем пространство имитирующее скролбар
    show_scrollbar_space: () => {
        let scrollbar_width = GDS.scroll.custom_scrollbar_width + 'px';
        body.style.marginRight = scrollbar_width;
    },
};

//управляет скролом header
header.scrollbar = {
    forbid_lock: false,
    forbid_unlock: false,
    forbid_hide_scrollbar_space: false,
    forbid_show_scrollbar_space: false,
    
    lock: function () {
        header.style.overflow = 'hidden';
    },
    unlock: function () {
        header.style.overflow = '';
    },
    hide_scrollbar_space: () => {
        header.style.paddingRight = '0px';
    },
    show_scrollbar_space: () => {
        header.style.paddingRight = GDS.scroll.custom_scrollbar_width + 'px';
    },
};
