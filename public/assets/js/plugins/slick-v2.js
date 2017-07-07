  $('.slick-v2').slick({
    centerMode: true,
    slidesToShow: 3,
    focusOnSelect: true,
    prevArrow: '<span data-role="none" class="slick-v2-prev" aria-label="Previous"></span>',
    nextArrow: '<span data-role="none" class="slick-v2-next" aria-label="Next"></span>',
    responsive: [
      {
        breakpoint: 850,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });
