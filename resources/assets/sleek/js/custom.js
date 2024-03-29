
/* ====== Index ======

1. JEKYLL INSTANT SEARCH
2. SCROLLBAR CONTENT
3. TOOLTIPS AND POPOVER
4. MULTIPLE SELECT
4. LOADING BUTTON
5. TOASTER
6. PROGRESS BAR
7. CIRCLE PROGRESS
8. DATE PICKER

====== End ======*/



$(document).ready(function() {
  "use strict";
  /*======== 1. JEKYLL INSTANT SEARCH ========*/

  // var searchInput = $('#search-input');
  // if(searchInput.length != 0){
  //   SimpleJekyllSearch.init({
  //     searchInput: document.getElementById('search-input'),
  //     resultsContainer: document.getElementById('search-results'),
  //     dataSource: '/assets/data/search.json',
  //     searchResultTemplate: '<li><div class="link"><a href="{link}">{label}</a></div><div class="location">{location}</div><\/li>',
  //     noResultsText: '<li>No results found</li>',
  //     limit: 10,
  //     fuzzy: true,
  //   });
  // }


  /*======== Upload =======*/


    /*======== 2. SCROLLBAR CONTENT ========*/


  $('.date ,.date-time').each(function (k, v) {
    var timePicker, format;
    if ($(this).hasClass('date-time')) {
      timePicker = true;
      format = ($(this).data('format') === undefined) ? "YYYY-MM-DD HH:mm:ss" : $(this).data('format');
    } else {
      timePicker = false;
      format = ($(this).data('format') === undefined) ? "YYYY-MM-DD" : $(this).data('format');
    }
    var calendarType = ($('html').attr('lang') == 'fa' ? "persian" : "gregorian");
    if ($(this).data('type') !== undefined) {
      calendarType = $(this).data('type');
    }
    if (calendarType == 'gregorian') {
      $(this).css('direction', 'ltr');
    }

    $(this).pDatepicker({
      "inline": false,
      "format": format,
      "viewMode": "day",
      "initialValue": false,
      "minDate": null,
      "maxDate": null,
      "autoClose": true,
      "position": "auto",
      "altFormat": "X",
      "altField": $(this).data('alt'),
      "onlyTimePicker": false,
      "onlySelectOnDate": true,
      "calendarType": calendarType,
      "inputDelay": 800,
      "observer": false,
      "calendar": {
        "persian": {
          "locale": "fa",
          "showHint": false,
          "leapYearMode": "algorithmic"
        },
        "gregorian": {
          "locale": "en",
          "showHint": false
        }
      },
      "navigator": {
        "enabled": true,
        "scroll": {
          "enabled": true
        },
        "text": {
          "btnNextText": "<",
          "btnPrevText": ">"
        }
      },
      "toolbox": {
        "enabled": true,
        "calendarSwitch": {
          "enabled": false,
          "format": "MMMM"
        },
        "todayButton": {
          "enabled": true,
          "text": {
            "fa": "امروز",
            "en": "Today"
          }
        },
        "submitButton": {
          "enabled": true,
          "text": {
            "fa": "تایید",
            "en": "Submit"
          }
        },
        "text": {
          "btnToday": "امروز"
        }
      },
      "timePicker": {
        "enabled": timePicker,
        "step": 1,
        "hour": {
          "enabled": timePicker,
          "step": null
        },
        "minute": {
          "enabled": timePicker,
          "step": null
        },
        "second": {
          "enabled": timePicker,
          "step": null
        },
        "meridian": {
          "enabled": false
        }
      },
      "dayPicker": {
        "enabled": true,
        "titleFormat": "YYYY MMMM"
      },
      "monthPicker": {
        "enabled": true,
        "titleFormat": "YYYY"
      },
      "yearPicker": {
        "enabled": true,
        "titleFormat": "YYYY"
      },
      "responsive": true,
    });
  });


  var dataScrollHeight = $("[data-scroll-height]");
  function scrollWithBigMedia(media) {
    if (media.matches) {
      /* The viewport is greater than, or equal to media screen size */
      dataScrollHeight.each(function () {
        var scrollHeight = $(this).attr("data-scroll-height");
        $(this).css({ height: scrollHeight + "px", overflow: "hidden" });
      });

      //For content that needs scroll
      $(".slim-scroll")
        .slimScroll({
          opacity: 0,
          height: "100%",
          color: "#999",
          size: "5px",
          touchScrollStep: 50
        })
        .mouseover(function () {
          $(this)
            .next(".slimScrollBar")
            .css("opacity", 0.4);
        });
    } else {
      /* The viewport is less than media screen size */
      dataScrollHeight.css({ height: "auto", overflow: "auto" });
    }
  }

  if (dataScrollHeight.length != 0) {
    var media = window.matchMedia("(min-width: 992px)");
    scrollWithBigMedia(media); // Call listener function at run time
    media.addListener(scrollWithBigMedia); // Attach listener function on state changes
  }

  var chatLeftContent = $('#chat-left-content');
  if(chatLeftContent.length != 0){
    chatLeftContent.slimScroll({})
  }
  var chatRightContent = $('#chat-right-content');
  if(chatRightContent.length != 0){
    chatRightContent.slimScroll({})
  }

  /*======== 3. TOOLTIPS AND POPOVER ========*/
  var tooltip = $('[data-toggle="tooltip"]')
  if(tooltip.length != 0){
    tooltip.tooltip({
      container: "body",
      template:
        '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
    });
  }

  var popover = $('[data-toggle="popover"]')

  if(popover.length != 0){
    popover.popover();
  }


  /*======== 4. MULTIPLE SELECT ========*/
  var multipleSelect = $(".js-example-basic-multiple");
  if(multipleSelect.length != 0){
    multipleSelect.select2();
  }

  /*======== 4. LOADING BUTTON ========*/

  var laddaButton = $('.ladda-button');

  if(laddaButton.length != 0){
    Ladda.bind(".ladda-button", {
      timeout: 5000
    });

    Ladda.bind(".progress-demo button", {
      callback: function (instance) {
        var progress = 0;
        var interval = setInterval(function () {
          progress = Math.min(progress + Math.random() * 0.1, 1);
          instance.setProgress(progress);

          if (progress === 1) {
            instance.stop();
            clearInterval(interval);
          }
        }, 200);
      }
    });
  }

  /*======== 5. TOASTER ========*/


  // if(toaster.length != 0){
  //   if (document.dir != "rtl") {
  //     callToaster("toast-top-right");
  //   } else {
  //     callToaster("toast-top-left");
  //   }
  // }

  /*======== 6. PROGRESS BAR ========*/
  $('.slim-scroll-right-sidebar-2').slimScroll({
    opacity: 0,
    height: '100%',
    color: "#999",
    size: "5px",
    touchScrollStep: 50
  })
    .mouseover(function () {
      $(this)
        .next(".slimScrollBar")
        .css("opacity", 0.4);
    });

    /*======== 7. CIRCLE PROGRESS ========*/
    var circle = $('.circle')
    var gray = '#f5f6fa';

    if(circle.length != 0){
      circle.circleProgress({
        lineCap: "round",
        startAngle: 4.8,
        emptyFill: [gray]
      })
    };



  $(document).on('change', '.check-all', function () {
    $(this).closest('table').find('tbody :checkbox').prop('checked', $(this).is(':checked'));
  });

  $(document).on('change', 'tbody :checkbox', function () {
    $(this).closest('table').find('.check-all')
      .prop('checked', ($(this).closest('table').find('tbody :checkbox:checked').length == $(this).closest('table').find('tbody :checkbox').length));
  });

  $(document).on('change', '.check-all', function () {
    $(this).closest('table').find('tbody :checkbox')
      .prop('checked', $(this).is(':checked'))
      .closest('tr').toggleClass('table-active', $(this).is(':checked'));
  });

  $(document).on('change', 'tbody :checkbox', function () {
    $(this).closest('tr').toggleClass('table-active', this.checked);

    $(this).closest('table').find('.check-all').prop('checked', ($(this).closest('table').find('tbody :checkbox:checked').length == $(this).closest('table').find('tbody :checkbox').length));
  });

  $(document).on('change', '.delete-item , .check-all', function () {
    var btn = $(this).closest('.card').find('.delete-btn');
    var deleteForm = $('#delete-form');
    btn.html('<i class="fa fa-trash"></i>');
    deleteForm.html('');

    var csrfToken = $('meta[name=csrf-token]').attr('content');
    deleteForm.append('<input type="hidden" name="_token" value="'+csrfToken+'">');
    deleteForm.append('<input type="hidden" name="_method" value="delete">');
    $(this).closest('table').find('.delete-item:checked').each(function () {
      deleteForm.append('<input type="hidden" name="deleteId[]" value="' + $(this).val() + '">');
    });

    if ($(this).closest('table').find('.delete-item:checked').length > 0) {
      btn.removeClass('d-none');
    } else {
      btn.addClass('d-none');
    }
  });


  $('.delete-btn').on('click',function(e){
    if(confirm('از حذف اطلاعات اطمینان دارید؟')){
      $('#delete-form').submit();
    }
  });

  // $(document).on('change', '.delete-item , .check-all', function () {
  //   var btn = $('.delete-btn');
  //   btn.html('حذف');
  //   $(this).closest('table').find('.delete-item:checked').each(function () {
  //     btn.append('<input type="hidden" name="deleteId[]" value="' + $(this).val() + '">');
  //   });
  // });


  $('.table-responsive-stack').find("th").each(function (i) {
    $('.table-responsive-stack td:nth-child(' + (i + 1) + '):not(.not-dot)').prepend('<span class="table-responsive-stack-thead">' + $(this).text() + ':</span> ');
    $('.table-responsive-stack-thead').hide();
  });

  $('.table-responsive-stack').each(function () {
    $(this).find('.form-check').css('display', 'inline-flex');
  });

  function flexTable() {
    if ($(window).width() < 768) {
      $(".table-responsive-stack").each(function (i) {
        $(this).find(".table-responsive-stack-thead").show();
        $(this).find('thead').hide();
      });
    } else {
      $(".table-responsive-stack").each(function (i) {
        $(this).find(".table-responsive-stack-thead").hide();
        $(this).find('thead').show();
      });
    }
  }
  flexTable();

  window.onresize = function (event) {
    flexTable();
  };


});
