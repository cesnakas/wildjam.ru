const swiper = new Swiper ('.swiper', {
    slidesPerView: 4,
    spaceBetween: 20,
    // loop: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    scrollbar: {
        el: ".swiper-scrollbar",
        hide: false,
    },
});
