var app = angular.module('myapp.menu', [
    'myapp.services',
    'myapp.forms'
]);

app.controller('menu-types', ['$scope', '$location', 'message', 'swiper', function($scope, $location, message, swiper){

    //swiper.set_position(2);
    //swiper.set_background(2);
    //if(swiper.get_direction() == 'right') $('.food-types-container').addClass('slide-right');
    //if(swiper.get_direction() == 'left') $('.food-types-container').addClass('slide-left');
    //$('.food-types-container').bind('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {$('.menu-types-wrapper').css('position','static');});
    //$scope.swipeLeft = function(page){
    //    swiper.set_direction('left');
    //    $location.url(page);
    //};
    //$scope.swipeRight = function(page){
    //    swiper.set_direction('right');
    //    $location.url(page);
    //};
    $('#header-title p').html('תפריט');
    $('.spinner').css('display', 'none');
    $('.spinner').css('display', 'block');
    var url = base_url + '/menu-types';
    if(typeof(Storage) !== "undefined") {
        var menu_types = JSON.parse(localStorage.getItem('menu_types'));
        if(menu_types != null && prev_stamp == curr_stamp){
            $scope.menu_types = menu_types;
            $('.spinner').css('display', 'none');
        }
        else {
            if(prev_stamp != curr_stamp) reset_local_storage();
            menu_types_ajax();
        }
    }
    else menu_types_ajax();

    function menu_types_ajax(){
        $.ajax({
            type: 'POST',
            url: url
        }).done(function(menu_types){
            // Query arguments - id, name, image_name
            if(menu_types != false) render_menu_types(menu_types);
            else{
                $('.spinner').css('display', 'none');
                message.showMessage('אירעה תקלה בהבאת התפריט, אנא נסה שוב מאוחר יותר');
            }
        });
    }
   // $scope.setSwiper = function(){swiper.set_direction('right');};
    function render_menu_types(menu_types){
        for(var i = 0 in menu_types) menu_types[i].image_name = base_url+'/images/'+menu_types[i].image_name;
        localStorage.setItem('menu_types', JSON.stringify(menu_types));
        $scope.menu_types = menu_types;
        $scope.$apply();
        $('.spinner').css('display', 'none');
    }

}]);

app.controller('menu-items', ['$scope', '$location', '$routeParams', 'message', 'cart', 'swiper', function($scope, $location, $routeParams, message, cart, swiper){

    //if(swiper.get_direction() == 'right') $('.menu-items-wrapper').addClass('slide-right');
    //if(swiper.get_direction() == 'left') $('.menu-items-wrapper').addClass('slide-left');
    //$('.menu-items-wrapper').bind('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {$('.menu-items-wrapper').css('position','static');});
    //$scope.swipeLeft = function(page){
    //    swiper.set_direction('left');
    //    $location.url(page);
    //};
    //$scope.swipeRight = function(page){
    //    swiper.set_direction('right');
    //    $location.url(page);
    //};
    $('.spinner').css('display', 'block');
    var id = $routeParams.menu_type_id;
    var name = $routeParams.menu_type_name;
    id = id.split('=');
    id = id[1];
    name = name.split('=');
    name = name[1];
    $('#header-title p').html(name);
    var url = base_url + '/menu-items&' + id;
    var menu_items_name = 'menu_type_' + id;
    if(typeof(Storage) !== "undefined") {
        var menu_items = JSON.parse(localStorage.getItem(menu_items_name));
        if(menu_items != null && prev_stamp == curr_stamp){
            $scope.menu_items = menu_items;
            $('.spinner').css('display', 'none');
        }
        else menu_items_ajax();
    }
    else menu_items_ajax();

    $scope.selected = function(menu_item){
        //swiper.set_direction('right');
        //swiper.set_menu_type_name(name);
        cart.foodItem(menu_item);
    };

    function menu_items_ajax(){
        $.ajax({
            type: 'POST',
            url: url
        }).done(function(menu_items){
            if(menu_items != false) render_menu_items(menu_items);
            else{
                $('.spinner').css('display', 'none');
                message.showMessage('אירעה תקלה בהבאת התפריט, אנא נסה שוב מאוחר יותר');
            }
        });
    }

    function render_menu_items(menu_items){
        for(var i = 0 in menu_items) menu_items[i].image_name = base_url+'/images/'+menu_items[i].image_name;
        localStorage.setItem(menu_items_name, JSON.stringify(menu_items));
        $scope.menu_items = menu_items;
        $scope.$apply();
        $('.spinner').css('display', 'none');
    }

}]);

app.controller('menu-additions', ['$scope', '$location', '$routeParams', 'message', 'cart', 'library', 'authentication', 'date', 'customer', 'application_settings', 'swiper', function($scope, $location, $routeParams, message, cart, library, authentication, date, customer, application_settings, swiper){

    //if(swiper.get_direction() == 'right') $('.menu-additions-wrapper').addClass('slide-right');
    //if(swiper.get_direction() == 'left') $('.menu-additions-wrapper').addClass('slide-left');
    //$('.menu-additions-wrapper').bind('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {$('.menu-additions-wrapper').css('position','static');});
    $('.spinner').css('display', 'block');
    var type_id = $routeParams.menu_type_id;
    type_id = type_id.split('=');
    type_id = type_id[1];
    var item_id = $routeParams.menu_item_id;
    item_id = item_id.split('=');
    item_id = item_id[1];
    var name = $routeParams.menu_item_name;
    name = name.split('=');
    name = name[1];
    var addition_items_name = 'menu_item_' + item_id;
    $('#header-title p').html(name);
    //$scope.swipeLeft = function(){
    //    var url = 'menu-items/:menu_type_id='+type_id+'/:menu_type_name='+swiper.get_menu_type_name();
    //    swiper.set_direction('left');
    //    $location.url(url);
    //};
    if(typeof(Storage) !== "undefined") {
        var addition_items = localStorage.getItem(addition_items_name);
        if(addition_items != null && prev_stamp == curr_stamp){
            addition_items = JSON.parse(addition_items);
            var additions = getAdditions(addition_items);
            $scope.additions = additions;
            $('#approve-menu').css('display', 'table');
            cart.setAdditions(additions);
            $('.spinner').css('display', 'none');
        }
        else addition_items_ajax();
    }
    else addition_items_ajax();

    $scope.selected = function(type_id, item_id){
        var additions = cart.getAdditions();
        handleItemsSelections(additions,type_id,item_id, message);
    };

    $scope.approve = function(additions){
        $('.spinner').css('display', 'block');
        var url = base_url + '/get-working-hours';
        $.ajax({
            url: url,
            type: 'POST'
        }).done(function(res){
            if(!res.status){
                $('.spinner').css('display', 'none');
                message.showMessage(res.msg);
            }
            else{
                var msg = '';
                if((!library.getIsLibrary()) && application_settings.store_closed(res.working_time)){
                    $('.spinner').css('display', 'none');
                    msg = application_settings.get_working_time_msg(res.working_time);
                    message.showMessage(msg);
                }
                else{
                    $('.spinner').css('display', 'none');
                    msg = checkSelections(additions);
                    if(msg.length != 0)
                        message.showMessage(msg);
                    else{
                        if(!authentication.isConnected()){
                            $('.spinner').css('display', 'none');
                            $scope.form_request('log-in');
                        }
                        else{
                            $('.spinner').css('display', 'none');
                            if(!cart.get_comments_flag()) $('.comments-lightbox').fadeIn();
                            else{
                                cart.set_comments_flag(false);
                                updateCart(cart, additions, library, date, customer, message);
                            }
                        }
                    }
                }
                $('.spinner').css('display', 'none');
            }
        });
    };

    function addition_items_ajax(){
        var url = base_url + '/menu-additions&'+item_id;
        $.ajax({
            type: 'POST',
            url: url
        }).done(function(menu_additions){
            // Query arguments -
            // ADDITION_TYPE: addition_type_id, addition_type_name, addition_type_description, selection_type, selections_amount
            // ADDITION_ITEM: addition_item_id, addition_item_name, addition_item_description, image, price
            // For each addition item we have the above information plus we have the food_item_id and the food_type_id
            if(menu_additions != false) render_menu_additions(menu_additions);
            else{
                $('.spinner').css('display', 'none');
                message.showMessage('אירעה תקלה בהבאת התפריט, אנא נסה שוב מאוחר יותר');
            }
        });
    }

    function render_menu_additions(menu_additions){
        for(var i = 0 in menu_additions) menu_additions[i].image = base_url+'/images/'+menu_additions[i].image;
        localStorage.setItem(addition_items_name, JSON.stringify(menu_additions));
        localStorage.setItem('menu_stamp', curr_stamp);
        prev_stamp = curr_stamp;
        var additions = getAdditions(menu_additions);
        $scope.additions = additions;
        $scope.$apply();
        $('#approve-menu').css('display', 'table');
        cart.setAdditions(additions);
        $('.spinner').css('display', 'none');
    }

}]);

function updateCart(cart, additions, library, date, customer, message){
    var cart_item_additions = [];
    $.each( $('.additions-type-container'), function(){
        var type_id = $(this).attr('id');
        var item_id_arr = [];
        $(this).find('.selected').filter(':visible').each(function(){
            item_id_arr.push($(this).parent().parent().attr('id').split('-')[2]);
        });
        for(var i = 0; i < additions.length; i++){
            if(additions[i].id == type_id){
                var items = [];
                for(var j = 0; j < item_id_arr.length; j++){
                    for(var k = 0; k < additions[i].addition_items.length; k++){
                        if(item_id_arr[j] == additions[i].addition_items[k].id){
                            items.push(additions[i].addition_items[k]);
                            break;
                        }
                    }
                }
                var temp = additions[i];
                temp.addition_items = items;
                if(items.length != 0) cart_item_additions.push(temp);
                break;
            }
        }
    });
    cart.addToCart(cart_item_additions);
    if(library.getIsLibrary()){
        var tmp_cart = cart.getMyCart();
        cart.setLibraryItem(tmp_cart[tmp_cart.length - 1]);
        cart.removeLibraryItem();
        library_item_ajax(cart, library, date, customer, message);
    }
    else{
        cart.setLock(false);
        window.location = '#/cart';
    }
}

function library_item_ajax(cart, library, date, customer, message){
    cart.calLibItemTotPrice();
    var library_item_info = {
        library_id: library.getLibraryID(),
        creation_date: date.getFullDate(),
        creation_time: date.getDefaultTime(),
        phone_number: customer.getPhoneNumber(),
        item_json: JSON.stringify(cart.getLibraryItem())
    };
    var url = base_url + '/add-library-item';
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(library_item_info)}
    }).done(function(res){
        if(!res) message.showMessage('הייתה בעיה בהוספת הפריט אל ספריית ההזמנות, אנא נסה שוב מאוחר יותר');
        else{
            library.setIsLibrary(false);
            window.location = '#/library';
        }
    });
}

function getAdditions(menu_additions){
    var additions = [];
    var i = 0, j = 0;
    var new_addition_obj = new additionType(menu_additions[0]);
    additions.push(new_addition_obj);

    var tmpID = additions[0].id;
    for(i = 1; i <  menu_additions.length; i++){
        if(menu_additions[i].addition_type_id != tmpID){
            new_addition_obj = new additionType(menu_additions[i]);
            additions.push(new_addition_obj);
            tmpID = menu_additions[i].addition_type_id;
        }
    }

    for(i = 0; i < additions.length; i++){
        for(j = 0; j < menu_additions.length; j++){
            if(menu_additions[j].addition_type_id == additions[i].id){
                var new_addition_item = new additionItem(menu_additions[j]);
                additions[i].addition_items.push(new_addition_item);
            }
        }
    }

    return additions;
}

function additionType(type){
    this.id = type.addition_type_id;
    this.name = type.addition_type_name;
    this.description = type.addition_type_description;
    this.selection_type = type.selection_type;
    this.selections_amount = type.selections_amount;
    this.addition_items = [];
}

function additionItem(item){
    this.id = item.addition_item_id;
    this.name = item.addition_item_name;
    this.description = item.addition_item_description;
    this.image = item.image;
    this.price = item.price;
}

function handleItemsSelections(additions, type_id, item_id, message){
    var duration = 400;
    var selection_type = '';
    var selections_amount;
    var $length = $('.additions-type-container#'+type_id+' .selected:visible').length;
    var $tot_selected = $('.additions-type-container#'+type_id+' .selected');
    for(var i = 0; i < additions.length; i++){
        if(additions[i].id == type_id){
            selection_type = additions[i].selection_type;
            selections_amount = additions[i].selections_amount;
            break;
        }
    }
    var type_name = additions[i].name;
    item_id = 'addition-item-'+item_id;
    var $selected = $('#'+item_id).find('.selected');
    if(selection_type == 'required_exact'){
        required_exact_handler(duration, selections_amount, $length, $selected, $tot_selected, message, type_name);
    }
    if(selection_type == 'optional_max'){
        optional_max_handler(duration, selections_amount, $length, $selected, message, type_name);
    }
    if(selection_type == 'required_min'){
        required_min_handler(duration, $length, $selected);
    }

}

function required_min_handler(duration, $length, $selected){
    var clicked = true;
    if (!$selected.is(':visible')) {
        $selected.fadeIn(duration);
        $length++;
        clicked = false;
    }
    if (clicked && $selected.is(':visible')) {
        $selected.fadeOut(duration);
        $length--;
    }
}

function optional_max_handler(duration, selections_amount, $length, $selected, message, type_name){
    var clicked = true;
    if($length < selections_amount){
        if (!$selected.is(':visible')) {
            $selected.fadeIn(duration);
            $length++;
        }
        else{
            $selected.fadeOut(duration);
            $length--;
        }
        clicked = false;
    }
    if(clicked && $length == selections_amount){
        if (!$selected.is(':visible')) {
            var msg = 'באפשרותך לבחור עד ';
            msg += selections_amount;
            msg += ' פריטים מ - ';
            msg += '"'+type_name+'"';
            msg += ' באפשרותך לבטל בחירה אחרת';
            message.showMessage(msg);
        }
        else{
            $selected.fadeOut(duration);
            $length--;
        }
    }
}

function required_exact_handler(duration, selections_amount, $length, $selected, $tot_selected, message, type_name){
    var clicked = true;
    if(selections_amount == 1) {
        if ($length < selections_amount) {
            if (!$selected.is(':visible')) {
                $selected.fadeIn(duration);
                $length++;
            }
        }
        if ($length == selections_amount) {
            if (!$selected.is(':visible')) {
                $tot_selected.fadeOut(duration);
                $selected.fadeIn(duration);
            }
        }
    }
    if(selections_amount > 1){
        if ($length < selections_amount) {
            if (!$selected.is(':visible')) {
                $selected.fadeIn(duration);
                $length++;
                clicked = false;
            }
            if (clicked && $selected.is(':visible')) {
                $selected.fadeOut(duration);
                $length--;
            }
        }
        if($length == selections_amount){
            if (!$selected.is(':visible')) {
                var msg = 'עליך לבחור בדיוק ';
                msg += selections_amount;
                msg += ' פריטים מ - ';
                msg += '"'+type_name+'"';
                msg += ' באפשרותך לבטל בחירה אחרת';
                message.showMessage(msg);
                clicked = false;
            }
            if(clicked && $selected.is(':visible')){
                $selected.fadeOut();
                $length--;
            }
        }
    }
}

function checkSelections(additions){
    var msg = '';
    var type_id;
    var $tot_visible;
    $.each($('.additions-type-container'), function(){
        type_id = $(this).attr('id');
        $tot_visible = $(this).find('.selected').filter(':visible');
        for(var i = 0; i < additions.length; i++){
            if(type_id == additions[i].id ){
                if(additions[i].selection_type == 'required_exact' && $tot_visible.length != additions[i].selections_amount){
                    msg += 'עליך לבחור בדיוק ';
                    msg += additions[i].selections_amount + ' ';
                    msg += 'פריטים מ - ';
                    msg += '"'+additions[i].name+'"<br><br>';
                }
                if(additions[i].selection_type == 'required_min' && $tot_visible.length < additions[i].selections_amount){
                    msg += 'עליך לבחור לפחות ';
                    msg += additions[i].selections_amount + ' ';
                    msg += 'פריטים מ - ';
                    msg += '"'+additions[i].name+'"<br><br>';
                }
                break;
            }
        }
    });
    return msg;
}

function reset_local_storage(){
    var tmp_customer_type = localStorage.getItem('customer_type');
    var tmp_user_connected = localStorage.getItem('user_connected');
    var tmp_user_details = localStorage.getItem('user_details');
    var tmp_menu_stamp = localStorage.getItem('menu_stamp');
    localStorage.clear();
    localStorage.setItem('customer_type', tmp_customer_type);
    localStorage.setItem('user_connected', tmp_user_connected);
    localStorage.setItem('user_details', tmp_user_details);
    localStorage.setItem('menu_stamp', tmp_menu_stamp);
}