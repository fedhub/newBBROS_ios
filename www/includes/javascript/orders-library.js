var app = angular.module('myapp.orders-library', [
    'myapp.services'
]);

app.controller('orders-library', ['$scope', '$location', 'cart', 'message', 'library', 'date', 'customer', 'authentication', 'swiper', function($scope, $location, cart, message, library, date, customer, authentication, swiper){

    swiper.set_direction('left');
    $scope.swipeLeft = function(page){
        swiper.set_direction('left');
        $location.url(page);
    };
    $scope.swipeRight = function(page){
        swiper.set_direction('right');
        $location.url(page);
    };

    $('#header-title p').html('ספריית הזמנות');
    $('.spinner').css('display', 'none');
    $('.spinner').css('display', 'block');
    var $library_details_lightbox = $('#add_library');
    var $delete_lightbox = $('#delete-item');
    var tmp_lib_name = '';
    var tmp_lib_desc = '';
    var lib_id;
    get_libraries_ajax($scope, message, customer.getPhoneNumber());
    $scope.add_to_cart = function(lib){
        add_to_cart_ajax(lib, message, cart);
    };
    $scope.edit_library_details = function(lib){
        $scope.title = 'עריכת פרטי הספרייה';
        $scope.form_action = 'library-details';
        $('.orders-library-wrapper input').val(lib.lib_name);
        $('.orders-library-wrapper textarea').val(lib.lib_description);
        tmp_lib_name = lib.lib_name;
        tmp_lib_desc = lib.lib_description;
        lib_id = lib.id;
        $library_details_lightbox.fadeIn();
    };
    $scope.delete_library = function(lib){
        $delete_lightbox.fadeIn();
        $scope.library = lib;
    };
    $scope.deletion_approved = function(lib){
        var phone_number = customer.getPhoneNumber();
        delete_library_ajax($scope, lib, phone_number, message);
        $delete_lightbox.fadeOut();
    };
    $scope.close_delete_window = function(){
        $delete_lightbox.fadeOut();
    };

    $scope.enter_library = function(lib){
        library.setLibrary(lib);
        window.location = '#/library';
    };

    // open the new library lightbox
    $scope.add_library = function(){
        $('.orders-library-wrapper input').val('');
        $('.orders-library-wrapper textarea').val('');
        $scope.title = 'הוספת ספרייה חדשה';
        $scope.form_action = 'add-library';
        $library_details_lightbox.fadeIn();
    };

    // close the new library lightbox
    $scope.close_library_details = function(){
        $library_details_lightbox.fadeOut();
    };

    // clicks ok to add the new library
    $scope.approve_library_details = function(form_action){
        if(form_action == 'add-library'){
            var $lib_name = $('#library_name input').val();
            var $lib_description = $('#library_description textarea').val();
            if($lib_name.length == 0) message.showMessage('עליך לתת שם לספריה');
            else{
                var lib_details = new_lib_json(customer.getPhoneNumber(), $lib_name, $lib_description, date.getFullDate(), date.getDefaultTime(), authentication);
                new_lib_ajax($scope, lib_details, message);
                $library_details_lightbox.fadeOut();
            }
        }
        if(form_action == 'library-details'){
            var new_lib_name = $('.orders-library-wrapper input').val();
            var new_lib_desc = $('.orders-library-wrapper textarea').val();
            if(new_lib_desc == tmp_lib_desc && new_lib_name == tmp_lib_name) message.showMessage('לא התבצעו שינויים');
            else{
                edit_library_ajax(lib_id, customer.getPhoneNumber(), new_lib_name, new_lib_desc, message, $scope);
                $library_details_lightbox.fadeOut();
            }
        }
    };

    function get_libraries_ajax($scope, message, phone_number){
        var url = base_url + '/get-libraries&phone_number='+phone_number;
        $.ajax({
            url: url,
            type: 'POST'
        }).done(function(res){
            if(res == false){
                $('.spinner').css('display', 'none');
                message.showMessage('הייתה בעיה בהבאת הספריות שלך, אנא נסה שוב מאוחר יותר');
            }
            else if(res != 'empty'){
                $('.spinner').css('display', 'none');
                $scope.libraries = res;
                $scope.$apply();
                $('#add-library').css('display', 'inline-block');
            }
            else if(res == 'empty'){
                $('.spinner').css('display', 'none');
                $('#add-library').css('display', 'inline-block');
            }
            if(swiper.get_direction() == 'right') $('.orders-library-wrapper').addClass('slide-right');
            if(swiper.get_direction() == 'left') $('.orders-library-wrapper').addClass('slide-left');
            $('.orders-library-wrapper').bind('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {$('.orders-library-wrapper').css('position','static');});
            $('.orders-library-wrapper').css('display', 'block');
            $('.spinner').css('display', 'none');
        });
    }

}]);

function new_lib_ajax($scope, lib_details, message){
    $('.spinner').css('display', 'block');
    var url = base_url + '/new-library';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(lib_details)}
    }).done(function(res){
        if(res == false){
            $('.spinner').css('display', 'none');
            message.showMessage('הייתה בעיה ביצירת הספריה החדשה, אנא נסה שוב מאוחר יותר');
        }
        else{
            $('.spinner').css('display', 'none');
            $scope.libraries = res;
            $scope.$apply();
        }
    });
}

function new_lib_json(phone_number, lib_name, lib_desc, date, time, authentication){
    return {
        phone_number: phone_number,
        lib_name: lib_name,
        lib_description: lib_desc,
        creation_date: date,
        creation_time: time,
        customer_type: authentication.getCustomerType()
    }
}

function add_to_cart_ajax(lib, message, cart){
    $('.spinner').css('display', 'block');
    var url = base_url + '/library-items&library_id='+lib.id;
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res == false){
            $('.spinner').css('display', 'none');
            message.showMessage('הייתה בעיה בהוספת הפריטים לסל, אנא נסה שוב מאוחר יותר');
        }
        else{
            $('.spinner').css('display', 'none');
            // API -- response from library_items (mobile_order_functions.js)
            //var library_item_info = {
            //    library_id: library.getLibraryID(),
            //    creation_date: date.getFullDate(),
            //    creation_time: date.getDefaultTime(),
            //    phone_number: customer.getPhoneNumber(),
            //    item_json: JSON.stringify(cart.getMyCart()) // 1 sized array
            //};
            if(res != 'empty'){
                for(var i = 0; i < res.length; i++){
                    res[i].item_json = JSON.parse(res[i].item_json);
                    cart.updateTotalPrice(res[i].item_json.total_price);
                    cart.add(res[i].item_json);
                }
                window.location = '#/cart';
            }
        }
    });
}

function edit_library_ajax(lib_id, phone_num, name, desc, message, $scope){
    $('.spinner').css('display', 'block');
    var url = base_url + '/update-library';
    var lib_data = {
        lib_id: lib_id,
        phone_number: phone_num,
        lib_name: name,
        lib_description: desc
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(lib_data)}
    }).done(function(res){
        if(res == false){
            $('.spinner').css('display', 'none');
            message.showMessage('הייתה בעיה בעדכון פרטי הספרייה, אנא נסה שוב מאוחר יותר');
        }
        else{
            $('.spinner').css('display', 'none');
            $scope.libraries = res;
            $scope.$apply();
        }
    });
}

function delete_library_ajax($scope, lib, phone_number, message){
    $('.spinner').css('display', 'block');
    var url = base_url + '/delete-library';
    var info = {
        lib_id: lib.id,
        phone_number: phone_number
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res == false){
            $('.spinner').css('display', 'none');
            message.showMessage('הייתה בעיה עם מחיקת הספרייה, אנא נסה שוב מאוחר יותר');
        }
        else{
            $('.spinner').css('display', 'none');
            if(res != 'empty') $scope.libraries = res;
            else $scope.libraries = [];
            $scope.$apply();
        }
    });
}