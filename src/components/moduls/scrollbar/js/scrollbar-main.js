let html = qs('html'),
    body = qs('body'),
    header = qs('header');

body.scrollbar = {
    forbidden: false,

    //блокируем прокрутку
    lock: function () {
        if (forbidden) return;
        html.style.scrollbarGutter = 'auto'; //для фаерфокса нужно ещё уберать резервное место под скролбар в html
        body.style.overflow = 'hidden';
    },
    //разблокируем прокрутку
    unlock: function () {
        if (forbidden) return;
        html.style.scrollbarGutter = ''; //для фаерфокса
        body.style.overflow = '';
    },
    //убираем пространство имитирующее скролбар
    hide_scrollbar_space: () => {
        if (forbidden) return;
        body.style.marginRight = '0px';
    },
    //добавляем пространство имитирующее скролбар
    show_scrollbar_space: () => {
        if (forbidden) return;
        let scrollbar_width = GDS.scroll.custom_scrollbar_width + 'px';
        body.style.marginRight = scrollbar_width;
    },
};
header.scrollbar = {
    forbidden: false,
    lock: function () {
        if (forbidden) return;
        header.style.overflow = 'hidden';
    },
    unlock: function () {
        if (forbidden) return;
        header.style.overflow = '';
    },
    hide_scrollbar_space: () => {
        if (forbidden) return;
        header.style.paddingRight = '0px';
    },
    show_scrollbar_space: () => {
        if (forbidden) return;
        header.style.paddingRight = GDS.scroll.custom_scrollbar_width + 'px';
    },
};
