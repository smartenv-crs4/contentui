  $('.slick-v3').slick({
    slidesToShow: 6,
    arrows: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 2
        }
      }
    ]
  });
