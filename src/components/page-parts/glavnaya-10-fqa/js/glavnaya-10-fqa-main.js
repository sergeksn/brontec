let spoilers = qsa('.glavnaya-10__fqa-wrap>div');

function toglle_spoiler() {
    if (this.classList.contains('open-spoiler')) {
        let content_block = qs('.glavnaya-10__fqa-wrap-spoiler-content', this);

        content_block.style.transitionProperty = 'height margin padding';
        content_block.style.transitionDuration = '1000ms';
        content_block.style.height = content_block.offsetHeight + 'px';

        content_block.offsetHeight;

        content_block.style.overflow = 'hidden';
        content_block.style.height = 0;
        content_block.style.paddingTop = 0;
        content_block.style.paddingBottom = 0;
        content_block.style.marginTop = 0;
        content_block.style.marginBottom = 0;

        setTimeout(() => {
            this.classList.remove('open-spoiler');

            //content_block.style.display = 'none';

            content_block.hidden = true;

            content_block.style.height = '';
            content_block.style.overflow = '';
            content_block.style.paddingTop = '';
            content_block.style.paddingBottom = '';
            content_block.style.marginTop = '';
            content_block.style.marginBottom = '';
            content_block.style.transitionProperty = '';
            content_block.style.transitionDuration = '';
        }, 1000);
    } else {
        let content_block = qs('.glavnaya-10__fqa-wrap-spoiler-content', this);

        //content_block.style.display = 'block';
        content_block.hidden = false;

        let h = content_block.offsetHeight;

        console.log(h);
        content_block.style.overflow = 'hidden';
        content_block.style.height = 0;
        content_block.style.paddingTop = 0;
        content_block.style.paddingBottom = 0;
        content_block.style.marginTop = 0;
        content_block.style.marginBottom = 0;

        content_block.offsetHeight;

        content_block.style.transitionProperty = 'height margin padding';
        content_block.style.transitionDuration = '1000ms';
        content_block.style.height = h + 'px';

        content_block.style.paddingTop = '';
        content_block.style.paddingBottom = '';
        content_block.style.marginTop = '';
        content_block.style.marginBottom = '';

        setTimeout(() => {
            this.classList.add('open-spoiler');

            content_block.style.height = '';
            content_block.style.overflow = '';
            content_block.style.transitionProperty = '';
            content_block.style.transitionDuration = '';
        }, 1000);
    }
}

spoilers.forEach(el => {
    el._on('click', toglle_spoiler);
});
