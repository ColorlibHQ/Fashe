function getURLVar(key) {
  var value = [];

  var query = String(document.location).split('?');

  if (query[1]) {
    var part = query[1].split('&');

    for (i = 0; i < part.length; i++) {
      var data = part[i].split('=');

      if (data[0] && data[1]) {
        value[data[0]] = data[1];
      }
    }

    if (value[key]) {
      return value[key];
    } else {
      return '';
    }
  }
}
function isEmpty( el ){
  return !$.trim(el.html())
}
$(document).ajaxStop(function() {
  function isEmpty( el ){
    return !$.trim(el.html())
  }
  if (!isEmpty($('#product'))) {
    $('#product .option-container').addClass('has-option');      
  }	
});
function divWidthMenu() {
  var width_br = $(".container-fix .block-right").outerWidth(true);
  var width_count = $(".container-fix > .container").width();
  var width_bl = $("#logo img").outerWidth(true);
  if ($(".hd1").length || $(".hd2").length) {
    $('.home1 .container-fix .main-menu').outerWidth(width_count - width_bl - width_br-30);
  }
}
function customResponsive(){
  var window_w = parseInt($(window).width());	

  $(".group1 #logo img").each(function() {
    if( this.complete ) {
      divWidthMenu.call( this );
    } else {
      $(this).one('load', divWidthMenu);
    }
  });

  var offsetMargin = 0-$('.wrapper').outerWidth(true)*2.6/100;
  if ( $(".hd2").length ) {
    $('.banner8').css('margin-left',offsetMargin);
    $('.banner8').css('margin-right',offsetMargin);
  }
}
$(window).resize(function() {
  customResponsive();
});

$(document).ready(function() {
  var className = $('header').attr('class');
  if ($(".header3").length) {
    $('.contentforlayout').addClass('container1-page');	
  }

  // vertical thumbs on product page
  

  // product video 
  $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,
    fixedContentPos: false
  });

  // color swatch js snippet
  $('.swatch :radio').change(function() {
    var optionIndex = $(this).closest('.swatch').attr('data-option-index');
    var optionValue = $(this).val();
    $(this)
    .closest('form')
    .find('.single-option-selector')
    .eq(optionIndex)
    .val(optionValue)
    .trigger('change');
  });

  // product page add to cart
  $('#button-cart').on('click', function(e) {
    e.preventDefault();
    $.ajax({
      url: '/cart/add.js',
      type: 'post',
      data: $('#form_buy input[type=\'text\'], #form_buy select'),
      dataType: 'json',
      beforeSend: function() {
        $('#button-cart').button('loading');
      },
      complete: function() {
        $('#button-cart').button('reset');
      },
      success: function(json) {
        $('.alert, .text-danger').remove();
        $('.form-group').removeClass('has-error');

        if (json['error']) {
          if (json['error']['option']) {
            for (i in json['error']['option']) {
              var element = $('#input-option' + i.replace('_', '-'));
              if (element.parent().hasClass('input-group')) {
                element.parent().after('<div class="text-danger">' + json['error']['option'][i] + '</div>');
              } else {
                element.after('<div class="text-danger">' + json['error']['option'][i] + '</div>');
              }
            }
          }

          if (json['error']['recurring']) {
            $('select[name=\'recurring_id\']').after('<div class="text-danger">' + json['error']['recurring'] + '</div>');
          }

          // Highlight any found errors
          $('.text-danger').parent().addClass('has-error');
        }

        swal("Added to cart Successfully !", "success");

        $.getJSON('/cart.js', function(cart) {
          $('#cart-total').html(cart.item_count);
          Currency.convertAll(shopCurrency, Currency.cookie.read());
        });

        $('html, body').animate({ scrollTop: 0 }, 'slow');

        $('#cart').load('/ #cart #subcart');

        //        $('#cart > .top-cart-contain ul').load('/ #cart > .top-cart-contain ul li');
        //  $('#cart > ul').load('/ #cart > ul li');

      },
      error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.responseText);
      }
    });
  });

  // move breadcrumbs
  $("header").after('<div class="breadcrumbs"><div class="container"></div></div>');	
  var breadcrumb = $('ul.breadcrumb');
  var breadcrumbs_container = $('.breadcrumbs .container');
  breadcrumb.appendTo(breadcrumbs_container);
  $('.breadcrumb').before($('.category-name'));
  $('.breadcrumb').before($('.block-2 .heading-title'));

  var sticky_menu = $('#sticky-menu').attr('data-sticky');
  if (sticky_menu==1){
    var headerSpaceH = $('header').outerHeight(true);
    $('header').after('<div class="headerSpace unvisible" style="height:'+headerSpaceH+'px;"></div>');	
  }
  // Scroll
  var currentP = 0;
  var stickyOffset = 0;

  stickyOffset = $('header').offset().top;
  stickyOffset += $('header').outerHeight();
  stickyOffset += 30;
  $(window).scroll(function(){
    var headerH = $('header').height();
    var scrollP = $(window).scrollTop();

    if($(window).width() > 1024){
      if(scrollP != currentP){
        //Sticky header
        if (sticky_menu==1){
          if(scrollP >= stickyOffset){
            $('.group1 .container-fix').addClass('fix-header');
            $('.group2 .main-menu').addClass('fix-header');
            $('.headerSpace').removeClass('unvisible');
          } else {
            $('.group1 .container-fix').removeClass('fix-header');
            $('.group2 .main-menu').removeClass('fix-header');
            $('.headerSpace').addClass('unvisible');
          }
        }
        currentP = $(window).scrollTop();
      }
    }
  });

  $('.container-fix').hover(function(){ 
    $(this).addClass("fix-header-act");
  },function(){ 
    $(this).removeClass("fix-header-act");
  });

  customResponsive();

  if (!isEmpty($('#product'))) {
    $('#product .option-container').addClass('has-option');      
  }
  if (!isEmpty($('#product2'))) {
    $('#product2 .option-container').addClass('has-option');      
  }	

  // move toolbar category
  $('.layer-category').prepend($('.custom-category .toolbar'));

  // Highlight any found errors
  $('.text-danger').each(function() {
    var element = $(this).parent().parent();

    if (element.hasClass('form-group')) {
      element.addClass('has-error');
    }
  });

  /* Search */
  $('#search input[name=\'q\']').parent().find('button').on('click', function() {
    var url = '/search';

    var value = $('#search input[name=\'q\']').val();
    if(value == "Search all products..." || value ==""){
      jQuery('#search input[name=\'q\']').focus();
      return false;
    }else {
      url += '?type=product&q=' + encodeURIComponent(value);
    }

    location = url;
  });

  $('#search input[name=\'q\']').on('keydown', function(e) {
    if (e.keyCode == 13) {
      $('#search input[name=\'q\']').parent().find('button').trigger('click');
    }
  });

  // Menu
  $('#menu .dropdown-menu').each(function() {
    var menu = $('#menu').offset();
    var dropdown = $(this).parent().offset();

    var i = (dropdown.left + $(this).outerWidth()) - (menu.left + $('#menu').outerWidth());

    if (i > 0) {
      $(this).css('margin-left', '-' + (i + 10) + 'px');
    }
  });

  // Product List
  $('#list-view').click(function() {
    $('.custom-products').removeClass('custom-products-row');
    $(this).addClass('selected');
    $('#grid-view').removeClass('selected');
    $('#content .product-grid > .clearfix').remove();

    //$('#content .product-layout').attr('class', 'product-layout product-list col-xs-12');
    $('#content .product-grid').attr('class', 'product-layout product-list col-xs-12');
    $('#content .product-list .caption').addClass('col-xs-8');
    $('#content .product-list .image').addClass('col-xs-4');


    localStorage.setItem('display', 'list');
  });

  // Product Grid
  $('#grid-view').click(function() {
    $('.custom-products').addClass('custom-products-row');
    $(this).addClass('selected');
    $('#list-view').removeClass('selected');
    // What a shame bootstrap does not take into account dynamically loaded columns
    cols = $('#column-right, #column-left').length;

    if (cols == 2) {
      $('#content .product-layout').attr('class', 'product-layout product-grid col-md-6 col-sm-6 col-xs-6 two-items');
    } else if (cols == 1) {
      $('#content .product-layout').attr('class', 'product-layout product-grid col-md-4 col-sm-6 col-xs-6 three-items');
    } else {
      $('#content .product-layout').attr('class', 'product-layout product-grid col-md-3 col-sm-6 col-xs-6 four-items');
    }
    $('#content .product-grid .caption').removeClass('col-xs-8');
    $('#content .product-grid .image').removeClass('col-xs-4');


    localStorage.setItem('display', 'grid');
  });

  if (localStorage.getItem('display') == 'list') {

    $('#list-view').trigger('click');
  } else {
    $('#grid-view').trigger('click');
  }

  // Checkout
  $(document).on('keydown', '#collapse-checkout-option input[name=\'email\'], #collapse-checkout-option input[name=\'password\']', function(e) {
    if (e.keyCode == 13) {
      $('#collapse-checkout-option #button-login').trigger('click');
    }
  });

  // tooltips on hover
  $('[data-toggle=\'tooltip\']').tooltip({container: 'body'});

  // Makes tooltips work on ajax generated content
  $(document).ajaxStop(function() {
    $('[data-toggle=\'tooltip\']').tooltip({container: 'body'});
  });
});

// Cart add remove functions
var cart = {
  'add': function(product_id, product_title, quantity) {
    $.ajax({
      url: '/cart/add.js',
      type: 'post',
      data: 'id=' + product_id + '&quantity=' + (typeof(quantity) != 'undefined' ? quantity : 1),
      dataType: 'json',
      beforeSend: function() {
        var btn = $(this);
        $('.btn-cart > .button').button('loading');
      },
      complete: function() {
        $('.btn-cart > .button').button('reset');
      },
      success: function(json) {
        $('.alert, .text-danger').remove();

        if (json['redirect']) {
          location = json['redirect'];
        }
        swal(product_title, "is added to cart !", "success");
        // toastr.success('Congratulation! Your item has been added.')

        $.getJSON('/cart.js', function(cart) {
          setTimeout(function () {
            $('#cart-total').html(cart.item_count);
          }, 100);
          //Currency.convertAll(shopCurrency, Currency.cookie.read());
        });
        $('#cart').load('/ #cart #subcart');
      },
      error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.responseText);
      }
    });
  },
  'remove': function(key) {
    $.ajax({
      url: '/cart/update.js',
      type: 'post',
      data: 'updates['+key+']=0',
      dataType: 'json',
      beforeSend: function() {
        $('#cart').removeClass('show-header-dropdown');
      },
      success: function(json) {
        $('#cart > button').button('reset');
        setTimeout(function () {
          $('#cart-total').html(json['item_count']);
        }, 100);
        // Currency.convertAll(shopCurrency, Currency.cookie.read());

        if (getURLVar('route') == '/cart' || getURLVar('route') == '/checkout') {
          location = '/cart';
        } else {
          $('#cart').load('/ #cart #subcart');
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        alert(xhr.responseText);
      }
    });
  }
}

/* Agree to Terms */
$(document).delegate('.agree', 'click', function(e) {
  e.preventDefault();

  $('#modal-agree').remove();

  var element = this;

  $.ajax({
    url: $(element).attr('href'),
    type: 'get',
    dataType: 'html',
    success: function(data) {
      html  = '<div id="modal-agree" class="modal">';
      html += '  <div class="modal-dialog">';
      html += '    <div class="modal-content">';
      html += '      <div class="modal-header">';
      html += '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
      html += '        <h4 class="modal-title">' + $(element).text() + '</h4>';
      html += '      </div>';
      html += '      <div class="modal-body">' + data + '</div>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';

      $('body').append(html);

      $('#modal-agree').modal('show');
    }
  });
});

// Autocomplete */
(function($) {
  $.fn.autocomplete = function(option) {
    return this.each(function() {
      this.timer = null;
      this.items = new Array();

      $.extend(this, option);

      $(this).attr('autocomplete', 'off');

      // Focus
      $(this).on('focus', function() {
        this.request();
      });

      // Blur
      $(this).on('blur', function() {
        setTimeout(function(object) {
          object.hide();
        }, 200, this);
      });

      // Keydown
      $(this).on('keydown', function(event) {
        switch(event.keyCode) {
          case 27: // escape
            this.hide();
            break;
          default:
            this.request();
            break;
        }
      });

      // Click
      this.click = function(event) {
        event.preventDefault();

        value = $(event.target).parent().attr('data-value');

        if (value && this.items[value]) {
          this.select(this.items[value]);
        }
      }

      // Show
      this.show = function() {
        var pos = $(this).position();

        $(this).siblings('ul.dropdown-menu').css({
          top: pos.top + $(this).outerHeight(),
          left: pos.left
        });

        $(this).siblings('ul.dropdown-menu').show();
      }

      // Hide
      this.hide = function() {
        $(this).siblings('ul.dropdown-menu').hide();
      }

      // Request
      this.request = function() {
        clearTimeout(this.timer);

        this.timer = setTimeout(function(object) {
          object.source($(object).val(), $.proxy(object.response, object));
        }, 200, this);
      }

      // Response
      this.response = function(json) {
        html = '';

        if (json.length) {
          for (i = 0; i < json.length; i++) {
            this.items[json[i]['value']] = json[i];
          }

          for (i = 0; i < json.length; i++) {
            if (!json[i]['category']) {
              html += '<li data-value="' + json[i]['value'] + '"><a href="#">' + json[i]['label'] + '</a></li>';
            }
          }

          // Get all the ones with a categories
          var category = new Array();

          for (i = 0; i < json.length; i++) {
            if (json[i]['category']) {
              if (!category[json[i]['category']]) {
                category[json[i]['category']] = new Array();
                category[json[i]['category']]['name'] = json[i]['category'];
                category[json[i]['category']]['item'] = new Array();
              }

              category[json[i]['category']]['item'].push(json[i]);
            }
          }

          for (i in category) {
            html += '<li class="dropdown-header">' + category[i]['name'] + '</li>';

            for (j = 0; j < category[i]['item'].length; j++) {
              html += '<li data-value="' + category[i]['item'][j]['value'] + '"><a href="#">&nbsp;&nbsp;&nbsp;' + category[i]['item'][j]['label'] + '</a></li>';
            }
          }
        }

        if (html) {
          this.show();
        } else {
          this.hide();
        }

        $(this).siblings('ul.dropdown-menu').html(html);
      }

      $(this).after('<ul class="dropdown-menu"></ul>');
      $(this).siblings('ul.dropdown-menu').delegate('a', 'click', $.proxy(this.click, this));

    });
  }
})(window.jQuery);