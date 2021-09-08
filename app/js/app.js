// // For JavaScript webpack mode:

// // Import jQuery module (npm i jquery)
// import $ from 'jquery'
// window.jQuery = $
// window.$ = $

// // Import vendor jQuery plugin example (not module)
// require('~/app/libs/mmenu/dist/mmenu.js')



document.addEventListener('DOMContentLoaded', () => {
	const burgerBtn = document.querySelector('#header__burger');
	const burgerBody = document.querySelector('.header__navbar');

	burgerBtn.onclick = () => {
		burgerBtn.classList.toggle('active');
		burgerBody.classList.toggle('active');
	}
	
})


const animItem = document.querySelector(".header")
const hightForScroll = 800
const animationScroll = () => {
	if (window.scrollY> hightForScroll) {
		animItem.classList.add("white")
	}
	else {
		animItem.classList.remove("white")
	}
}
window.addEventListener('scroll', animationScroll)

$(document).ready(function () {
	var owl = $('.owl-carousel');
	owl.owlCarousel({
	  margin: 10,
	  dots: false,
	  loop: false,
	  nav: false,
	  responsive: {
		0: {
			items: 1	
		},
		600: {
		  items: 2
		},
		800: {
		  items: 3
		},
		1000: {
		  items: 4
		}
	  }
	})
  })



