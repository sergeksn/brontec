let detal_checkbox = qs('.detal-1-add-to-kit__data-add-to-checbox .custom-checbox');

//меняем GET запос всех ссылок перехода на страницу комплекта
if (detal_checkbox) {
    let checkbox_detal = detal_checkbox.getAttribute('data-item'),
        link_to_kit = qs('.detal-1-add-to-kit__data a'),
        base_kit_url = link_to_kit.getAttribute('href').split('?')[0],
        all_links_to_kit = qsa('.detal-link-to-kit');

    detal_checkbox._on('click', _ => {
        detal_checkbox.classList.toggle('active');

        let action = detal_checkbox.classList.contains('active') ? 'add' : 'remove';

        all_links_to_kit.forEach(el => el.setAttribute('href', base_kit_url + '?kit-composition-' + action + '=' + checkbox_detal));
    });
}
