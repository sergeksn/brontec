import { base_spoiler_fade } from '@js-moduls/spoiler';

qsa('.fqa>div').forEach(spoilers_wrap => {
    let spoiler_content_wrap = qs('.fqa__spoiler-wrap', spoilers_wrap),
        title_block = qs('.fqa__spoiler-title', spoilers_wrap),
        title_icon = qs('.fqa__spoiler-title-text-toggle-icon', spoilers_wrap),
        rotate_arrow = () => title_icon.classList.toggle('fqa__spoiler-title-text-toggle-icon--open'); //при скрытии/показе спойлера переключаем класс, чтоб менялся поворот крестика

    //создайм спойлер с прозрачный появленяием контента
    base_spoiler_fade({
        spoiler_content_wrap: spoiler_content_wrap,
        spoiler_content: qs('.fqa__spoiler-wrap-content', spoilers_wrap),
        spoiler_toggle_button: title_block,
        open_start_func: () =>  rotate_arrow(),
        close_start_func: () =>  rotate_arrow(),
    });
    //создайм спойлер с прозрачный появленяием контента

    //меняем цвет обводки пре перемещении указатиеля
    title_block._on('mouseenter', () => {
        if (w.matchMedia('(any-hover: hover)').matches) spoilers_wrap.classList.add('fqa__spoiler--can-click');
    });

    title_block._on('mouseleave', () => {
        spoilers_wrap.classList.remove('fqa__spoiler--can-click');
    });
    //меняем цвет обводки пре перемещении указатиеля

    spoilers_wrap._on(
        'swipe',
        spoiler_content_wrap.ksn_spoiler.toggle_spoiler,
        {},
        {
            permission_directions: {
                top: false,
                right: true,
                bottom: false,
                left: true,
            }, //направления в которых нужно учитывать свайп
            mouse_swipe: false,
            min_px_dist_x: 50, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп
            max_time: 500, //максимальное время, за которое должен быть совершен свайп (ms)

            exceptions_el: [title_block], //не вызываем свайп если нажали на кнопку закрытия
        },
    );
});
