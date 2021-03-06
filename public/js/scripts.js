prettyPrint();

;(function ( $, window, document, undefined ) {

  var pluginName = "docs_apis_is",
    defaults = {
          animationDuration: 250,
          debug: false
        };

  function Plugin ( element, options ) {
    this.element = element;
    this.$element = $(element);

    this.settings = $.extend( {}, defaults, options );
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype = {
    init: function () {
      this.browser = this.getBrowserInformation();
      this.doResizefix = false;
      this.doScrollfix = false;

      this.sectionEls = this.processSections();
      this.apisEls = this.processArticles();
      this.generateNav();
      this.attachEvents();

      $(window).resize($.proxy(this.onResize,this)).resize();
      $(window).scroll($.proxy(this.onScroll,this)).scroll();
      $(window).load($.proxy(this.onLoad,this));

      if (this.standalone) {
        $("body").addClass('standalone');
      }

      setTimeout($.proxy(this.launch,this),1000);
    },

    attachEvents: function(){

      $('a[href^="#"]').on('click',$.proxy(function(e){
        var anchor = $(e.target).attr("href");
        if(typeof anchor == 'undefined' || anchor == '') return;

        e.preventDefault();
        this.goToAnchor(anchor);

        return false;
      },this));

      $('.arrows, .arrows > icon').on('click',$.proxy(function(e){
        this.goToAnchor('#about');

        e.preventDefault();
        return false;
      },this))

      $('.collapse-next:not(.open)').next().hide();
      $('.collapse-next').on('click',$.proxy(function(e){
        $(e.target).toggleClass('open').next().slideToggle(this.settings.animationDuration)

        e.preventDefault();
        return false;
      },this))
    },

    goToAnchor: function($anchor){
      var anchor = typeof $anchor !== 'undefined' && $anchor !== '' ? $anchor : false;
      if(!anchor) return;

      try {
        $('html, body').stop().animate({
          scrollTop: (anchor == "#top" ? 0 : $(anchor).offset().top)
        }, 750, 'easeInOutExpo');

        setTimeout($.proxy(function(){
          window.location.hash = anchor;
        },this), 850);
      } catch (e) {
        window.location.hash = anchor;
      }

    },

    generateNav: function(){
      this.$navEl = $('#nav');

      $.each(this.apisEls,$.proxy(function(index,api){
        this.$navEl.find('ul.endpoints').append(
          $('<li/>').append(
            $('<a/>')
              .attr('href','#'+api.id)
              .text(api.title)
          )
        );
      },this))
    },

    processArticles: function(){
      var apis = [];
      $('[id*="endpoint-"]').each(function(index,api){
        apis.push({
          id: $(api).attr('id'),
          title: $(api).next('article').find('h3:first').text()
        });
      })

      return apis;
    },

    processSections: function(){
      var sectionEls = $('.section');
      sectionEls.each($.proxy(function(index,section){
        $(section).attr('data-section',index);
      },this));

      return sectionEls;
    },

    resizeSections: function(){
      this.sectionEls.each($.proxy(function(index,section){
        $(section).attr('data-section',index);
        var type = $(section).hasClass('full') ? 'full' : ($(section).hasClass('half') ? 'half' : ($(section).hasClass('third') ? 'third' : ($(section).hasClass('float') ? 'float' : false)));
        var fullHeight = $(window).height();

        if(type == 'full') {
          $(section).css('min-height',fullHeight);
        } else if (type == 'half') {
          $(section).css('min-height',fullHeight/2);
        } else if (type == 'third') {
          $(section).css('min-height',fullHeight/3);
        } else if (type == 'float') {
          $(section).css('min-height','auto');
        }
      },this));
    },

    onLoad: function(){
      setTimeout($.proxy(function(){
        $(window).resize();
      },this), 0);
    },

    onResize: function(){
      if(this.doResizefix !== false);
        clearTimeout(this.doResizefix);
      this.doResizefix = setTimeout($.proxy(this.resizeFix,this), 200);
    },

    onScroll: function(){
      if(!this.browser.touch) {
        $inner = $('.site-header').find('.inner')

        if($(window).scrollTop() >= $('#about').offset().top) {
          if(!this.$navEl.hasClass('show')) this.$navEl.addClass('show')
          if($inner.hasClass('fixed')) $inner.removeClass('fixed');
        } else {
          if(this.$navEl.hasClass('show')) this.$navEl.removeClass('show');
          if(!$inner.hasClass('fixed')) $inner.addClass('fixed')
        }
      }

      if(this.doScrollfix !== false);
        clearTimeout(this.doScrollfix);
      this.doScrollfix = setTimeout($.proxy(this.scrollFix,this), 200);
    },

    resizeFix: function(){
      this.resizeSections();
      $inner = $('.site-header').find('.inner')
      var innerHeight = 0;
          innerHeight = innerHeight + $inner.find('.logo').outerHeight(true);
          innerHeight = innerHeight + $inner.find('.limit').outerHeight(true);
      if(innerHeight >= $(window).height()) {
        $inner.css('height','auto');
      } else {
        $inner.css('height',innerHeight);
      }
    },

    scrollFix: function(){
      this.resizeSections();
    },

    getBrowserInformation: function(){
      var browser = {};
      browser.isLegacy = !$('html').hasClass('lt-ie9');
      browser.touch = $("html").hasClass("touch");
      browser.cssAnim = $("html").hasClass("cssanimations") && !$("html").hasClass("csstransitions");

      var agent = window.navigator.userAgent;
      var android = agent.indexOf('Android ');
      var ios = agent.indexOf('OS ');

      browser.standalone = window.navigator.standalone;

      browser.iosVersion = ios > -1 ? window.Number(agent.substr(ios + 3, 3).replace('_', '.')) : 0;
      browser.isIOS = browser.iosVersion > 0;
      browser.isIOS4 = browser.iosVersion > 4 && browser.iosVersion < 5;
      browser.isIOS6 = browser.iosVersion > 6 && browser.iosVersion < 7;

      browser.androidVersion = android > -1 ? window.Number(agent.substr(android + 8, 3)) : 0;
      browser.isAndroid2 = browser.androidVersion === 2;

      return browser;
    }
  };

  $.fn[ pluginName ] = function ( options ) {
    return this.each(function() {
      if ( !$.data( this, "plugin_" + pluginName ) ) {
          $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
      }
    });
  };

})( jQuery, window, document );

$(function(){
  $('html').docs_apis_is();
});