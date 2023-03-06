import { base_spoiler_fade } from '@js-moduls/spoiler';

let dostavka_i_oplata = qs('.dostavka-i-oplata');

if (dostavka_i_oplata) {
    qsa('.dostavka-i-oplata__razdel').forEach(spoilers_wrap => {
        let title_block = qs('.dostavka-i-oplata__razdel-title', spoilers_wrap),
            title_icon = qs('.dostavka-i-oplata__razdel-title-spoiler-toggle-icon', spoilers_wrap),
            spoiler_content_wrap = qs('.dostavka-i-oplata__razdel-content-wrap', spoilers_wrap),
            rotate_cross = () => {
                if (spoiler_content_wrap.ksn_spoiler.status === 'hide' || spoiler_content_wrap.ksn_spoiler.status === 'pending to hide') {
                    title_icon.classList.add('dostavka-i-oplata__razdel-title-spoiler-toggle-icon--open'); //при скрытии/показе спойлера переключаем класс, чтоб менялся поворот крестика
                } else if (spoiler_content_wrap.ksn_spoiler.status === 'show' || spoiler_content_wrap.ksn_spoiler.status === 'pending to show') {
                    title_icon.classList.remove('dostavka-i-oplata__razdel-title-spoiler-toggle-icon--open'); //при скрытии/показе спойлера переключаем класс, чтоб менялся поворот крестика
                }
            };

        //создайм спойлер с прозрачный появленяием контента
        base_spoiler_fade({
            spoiler_content_wrap: spoiler_content_wrap,
            spoiler_content: qs('.dostavka-i-oplata__razdel-content-wrap-content', spoilers_wrap),
            spoiler_toggle_button: title_block,
            open_start_func: () => rotate_cross(),
            close_start_func: () => rotate_cross(),
        });
        //создайм спойлер с прозрачный появленяием контента
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
