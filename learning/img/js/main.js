document.addEventListener("DOMContentLoaded", function () {
  let navLinks = document.querySelectorAll(".nav-item.nav-link");
  let currentPage = window.location.pathname.split("/").pop(); // الحصول على اسم الصفحة الحالية
  
  navLinks.forEach(link => {
      if (link.getAttribute("href") === currentPage) {
          document.querySelector(".nav-item.nav-link.active")?.classList.remove("active");
          link.classList.add("active");
      }
  });
});
// dark mode
let btnSwitch = document.querySelector('.switch');
let chefSvg = document.querySelectorAll('.chef-svg'); // تأكد من تحديد العناصر الصحيحة

// التحقق من localStorage عند تحميل الصفحة
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    btnSwitch.classList.remove("fa-moon");
    btnSwitch.classList.add("fa-sun");
    chefSvg.forEach(item => {
        item.src = "./images/team-shape-dark.svg";
    });
}

btnSwitch.onclick = function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        btnSwitch.classList.remove("fa-moon");
        btnSwitch.classList.add("fa-sun");
        chefSvg.forEach(item => {
            item.src = "./images/team-shape-dark.svg";
        });

        // حفظ الوضع الداكن في localStorage
        localStorage.setItem("darkMode", "enabled");
    } else {
        btnSwitch.classList.remove("fa-sun");
        btnSwitch.classList.add("fa-moon");
        chefSvg.forEach(item => {
            item.src = "./images/team-shape.svg";
        });

        // إزالة الوضع الداكن من localStorage
        localStorage.setItem("darkMode", "disabled");
    }
};



    // Spinner
    var spinner = function () {
      setTimeout(function () {
          if ($('#spinner').length > 0) {
              $('#spinner').removeClass('show');
          }
      }, 1);
  };
  spinner();
  
  
 
 let maincolors = localStorage.getItem(".option-box");
if (maincolors !== null) {
  document.documentElement.style.setProperty(
    "--main-color",
    localStorage.getItem(".option-box")
  );
  //Remove  active class from ALL Class list item
  document.querySelectorAll(".colors-list li ").forEach((element) => {
    element.classList.remove("active");
    //Add active class on data-color===localstorge item
    if (element.dataset.color === maincolors) {
      //Add active class
      element.classList.add("active");
    }
  });
}
// Click On Toggle Settings Gear
document.querySelector(".toggle-settings .fa-gear").onclick = function () {
  // Toggle Class Fa-spin For Rotation on Self
  this.classList.toggle("fa-spin");

  // Toggle Class Open On Main Settings Box
  document.querySelector(".settings-box").classList.toggle("open");
};
//switch color
const colorsli = document.querySelectorAll(".colors-list li");
//loop on All list items
colorsli.forEach((li) => {
  li.addEventListener("click", (e) => {
    //set color on root
    document.documentElement.style.setProperty(
      "--main-color",
      e.target.dataset.color
    );
    //set color on localstorage
    let setcolor = localStorage.setItem(".option-box", e.target.dataset.color);

    //remove active class from All childrens
    e.target.parentElement.querySelectorAll(".active").forEach((element) => {
      element.classList.remove("active");

      //add avtive class on self
      e.target.classList.add("active");
    });
  });
});



// تحديث تأثير الشفافية عند التمرير
document.addEventListener("mouseover", (e) => {
  if (e.target.classList.contains("btn-primary")) {
    const currentColor = getComputedStyle(document.documentElement).getPropertyValue("--main-color").trim();
    const rgbaColor = `rgba(${hexToRgb(currentColor)}, 0.5)`;
    e.target.style.backgroundColor = rgbaColor;
    e.target.style.transition = "background-color 0.3s ease";
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.target.classList.contains("btn-primary")) {
    const currentColor = getComputedStyle(document.documentElement).getPropertyValue("--main-color").trim();
    e.target.style.backgroundColor = currentColor;
  }
});

// التحكم في السلايدر باستخدام الأسهم المخصصة
document.getElementById("prev-slide").addEventListener("click", function () {
  $(".header-carousel").trigger("prev.owl.carousel");
});

document.getElementById("next-slide").addEventListener("click", function () {
  $(".header-carousel").trigger("next.owl.carousel");
});

(function ($) {
    "use strict";

    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').css('top', '0px');
        } else {
            $('.sticky-top').css('top', '-100px');
        }
    });
    
      $(document).ready(function () {
        $(".menu-Portfolio li").click(function () {
          let category = $(this).attr("data-cat"); // الحصول على الفئة المطلوبة
          $(".menu-Portfolio li").removeClass("active"); // إزالة الكلاس النشط من جميع العناصر
          $(this).addClass("active"); // إضافة الكلاس النشط للعنصر الذي تم النقر عليه
    
          if (category === ".all") {
            $(".row .col-sm-6").fadeIn(); // عرض جميع العناصر عند النقر على "الكل"
          } else {
            $(".row .col-sm-6").fadeOut(); // إخفاء جميع العناصر أولًا
            $(`.row .col-sm-6:has(${category})`).fadeIn(); // إظهار العناصر التي تحتوي على الفئة المطلوبة
          }
        });
      });

    
    


    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        items: 1,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
})(jQuery);





// loader
