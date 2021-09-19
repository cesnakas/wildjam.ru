// Nav
// const mq = window.matchMedia( "(max-width: 767.98px)" );
// const navWrap = document.querySelector('.navigation__wrap');
// const btnNav = document.querySelector('#navMenu');
//
// if (mq.matches) {
//     // alert("window width >= 960px");
//     navWrap.style.display = "none";
// } else {
//     // alert("window width < 960px");
//     navWrap.style.display = "block";
// }
//
// btnNav.onclick = function () {
//     if (navWrap.style.display !== "none") {
//         navWrap.style.display = "none";
//     } else {
//         navWrap.style.display = "block";
//     }
// }

$('#navMenu').click( function() {
    $('.navigation__wrap').toggle();
});

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
