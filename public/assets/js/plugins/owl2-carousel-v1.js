var Owl2Carouselv1 = function () {
  return {
    // Owl Carousel v2
    initOwl2Carouselv1: function () {
      var owl = $(".owl2-carousel-v1");
      owl.owlCarousel({
        loop: true,
        autoplay: true,
        autoplayTimeout: 10000,
        autoplayHoverPause: true,
        dots: true,
        nav: true,
        navText: ['', ''],
        navContainer: '.owl2-carousel-v1-nav',
        responsive: {
          0:{
            items: 2,
          },
          370:{
            items: 3,
          },
          600:{
            items: 4,
          },
          1000:{
            items: 4,
          },
          1200:{
            items: 6,
          }
        }
      });
      // Custom Navigation Events
      $('.owl2-carousel-v1-next').on('click', function() {
        owl.trigger('next.owl.carousel');
      })
      $('.owl2-carousel-v1-prev').on('click', function() {
        owl.trigger('prev.owl.carousel', [300]);
      })
    }
  };
}();