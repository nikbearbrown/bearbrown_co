/* Slide 135 (#3) */

$(function(){
  var slideKey = 135;
  if(!window.swipers){window.swipers = {};}
  if(!window.swipers[slideKey]){window.swipers[slideKey] = [];}
  $('.swiper-'+slideKey).each(function(){
    var thisKey = window.swipers[slideKey].length;
    window.swipers[slideKey][thisKey] = 
      new Swiper(this, {
      slidesPerView: 'auto', 
      centeredSlides: true,    
      spaceBetween: 40,
      loop: true,
      breakpoints: {
        435: {
          centeredSlides: false,    
        },            
      }   
    }); 
  });
});