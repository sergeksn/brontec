import { set_local_storage } from '@js-libs/func-kit';

let accept_cookies_block = qs('.accept-cookies'),
    accept_cookies_button = qs('.accept-cookies__button', accept_cookies_block);

(() => {
    if (!localStorage.getItem('accept_cookies')) set_local_storage('accept_cookies', 'false');

    if (localStorage.getItem('accept_cookies') != 'true') {
        console.log(accept_cookies_button);
        accept_cookies_block.style.display = 'grid';

        accept_cookies_button.addEventListener('click', () => {
            set_local_storage('accept_cookies', 'true');
            accept_cookies_block.style.display = '';
        });
    }
})();
