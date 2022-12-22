let wrap = qs('.komplekt-3__kit-data-template-interactiv-img-wrap'),
    CONTROLLER = {
        init: function () {
            if (!wrap) return; //если на этой странице нет такого модуля

            let all_plusiki = qsa('.komplekt-3__kit-data-template-interactiv-img-wrap-plusik', wrap);

            all_plusiki[0]._on('mouseenter', function () {
                qs('.komplekt-3__kit-data-template-interactiv-img-wrap-plusik-pop-up', this).classList.add('active');
                console.log(this);
            });

            all_plusiki[0]._on('mouseleave', function () {
                qs('.komplekt-3__kit-data-template-interactiv-img-wrap-plusik-pop-up', this).classList.remove('active');
                console.log(this);
            });
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля
