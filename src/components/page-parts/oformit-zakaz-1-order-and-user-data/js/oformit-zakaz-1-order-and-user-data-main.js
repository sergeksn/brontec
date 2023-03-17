let user_data_form = qs('#user-data'),
    user_data_form_button = qs('.oformit-zakaz-4__pay-run-button');

user_data_form._on(
    'submit',
    function (e) {
        e.preventDefault();
        console.log('done');
    },
    { passive: false },
);
