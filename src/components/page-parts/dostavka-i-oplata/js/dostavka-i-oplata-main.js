import {Spoiler} from '@js-moduls/spoiler';
import Fade from '@js-moduls/fade';

let dostavka_i_oplata = qs('.dostavka-i-oplata');

if (dostavka_i_oplata) {
    qsa('.dostavka-i-oplata__razdel').forEach(spoilers_wrap => {
        let spoiler_content_wrap = qs('.dostavka-i-oplata__razdel-content-wrap', spoilers_wrap),
            spoiler_content = qs('.dostavka-i-oplata__razdel-content-wrap-content', spoilers_wrap),
            title_block = qs('.dostavka-i-oplata__razdel-title', spoilers_wrap),
            title_icon = qs('.dostavka-i-oplata__razdel-title-spoiler-toggle-icon', spoilers_wrap);

        //создаём для каждого блока объекты для управления нужными переходами
        new Spoiler(spoiler_content_wrap);
        new Fade(spoiler_content);

        //функция управляет открытием и закрытием спойлера в зависимости от его состояния
        function toggle_spoiler() {
            let rotate_cross = () => {
                if (spoiler_controller.status === 'hide' || spoiler_controller.status === 'pending to hide') {
                    title_icon.classList.add('dostavka-i-oplata__razdel-title-spoiler-toggle-icon--open'); //при скрытии/показе спойлера переключаем класс, чтоб менялся поворот крестика
                } else if (spoiler_controller.status === 'show' || spoiler_controller.status === 'pending to show') {
                    title_icon.classList.remove('dostavka-i-oplata__razdel-title-spoiler-toggle-icon--open'); //при скрытии/показе спойлера переключаем класс, чтоб менялся поворот крестика
                }
            };

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
            //только для экранов меньше 640
            if (GDS.win.width_rem < 40) {
                if (e.type === 'keydown' && e.keyCode !== 13) return; //если мы выбрали спойлер через таб то мы его открываем только при нажатом энтере
                toggle_spoiler();
            }
            //только для экранов меньше 640
        });
        //открываем/закрываем спойлеры по клику
    });

    let all_spoiler_contents = qsa('.dostavka-i-oplata__razdel-content-wrap-content', dostavka_i_oplata); //все блоки скрытого контента в спойлерах

    //при ресайзе обновляе статус видимости спойлеров
    w._on('resize_optimize', function () {
        if (GDS.win.width_rem <= 40) {
            all_spoiler_contents.forEach(el => {
                el.ksn_fade.update_status();
            });
        }
    });
    //при ресайзе обновляе статус видимости спойлеров
}
