/*!
 * enquire.js v2.1.2 - Awesome Media Queries in JavaScript
 * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/enquire.js
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
!function(a,b,c){var d=window.matchMedia;"undefined"!=typeof module&&module.exports?module.exports=c(d):"function"==typeof define&&define.amd?define(function(){return b[a]=c(d)}):b[a]=c(d)}("enquire",this,function(a){"use strict";function b(a,b){var c,d=0,e=a.length;for(d;e>d&&(c=b(a[d],d),c!==!1);d++);}function c(a){return"[object Array]"===Object.prototype.toString.apply(a)}function d(a){return"function"==typeof a}function e(a){this.options=a,!a.deferSetup&&this.setup()}function f(b,c){this.query=b,this.isUnconditional=c,this.handlers=[],this.mql=a(b);var d=this;this.listener=function(a){d.mql=a,d.assess()},this.mql.addListener(this.listener)}function g(){if(!a)throw new Error("matchMedia not present, legacy browsers require a polyfill");this.queries={},this.browserIsIncapable=!a("only all").matches}return e.prototype={setup:function(){this.options.setup&&this.options.setup(),this.initialised=!0},on:function(){!this.initialised&&this.setup(),this.options.match&&this.options.match()},off:function(){this.options.unmatch&&this.options.unmatch()},destroy:function(){this.options.destroy?this.options.destroy():this.off()},equals:function(a){return this.options===a||this.options.match===a}},f.prototype={addHandler:function(a){var b=new e(a);this.handlers.push(b),this.matches()&&b.on()},removeHandler:function(a){var c=this.handlers;b(c,function(b,d){return b.equals(a)?(b.destroy(),!c.splice(d,1)):void 0})},matches:function(){return this.mql.matches||this.isUnconditional},clear:function(){b(this.handlers,function(a){a.destroy()}),this.mql.removeListener(this.listener),this.handlers.length=0},assess:function(){var a=this.matches()?"on":"off";b(this.handlers,function(b){b[a]()})}},g.prototype={register:function(a,e,g){var h=this.queries,i=g&&this.browserIsIncapable;return h[a]||(h[a]=new f(a,i)),d(e)&&(e={match:e}),c(e)||(e=[e]),b(e,function(b){d(b)&&(b={match:b}),h[a].addHandler(b)}),this},unregister:function(a,b){var c=this.queries[a];return c&&(b?c.removeHandler(b):(c.clear(),delete this.queries[a])),this}},new g});

/* Simple jQuery Equal Heights @version 1.5.1. Copyright (c) 2013 Matt Banks. Dual licensed under the MIT and GPL licenses. */
!function(a){a.fn.equalHeights=function(){var b=0,c=a(this);return c.each(function(){var c=a(this).innerHeight();c>b&&(b=c)}),c.css("height",b)},a("[data-equal]").each(function(){var b=a(this),c=b.data("equal");b.find(c).equalHeights()})}(jQuery);

/* Run function after window resize */
var afterResize=(function(){var t={};return function(callback,ms,uniqueId){if(!uniqueId){uniqueId="Don't call this twice without a uniqueId";}if(t[uniqueId]){clearTimeout(t[uniqueId]);}t[uniqueId]=setTimeout(callback,ms);};})();

window.timber = window.timber || {};

timber.cacheSelectors = function () {
  timber.cache = {
    // General
    $html: $('html'),
    $body: $('body'),
    $breadcrumbs: $('.breadcrumb'),

    // Navigation
    $navigation: $('#accessibleNav'),
    $hasDropdownItem: $('.site-nav--has-dropdown'),
    $menuToggle: $('.menu-toggle'),

    // Home Page
    $slider: $('.flexslider'),
    $slides: $('.flexslider li'),

    // Product Page
    $productImageWrap: $('#productPhoto'),
    $productImage: $('#productPhotoImg'),
    $thumbImages: $('#productThumbs').find('a.product-photo-thumb'),
    $shareButtons: $('.social-sharing'),

    // Collection Pages
    $collectionFilters: $('#collectionFilters'),
    $advancedFilters: $('.advanced-filters'),
    $toggleFilterBtn: $('#toggleFilters'),

    // Equal height elements
    $featuredContainer: $('.featured-box').closest('.grid-uniform'),
    $productGridImages: $('.product-grid-image')
  };
};

timber.cacheVariables = function () {
  timber.vars = {
    // Breakpoints (from timber.scss.liquid)
    bpLarge: 769,

    // MediaQueries (from timber.scss.liquid)
    mediaQueryLarge     : 'screen and (min-width: 769px)',
    isLargeBp : false,
    isTouch: timber.cache.$html.hasClass('supports-touch')
  }
};

timber.init = function () {
  FastClick.attach(document.body);
  timber.cacheSelectors();
  timber.cacheVariables();

  timber.cache.$html.removeClass('no-js').addClass('js');
  if ('ontouchstart' in window) {
    timber.cache.$html.removeClass('no-touch').addClass('touch');
  }

  timber.toggleMenu();
  //timber.sliders();
  timber.productImageSwitch();
  timber.equalHeights();
  timber.responsiveVideos();
  timber.toggleFilters();
  timber.initBreakpoints();

  // Wait until fonts load to attempt creating 'more' link in nav
  $(window).load(function() {
    timber.responsiveNav();
  });

  
  timber.socialSharing();
  

  
  timber.sortFilters();
  
};

timber.initBreakpoints = function () {
  enquire.register(timber.vars.mediaQueryLarge, {
    match: function () {
      timber.vars.isLargeBp = true;
      timber.productImageZoom();
    },
    unmatch: function () {
      timber.vars.isLargeBp = false;
      timber.productImageZoom();
    }
  });
};

timber.accessibleNav = function () {
  var $nav = timber.cache.$navigation,
      $allLinks = $nav.find('a'),
      $topLevel = $nav.children('li').find('a'),
      $parents = $nav.find('.site-nav--has-dropdown'),
      $subMenuLinks = $nav.find('.site-nav--dropdown').find('a'),
      activeClass = 'nav-hover',
      focusClass = 'nav-focus';

  // Mouseenter
  $parents.on('mouseenter', function(evt) {
    var el = $(this);

    if (!el.hasClass(activeClass)) {
      evt.preventDefault();
    }

    showDropdown($(this));
  });

  $parents.on('mouseleave', function() {
    hideDropdown($(this));
  });

  $subMenuLinks.on('click', function(evt) {
    // Prevent touchstart on body from firing instead of link
    evt.stopImmediatePropagation();
  });

  $allLinks.focus(function() {
    handleFocus($(this));
  });

  $allLinks.blur(function() {
    removeFocus($topLevel);
  });

  // accessibleNav private methods
  function handleFocus (el) {
    var $subMenu = el.next('ul'),
        hasSubMenu = $subMenu.hasClass('site-nav--dropdown') ? true : false,
        isSubItem = $('.site-nav--dropdown').has(el).length,
        $newFocus = null;

    // Add focus class for top level items, or keep menu shown
    if ( !isSubItem ) {
      removeFocus($topLevel);
      addFocus(el);
    } else {
      $newFocus = el.closest('.site-nav--has-dropdown').find('a');
      addFocus($newFocus);
    }
  }

  function showDropdown (el) {
    el.addClass(activeClass);

    setTimeout(function() {
      timber.cache.$body.on('touchstart', function() {
        hideDropdown(el);
      });
    }, 250);
  }

  function hideDropdown ($el) {
    $el.removeClass(activeClass);
    timber.cache.$body.off('touchstart');
  }

  function addFocus ($el) {
    $el.addClass(focusClass);
  }

  function removeFocus ($el) {
    $el.removeClass(focusClass);
  }
};

timber.responsiveNav = function () {
  $(window).resize(function () {
    afterResize(function(){
      // Replace original nav items and remove more link
      timber.cache.$navigation.append($('#moreMenu--list').html());
      $('#moreMenu').remove();
      timber.alignMenu();
      timber.accessibleNav();
    }, 200, 'uniqueID');
  });
  timber.alignMenu();
  timber.accessibleNav();
};

timber.alignMenu = function () {
  var $nav = timber.cache.$navigation,
      w = 0,
      i = 0;
      wrapperWidth = $nav.outerWidth() - 101,
      menuhtml = '';

  if ( window.innerWidth < timber.vars.bpLarge ) {
    return;
  }

  $.each($nav.children(), function () {
    var $el = $(this);

    // Ignore hidden customer links (for mobile)
    if (!$el.hasClass('large-hide')) {
      w += $el.outerWidth(true);
    }

    if (wrapperWidth < w) {
      menuhtml += $('<div>').append($el.clone()).html();
      $el.remove();

      // Ignore hidden customer links (for mobile)
      if (!$el.hasClass('large-hide')) {
        i++;
      }
    }
  });

  if (wrapperWidth < w) {
    $nav.append(
      '<li id="moreMenu" class="site-nav--has-dropdown">'
        + '<a href="#">' + "More" + '<span class="icon icon-arrow-down" aria-hidden="true"></span></a>'
        + '<ul id="moreMenu--list" class="site-nav--dropdown">' + menuhtml + '</ul></li>'
    );

    if (i <= 1) {
      // Bail, and replace original nav items
      timber.cache.$navigation.append($('#moreMenu--list').html());
      $('#moreMenu').remove();
    }
  }
};

timber.toggleMenu = function () {
  var $doc = $(document);
  var showDropdownClass = 'show-dropdown';
  var showNavClass = 'show-nav';

  timber.cache.$menuToggle.on('click', function() {
    timber.cache.$html.toggleClass(showNavClass);

    // Close ajax cart if open (keep selectors live, modal is inserted with JS)
    if ( $('#ajaxifyModal').hasClass('is-visible') ) {
      $('#ajaxifyModal').removeClass('is-visible');
      timber.cache.$html.addClass(showNavClass);
    }
  });

  // Open sub navs on small screens
  timber.cache.$hasDropdownItem.on('click', function(evt) {
      var $el = $(this);

      if (!$el.hasClass(showDropdownClass) && timber.vars.isTouch || !$el.hasClass(showDropdownClass) && timber.cache.$html.hasClass(showNavClass)) {
        evt.preventDefault();
        $el.addClass(showDropdownClass);
        $doc.on('click', handleClickOutsideDropdown);
      }

      function handleClickOutsideDropdown (evt) {
        var $target = $(evt.target);

        if (!$target.is($el) && !$.contains($el[0], $target[0])) {
          $el.removeClass(showDropdownClass);
          $doc.off('click', handleClickOutsideDropdown)
        }
      }
  })
};
/*
timber.sliders = function () {
  var $slider = timber.cache.$slider,
      $slides = timber.cache.$slides,
      sliderArgs = {
        animation: 'slide',
        animationSpeed: 500,
        pauseOnHover: true,
        keyboard: false,
        slideshow: ,
        slideshowSpeed: ,
        smoothHeight: true
      };

  if ($slider.length) {
    
    if ($slides.length === 1) {
      sliderArgs.touch = false; 
    }
    
    $(window).on('load', function() {
      $slider.flexslider(sliderArgs);
    });
  }
};
*/
timber.productImageSwitch = function () {
  if ( timber.cache.$thumbImages.length ) {
    // Switch the main image with one of the thumbnails
    // Note: this does not change the variant selected, just the image
    timber.cache.$thumbImages.on('click', function(evt) {
      evt.preventDefault();
      var newImage = $(this).attr('href');
      timber.switchImage(newImage, null, timber.cache.$productImage);
    });
  }
};

timber.switchImage = function (src, imgObject, el) {
  // Make sure element is a jquery object
  var $el = $(el);
  $el.attr('src', src);

  
};

timber.productImageZoom = function () {
  
};

timber.socialSharing = function () {
  // General selectors
  var $buttons = timber.cache.$shareButtons,
      $shareLinks = $buttons.find('a'),
      permalink = $buttons.attr('data-permalink');

  // Share button selectors
  var $fbLink = $('.share-facebook'),
      $pinLink = $('.share-pinterest'),
      $googleLink = $('.share-google');

  if ( $fbLink.length ) {
    $.getJSON('https://graph.facebook.com/?id=' + permalink + '&callback=?', function(data) {
      if (data.shares) {
        $fbLink.find('.share-count').text(data.shares).addClass('is-loaded');
      } else {
        $fbLink.find('.share-count').remove();
      }
    });
  };

  if ( $pinLink.length ) {
    $.getJSON('https://api.pinterest.com/v1/urls/count.json?url=' + permalink + '&callback=?', function(data) {
      if (data.count > 0) {
        $pinLink.find('.share-count').text(data.count).addClass('is-loaded');
      } else {
        $pinLink.find('.share-count').remove();
      }
    });
  };

  if ( $googleLink.length ) {
    // Can't currently get Google+ count with JS, so just pretend it loaded
    $googleLink.find('.share-count').addClass('is-loaded');
  }

  // Share popups
  $shareLinks.on('click', function(e) {
    e.preventDefault();
    var el = $(this),
        popup = el.attr('class').replace('-','_'),
        link = el.attr('href'),
        w = 700,
        h = 400;

    // Set popup sizes
    switch (popup) {
      case 'share-fancy':
        w = 480;
        h = 720;
        break;
      case 'share-google':
        w = 500;
        break;
    }

    window.open(link, popup, 'width=' + w + ', height=' + h);
  });
};

timber.equalHeights = function () {
  var $featuredBoxImageArray = [];
  var $featuredBoxArray = [];
    
  timber.cache.$featuredContainer.each(function() {
    $featuredBoxImageArray.push($(this).find('.featured-box--image'));
    $featuredBoxArray.push($(this).find('.featured-box'));
  });
 
  $(window).load(function() {
    resizeElements();
  });

  $(window).resize(function() {
    afterResize(function() {
      resizeElements();
    }, 250, 'id');
  });

  function resizeElements() {
    var featuredContainerLength = timber.cache.$featuredContainer.length;
    for (var i = 0; i < featuredContainerLength ; i++) {
      $featuredBoxImageArray[i].css('height', 'auto').equalHeights();
      $featuredBoxArray[i].css('height','auto').equalHeights();
    }
    timber.cache.$productGridImages.css('height', 'auto').equalHeights();
  }
};

timber.responsiveVideos = function () {
  var $iframeVideo = $('iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"]');
  var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');

  $iframeVideo.each(function () {
    // Add wrapper to make video responsive
    $(this).wrap('<div class="video-wrapper"></div>');
  });

  $iframeReset.each(function () {
    // Re-set the src attribute on each iframe after page load
    // for Chrome's "incorrect iFrame content on 'back'" bug.
    // https://code.google.com/p/chromium/issues/detail?id=395791
    // Need to specifically target video and admin bar
    this.src = this.src;
  });
};

timber.toggleFilters = function () {
  if ( timber.cache.$collectionFilters.length ) {
    timber.cache.$toggleFilterBtn.on('click', function() {
      timber.cache.$toggleFilterBtn.toggleClass('is-active');
      timber.cache.$collectionFilters.slideToggle(200);

      // Scroll to top of filters if user is down the page a bit
      if ( $(window).scrollTop() > timber.cache.$breadcrumbs.offset().top ) {
        $('html, body').animate({
          scrollTop: timber.cache.$breadcrumbs.offset().top
        });
      }
    });
  }
};

timber.sortFilters = function () {
  timber.cache.$advancedFilters.each(function () {
    var $el = $(this),
        $tags = $el.find('li'),
        aNumber = /\d+/,
        sorted = false;
    $tags.sort(function (a, b) {
      a = parseInt( aNumber.exec( $(a).text() ), 10 );
      b = parseInt( aNumber.exec( $(b).text() ), 10 );
      if ( isNaN(a)  || isNaN(b) ) {
        return;
      }
      else {
        sorted = true;
        return a - b;
      }
    });
    if (sorted) {
      $el.append($tags);
    }
  });
};

timber.formatMoney = function (val) {
  
    val = val.replace('$','');
  

  

  
    if (moneyFormat.indexOf('money') === -1) {
      if ( (moneyFormat.indexOf('{{amount}}') > -1) && (moneyFormat.indexOf('.') === -1) ) {
        val = val.replace('.','<sup>') + '</sup>';
      }
      else if (moneyFormat.indexOf('{{amount_with_comma_separator}}') > -1) {
        val = val.replace(',','<sup>') + '</sup>';
      }
    }
  

  return val;
};

timber.formatSaleTag = function (val) {
  // If not using multiple currencies
  if (moneyFormat.indexOf('money') === -1) {
    // If we use amount
    if ( (moneyFormat.indexOf('{{amount}}') > -1) && (moneyFormat.indexOf('.') === -1) ) {
      // If there are no cents or money amount is more than 10, remove decimals
      if ( (val.indexOf('.00') > -1) || parseInt(val.replace(/[^0-9]/g, ''), 10) > 1000 ) {
        return val.split('.')[0];
      }
    }
    // If we use amount_with_comma_separator
    else if (moneyFormat.indexOf('{{amount_with_comma_separator}}') > -1) {
      // If there are no cents or money amount is more than 10, remove decimals
      if ( (val.indexOf(',00') > -1) || parseInt(val.replace(/[^0-9]/g, ''), 10) > 1000 ) {
        return val.split(',')[0];
      }
    }
  }
  return val;
};

// Initialize Timber's JS on docready
$(timber.init)
