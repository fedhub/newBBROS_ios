var prev_stamp = 0;
var curr_stamp = 0;
$(document).ready(function(){
    window.addEventListener("load", function(){
        FastClick.attach(document.body);
    }, false);

    if(typeof(Storage) !== "undefined"){
        var menu_stamp = localStorage.getItem('menu_stamp');
        if(menu_stamp != null){
            prev_stamp = menu_stamp;
        }
    }
    else{
        console.log('storage is not available');
    }
    if(typeof(Worker) !== "undefined") {
        var url = base_url + '/menu-stamp';
        $.ajax({
            url: url,
            method: 'POST'
        }).done(function(res){
            curr_stamp = res.status;
        });
    } else {
        console.log('worker not available');
    }

    $('.social-cont').click(function(){
       window.location = 'http://www.facebook.com';
    });

    $('#close').click(function(){
        $('#lightbox').fadeOut();
    });

    $('#close-type').click(function(){
        $('#customer-type').fadeOut();
    });

    // INPUT CHECKS

    // first-name, last-name, email, street, house-number, floor, enter
    $('.wrapper').on('keyup', '#first-name input, #last-name input, #email input, #street, #house-number, #floor, #enter, #password', function(event){
        var regex;
        var id = $(event.target).parent().parent().attr('id');
        var $val = $('#'+id+' input').val();
        var $p = $('#'+id+' .validation p');
        if(id == 'first-name' || id == 'last-name') regex = /^['a-zא-תA-Z\s]+$/;
        if(id == 'email') regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        if(id == 'street') regex = /^[a-zא-תA-Z"\s]+$/;
        if(id == 'house-number'){
            if($val.length == 0 || $val.length == 1) regex = /^[1-9]/;
            if($val.length == 2) regex = /^[1-9][0-9]/;
            if($val.length == 3) regex = /^[1-4][0-9][0-9]/;
        }
        if(id == 'floor'){
            if($val.length == 0 || $val.length == 1) regex = /^[0-9]/;
            if($val.length == 2) regex = /^[1-4][1-9]/;
        }
        if(id == 'enter') regex = /^[a-iA-I0-9א-ט\s]+$/;
        if(id == 'password') regex = /^[a-zA-Zא-ת0-9@$*&!^%#]+$/;
        if(regex.test($val)) validation($p, true);
        else validation($p, false);
    });

    // phone-number
    $('.wrapper').on('keyup', '#phone-number input', function(event){
        var id = $(event.target).parent().parent().attr('id');
        var $val = $('#'+id+' input').val();
        var $p = $('#'+id+' .validation p');
        var regex = /^05[02-9]/;
        if(($val.length == 1 && $val == "0") || ($val.length == 2 && $val == "05") || ($val.length == 3 && regex.test($val))) validation($p, true);
        else validation($p, false);
        if($val.length > 3 && regex.test($val)){
            var sub = $val.substr(3,$val.length-3);
            if((/^[0-9]+$/).test(sub)) validation($p, true);
            else validation($p, false);
        }
    });

});

function validation($p, valid){
    if(valid){
        if($p.hasClass('flaticon-cancel4')) $p.removeClass('flaticon-cancel4');
        if(!$p.hasClass()) $p.addClass('flaticon-good1');
    }else{
        if($p.hasClass('flaticon-good1')) $p.removeClass('flaticon-good1');
        if(!$p.hasClass()) $p.addClass('flaticon-cancel4');
    }
}