import {Spoiler} from '@js-moduls/spoiler';
import Fade from '@js-moduls/fade';

qsa('.glavnaya-10__fqa-wrap>div').forEach(spoilers_wrap => {
    let spoiler_content_wrap = qs('.glavnaya-10__fqa-wrap-spoiler-wrap', spoilers_wrap),
        spoiler_content = qs('.glavnaya-10__fqa-wrap-spoiler-wrap-content', spoilers_wrap),
        title_block = qs('.glavnaya-10__fqa-wrap-spoiler-title', spoilers_wrap),
        title_icon = qs('.glavnaya-10__fqa-wrap-spoiler-title-text-toggle-icon', spoilers_wrap);

    //создаём для каждого блока объекты для управления нужными переходами
    new Spoiler(spoiler_content_wrap);
    new Fade(spoiler_content);

    //функция управляет открытием и закрытием спойлера в зависимости от его состояния
    function toggle_spoiler() {
        let rotate_cross = () => title_icon.classList.toggle('glavnaya-10__fqa-wrap-spoiler-title-text-toggle-icon--open'); //при скрытии/показе спойлера переключаем класс, чтоб менялся поворот крестика

        let spoiler_controller = spoiler_content_wrap.ksn_spoiler,
            spoiler_params = {
                duration: 300,
                tf: 'ease-out',
            },
            fade_controller = spoiler_content.ksn_fade,
            fade_params = {
                duration: 350,
                tf: 'ease-out',
            };

        //если спройлер закрыт или в процессе закрытия
        if (spoiler_controller.status === 'hide' || spoiler_controller.status === 'pending to hide') {
            rotate_cross(); //поворачиваем крестик

            spoiler_controller
                .spoiler_show(spoiler_params) //ждём открытия спойлера
                .then(() => {
                    fade_controller
                        .fade_show(fade_params) //ждём показа содержимого
                        .catch(() => {});
                })
                .catch(() => {});
        }
        //если спройлер закрыт или в процессе закрытия

        //если спройлер открыт
        else if (spoiler_controller.status === 'show') {
            //если контент скрыт или в процесе скрытия
            if (fade_controller.status === 'hide' || fade_controller.status === 'pending to hide') {
                fade_controller
                    .fade_show(fade_params) //ждём показа контента
                    .catch(() => {});
            }
            //если контент скрыт или в процесе скрытия

            //если контент виден или в процессе появления
            else if (fade_controller.status === 'show' || fade_controller.status === 'pending to show') {
                fade_controller
                    .fade_hide(fade_params) //ждём сокрытия контента
                    .then(() => {
                        rotate_cross(); //поворачиваем крестик

                        spoiler_controller
                            .spoiler_hide(spoiler_params) //закрываем спойлер
                            .catch(() => {});
                    })
                    .catch(() => {});
            }
            //если контент виден или в процессе появления
        }
        //если спройлер открыт

        //если спройлер в процессе открытия
        else if (spoiler_controller.status === 'pending to show') {
            rotate_cross(); //поворачиваем крестик

            spoiler_controller
                .spoiler_hide(spoiler_params) //закрываем спойлер
                .catch(() => {});
        }
        //если спройлер в процессе открытия
    }
    //функция управляет открытием и закрытием спойлера в зависимости от его состояния

    //открываем/закрываем спойлеры по клику
    title_block._on('click keydown', async e => {
        if (e.type === 'keydown' && e.keyCode !== 13) return; //если мы выбрали спойлер через таб то мы его открываем только при нажатом энтере
        toggle_spoiler();
    });
    //открываем/закрываем спойлеры по клику

    //меняем цвет обводки пре перемещении указатиеля
    title_block._on('mouseenter', () => {
        if (w.matchMedia('(any-hover: hover)').matches) spoilers_wrap.classList.add('glavnaya-10__fqa-wrap-spoiler--can-click');
    });

    title_block._on('mouseleave', () => {
        spoilers_wrap.classList.remove('glavnaya-10__fqa-wrap-spoiler--can-click');
    });
    //меняем цвет обводки пре перемещении указатиеля

    spoilers_wrap._on(
        'swipe',
        toggle_spoiler,
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
