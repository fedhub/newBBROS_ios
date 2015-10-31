var app = angular.module('myapp.cart', [
    'myapp.services'
]);

app.controller('cart', ['$scope', '$location', 'message', 'cart', 'order_details', 'date', 'time_widget', 'authentication', 'swiper', function($scope, $location, message, cart, order_details, date, time_widget, authentication, swiper){

    $('#header-title p').html('הסל שלי');
    //if(swiper.get_arrived_from_cart() == true){
    //    swiper.set_direction('right');
    //    swiper.set_arrived_from_cart(false);
    //}
    //swiper.set_position(3);
    //swiper.set_background(3);
    //if(swiper.get_direction() == 'right') $('.cart-wrapper').addClass('slide-right');
    //if(swiper.get_direction() == 'left') $('.cart-wrapper').addClass('slide-left');
    //$scope.swipeLeft = function(page){
    //    swiper.set_direction('left');
    //    $location.url(page);
    //};
    //$scope.swipeRight = function(page){
    //    swiper.set_direction('right');
    //    $location.url(page);
    //};
    $('.cart-size').css('display','none');
    set_size();
    var $info_lightbox = $('#cart-item-info');
    var $delete_lightbox = $('#delete-item');
    var $order_type_lightbox = $('#order-type');
    var $payment_method_lightbox = $('#payment-method');
    var $order_time_lightbox = $('#order-time');
    $scope.total_price = cart.getTotalPrice();
    var cart_size = cart.getSize();
    if(cart_size > 0){
        $('.cart-size').css('display','block');
        $('.cart-size p').html(cart_size);
        if(!cart.getLock()) cart.calculatePrice();
        $scope.cart_items = cart.getMyCart();
        $scope.total_price = cart.getTotalPrice();
        cart.setLock(true);
    }
    else $('.cart-size').css('display','none');
    if(authentication.getCustomerType() == 'business') $('.payment-method-btn').css('display', 'none');
    $scope.info = function(item){
        $info_lightbox.fadeIn();
        $scope.item = item;
        $scope.comments = item.comments;
    };
    $scope.close_info = function(){
        $info_lightbox.fadeOut();
    };
    $scope.delete_item = function(item){
        $delete_lightbox.fadeIn();
        $scope.del_item = item;
    };
    $scope.close_delete_window = function(){
        $delete_lightbox.fadeOut();
    };
    $scope.deletion_approved = function(item){
        cart.deleteItem(item.id);
        $scope.total_price = cart.getTotalPrice();
        cart_size = cart.getSize();
        if(cart_size > 0){
            $('.cart-size').css('display','block');
            $('.cart-size p').html(cart_size);
        }
        else{
            $('.cart-size').css('display','none');
        }
        $delete_lightbox.fadeOut();
    };
    $scope.order_type = function(){
        $scope.order_types = [
            {class: "flaticon-free6", text: "משלוח", id: "delivery"},
            {class: "flaticon-box37", text: "לקחת", id: "take-away"},
            {class: "flaticon-two200", text: "לשבת", id: "sit"}
        ];
        $order_type_lightbox.fadeIn();
    };
    $scope.payment_method = function(){
        $scope.payment_methods = [
            {class: "flaticon-currency19", text: "מזומן", id: "cash"},
            {class: "flaticon-credit31", text: "אשראי", id: "credit"}
        ];
        $payment_method_lightbox.fadeIn();
    };
    $scope.order_time = function(){
        $order_time_lightbox.fadeIn();
        order_time_handler($scope, date, time_widget, message);
    };
    $scope.order_type_selected = function(order_type){
        order_type_validation(order_type, order_details, $order_type_lightbox, message);
    };
    $scope.payment_method_selected = function(payment_method){
        if(payment_method == 'cash'){
            $('.cart-wrapper .payment-method-btn p:first-child').removeClass().addClass('flaticon-currency19');
            $('.cart-wrapper .payment-method-btn p:last-child').html('מזומן');
        }
        if(payment_method == 'credit'){
            //$('.cart-wrapper .payment-method-btn p:first-child').removeClass().addClass('flaticon-credit31');
            //$('.cart-wrapper .payment-method-btn p:last-child').html('אשראי');
            message.showMessage('לקוח יקר, כרגע לא ניתן לבצע תשלום באמצעות כרטיס אשראי, אך האפשרות תיפתח בהקדם');
        }
        order_details.setPaymentMethod(payment_method);
        $payment_method_lightbox.fadeOut();
    };
    $scope.order_time_selected = function(){
        var hour = $('#hours').val();
        var minute = $('#minutes').val();
        if(minute.length == 0) minute = '00';
        var due_time = hour+':'+minute;
        order_details.setOrderTime(due_time);
        $order_time_lightbox.fadeOut(function(){reset_time_widget($scope);});
    };
    $scope.close_order_type = function(){
        $order_type_lightbox.fadeOut();
    };
    $scope.close_payment_method = function(){
        $payment_method_lightbox.fadeOut();
    };
    $scope.close_order_time = function(){
        $order_time_lightbox.fadeOut(function(){reset_time_widget($scope);});
    };
    $scope.hour_changed = function(hour){
        parseInt(hour);
        if(hour == time_widget.get_work_hours().open_hour) $scope.minutes = time_widget.get_first_hour_mins();
        else if(hour == time_widget.get_work_hours().close_hour){
            $scope.minutes = time_widget.get_last_hour_mins();
            $('#minutes').val('00');
        }
        else{
            $scope.minutes = time_widget.get_rest_hours_mins();
            $('#minutes').val('00');
        }
        if(time_widget.get_hours_length() >= 2 && date.getHour() == hour && date.getHour() != time_widget.get_work_hours().open_hour && time_widget.is_now_open()){
            if(date.getMinutes() <= 55) $scope.minutes = time_widget.get_curr_hour_mins();
            else $scope.minutes = time_widget.get_rest_hours_mins();
        }
    };

    $scope.link_from_cart = function(link_to){
        //swiper.set_direction('left');
        //swiper.set_arrived_from_cart(true);
        window.location = link_to;
    };
}]);

function reset_time_widget($scope){
    $scope.minutes = [];
    $scope.hours = [];
    $('.time-cont').css('display', 'none');
    $('#time-approval').css('display', 'none');
}

function order_type_validation(order_type, order_details, $order_type_lightbox, message){
    var url = base_url + '/get-order-type-settings';
    $('.spinner').css('display', 'block');
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status){
            $('.spinner').css('display', 'none');
            message.showMessage(res.msg);
        }
        else{
            $('.spinner').css('display', 'none');
            is_order_type_allowed(res.result, order_type, order_details, $order_type_lightbox, message);
        }
    });
}

function is_order_type_allowed(res, order_type, order_details, $order_type_lightbox, message){
    var msg = '';
    if(order_type == 'delivery'){
        if(res.delivery_allowed){
            order_details.setOrderType(order_type);
            $order_type_lightbox.fadeOut();
            $('.cart-wrapper .order-type-btn p:first-child').removeClass().addClass('flaticon-free6');
            $('.cart-wrapper .order-type-btn p:last-child').html('משלוח');
        }
        else {
            msg = 'לקוחות יקרים, זמנית לא ניתן לבצע משלוחים, עמכם הסליחה';
            message.showMessage(msg);
        }
    }
    if(order_type == 'sit'){
        if(res.sit_allowed){
            order_details.setOrderType(order_type);
            $order_type_lightbox.fadeOut();
            $('.cart-wrapper .order-type-btn p:first-child').removeClass().addClass('flaticon-two200');
            $('.cart-wrapper .order-type-btn p:last-child').html('לשבת');
        }
        else {
            msg = 'לקוחות יקרים, זמנית לא ניתן לבצע הזמנות לשבת, עמכם הסליחה';
            message.showMessage(msg);
        }
    }
    if(order_type == 'take-away'){
        if(res.take_away_allowed){
            order_details.setOrderType(order_type);
            $order_type_lightbox.fadeOut();
            $('.cart-wrapper .order-type-btn p:first-child').removeClass().addClass('flaticon-box37');
            $('.cart-wrapper .order-type-btn p:last-child').html('לקחת');
        }
        else{
            msg = 'לקוחות יקרים, זמנית לא ניתן לבצע הזמנות לקחת, עמכם הסליחה';
            message.showMessage(msg);
        }
    }
}

function order_time_handler($scope, date, time_widget, message){

    var url = base_url + '/get-working-hours';
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status) message.showMessage(res.msg);
        else{
            time_widget.set_time_widget(res.working_time);
            // now it's the closing hour
            $scope.hours = time_widget.get_hours();
            if(time_widget.get_hours_length() == 1) $scope.minutes = time_widget.get_curr_hour_mins();
            // more then one hour open store left
            if(time_widget.get_hours_length() >= 2){
                if(date.getHour() == res.working_time.open_hour) $scope.minutes = time_widget.get_first_hour_mins();
                else {
                    if(time_widget.is_now_open() && date.getMinutes() <= 55) $scope.minutes = time_widget.get_curr_hour_mins();
                    else if(time_widget.is_now_open() && date.getMinutes() > 55) $scope.minutes = time_widget.get_rest_hours_mins();
                    else $scope.minutes = time_widget.get_first_hour_mins();
                }
            }
            $scope.$apply();
            $('.time-cont').css('display', 'block');
            $('#time-approval').css('display', 'table');
            if($('#hours option:selected').text().length == 0) {
                $('#hours option').eq(0).remove();
            }
        }
    });
}

function set_size(){
    var header_height = $('header').height();
    var footer_height = $('.cart-footer').height();
    var body_height = $('body').height();
    $('.cart-wrapper .items-container').height(body_height-header_height-footer_height);
}