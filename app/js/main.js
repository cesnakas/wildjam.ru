/**
 * Sergei Česnakas
 * https://www.cesnakas.com
 */

// Navigation
$('#navMenu').click( function() {
    $('.navigation__wrap').toggle();
});

// Resize
if ($(window).width() >= 768) {
    $('.navigation__wrap').css('display','contents');
} else {
    $('.navigation__wrap').css('display','none');
}
$(window).on('resize', resizeNavbar);
function resizeNavbar() {
    if ($(window).width() >= 768) {
        $('.navigation__wrap').css('display','contents');
    } else {
        $('.navigation__wrap').css('display','none');
    }
}

// Slider
const swiper = new Swiper ('.swiper', {
    breakpoints: {
        320: {
            slidesPerView: 2,
            spaceBetween: 20
        },
        768: {
            slidesPerView: 3,
            spaceBetween: 20
        },
        992: {
            slidesPerView: 4,
            spaceBetween: 20
        }
    },
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
