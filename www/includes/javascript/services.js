var app = angular.module('myapp.services', []);

// Authentication
app.service('authentication', function($rootScope){

    var connected = false;
    var customer_type = '';
    var form_type;

    this.setConnected = function(state){
        connected = state;
        if(connected) $rootScope.$broadcast('got-connected');
    };

    this.isConnected = function(){
        return connected;
    };

    this.setCustomerType = function(type){
        customer_type = type;
    };

    this.getCustomerType = function(){
        return customer_type;
    };

    this.set_form_type = function(type){
        form_type = type;
    };

    this.get_form_type = function(){
        return form_type;
    };

});

app.service('user_session', ['authentication', 'customer', 'message', function(authentication, customer, message){

    var details = {};
    var session_counter = 0;

    this.setSessionCounter = function(val){
        session_counter = val;
    };

    this.getSessionCounter = function(){
        return session_counter;
    };

    this.isConnected = function(){
        if(typeof(Storage) !== "undefined")
            return parseInt(localStorage.getItem("user_connected"));
        else console.log('Local storage is not available');
    };

    this.setCustomerType = function(type){
        if(typeof(Storage) !== "undefined")
            localStorage.setItem("customer_type", type);
        else console.log('Local storage is not available');
    };

    this.getCustomerType = function(){
        if(typeof(Storage) !== "undefined")
            return localStorage.getItem("customer_type");
        else console.log('Local storage is not available');
    };

    this.setConnected = function(bool){
        if(typeof(Storage) !== "undefined")
            localStorage.setItem("user_connected", bool);
        else console.log('Local storage is not available');
    };

    this.setDetails = function(det, customer_type){
        details.first_name = det.first_name;
        details.last_name = det.last_name;
        details.phone_number = det.phone_number;
        details.email = det.email;
        details.street = det.street;
        details.house_number = det.house_number;
        details.floor = det.floor;
        details.enter = det.enter;
        if(customer_type == 'business'){
            details.password = det.password;
            details.company_code = det.company_code;
            details.company_name = det.company_name;
            details.budget = det.budget;
        }
        if(typeof(Storage) !== "undefined")
            localStorage.setItem("user_details", JSON.stringify(details));
        else console.log('Local storage is not available');
    };

    //this.getDetails = function(){
    //    if(typeof (Storage) !== "undefined")
    //        return JSON.parse(localStorage.getItem("user_details"));
    //    else console.log('Local storage is not available');
    //};

    this.setUser = function(){
        if(typeof(Storage) !== "undefined") {
            authentication.setConnected(true);
            session_counter = 1;
            authentication.setCustomerType(localStorage.getItem("customer_type"));
            customer.setDetails(JSON.parse(localStorage.getItem("user_details")));
            if(authentication.getCustomerType() == 'private') message.greetings('שלום ' + customer.getCustomerName());
            if(authentication.getCustomerType() == 'business'){
                var greeting_msg = 'שלום ';
                greeting_msg += customer.getCustomerName() + ', ';
                greeting_msg += 'יתרה: ';
                greeting_msg += customer.getBudget() + ' &#8362;';
                message.greetings(greeting_msg);
            }
        }
        else console.log('Local storage is not available');
    };

}]);

app.service('payment', function(){

    var cardcom_url = '';

    this.set_url = function(url){
        cardcom_url = url;
    };

    this.get_url = function(){
        return cardcom_url;
    };

});

app.service('library', function(){

    var library;
    var is_library = false;

    this.setLibrary = function(lib){
        library = lib;
    };

    this.getLibrary = function(){
        return library;
    };
    this.getLibraryID = function(){
        return library.id;
    };

    this.setIsLibrary = function(state){
        is_library = state;
    };

    this.getIsLibrary = function(){
        return is_library;
    };

});

app.service('customer', ['authentication', function(authentication){

    var details = {};

    this.setDetails = function(det){
        details.first_name = det.first_name;
        details.last_name = det.last_name;
        details.phone_number = det.phone_number;
        details.email = det.email;
        details.street = det.street;
        details.house_number = det.house_number;
        details.floor = det.floor;
        details.enter = det.enter;
        if(authentication.getCustomerType() == 'business'){
            details.password = det.password;
            details.company_code = det.company_code;
            details.company_name = det.company_name;
            details.budget = det.budget;
        }
    };

    this.getDetails = function(){
        return details;
    };

    this.getCustomerName = function(){
        return details.first_name;
    };

    this.getPhoneNumber = function(){
        return details.phone_number;
    };

    this.getBudget = function(){
        return details.budget;
    };

}]);

// Messages
app.service('message', function($rootScope){

    var $screen_message = $('#screen-message');
    var $p = $screen_message.find('p');
    var delay = 2000;
    var $lightbox = $('#lightbox');
    var $slider_title = $('.mobile-menu-container .connected p:nth-child(2)');

    this.showMessage = function(msg){
        $p.html(msg);
        $screen_message.fadeIn().delay(delay).fadeOut();
    };

    this.msgCloseLightbox = function(msg){
        $p.html(msg);
        $screen_message.fadeIn().delay(delay).fadeOut(function(){
            $lightbox.fadeOut(function(){
                $rootScope.$broadcast('msg-done');
            });
        });
    };

    this.greetings = function(msg){
        $slider_title.html(msg);
    };

    this.getDelay = function(){
        return delay;
    };

});

// Cart
app.service('cart', ['library', function(library){

    var my_cart = [];
    var food_item = {};
    var additions = [];
    var library_item;
    var total_price = 0;
    var lock = true;
    var comments = '';
    var comments_flag = false;

    this.set_comments_flag = function(bool){
        comments_flag = bool;
    };

    this.get_comments_flag = function(){
        return comments_flag;
    };

    this.set_comments = function(com){
        comments = com;
    };

    this.get_comments = function(){
        return comments;
    };

    this.resetCart = function(){
        my_cart = [];
    };

    this.getSize = function(){
        return my_cart.length;
    };

    this.setLock = function(state){
        lock = state;
    };

    this.getLock = function(){
        return lock;
    };

    this.setAdditions = function(adds){
        additions = [];
        additions = adds;
    };

    this.getAdditions = function(){
      return additions;
    };

    this.foodItem = function(item) {
        food_item = {};
        food_item = new foodItem(item);
    };

    function foodItem(item){
        this.id = item.id;
        this.name = item.name;
        this.description = item.description;
        this.price = item.price;
        this.total_price = 0;
        this.addition_types = [];
    }

    this.addToCart = function(adds){
        food_item.addition_types = adds;
        food_item.comments = comments;
        comments = '';
        my_cart.push(food_item);
    };

    this.add = function(item){
        my_cart.push(item);
    };

    // when inside library and adding item to cart
    this.updateTotalPrice = function(price){
        total_price += price;
    };

    this.calculatePrice = function(){
        var last_item = my_cart.length - 1;
        my_cart[last_item].total_price += my_cart[last_item].price;
        for(var j = 0; j < my_cart[last_item].addition_types.length; j++){
            for(var k = 0; k < my_cart[last_item].addition_types[j].addition_items.length; k++){
                my_cart[last_item].total_price += my_cart[last_item].addition_types[j].addition_items[k].price;
            }
        }
        if(!library.getIsLibrary()) total_price += my_cart[last_item].total_price;
    };

    this.calLibItemTotPrice = function(){
        library_item.total_price += library_item.price;
        for(var j = 0; j < library_item.addition_types.length; j++){
            for(var k = 0; k < library_item.addition_types[j].addition_items.length; k++){
                library_item.total_price += library_item.addition_types[j].addition_items[k].price;
            }
        }
    };

    this.print = function(){
        for(var i = 0; i < my_cart.length; i++){
            console.log(my_cart[i].name);
            for(var j = 0; j < my_cart[i].addition_types.length; j++){
                console.log(my_cart[i].addition_types[j].name);
                for(var k = 0; k < my_cart[i].addition_types[j].addition_items.length; k++){
                    console.log(my_cart[i].addition_types[j].addition_items[k].name);
                }
            }
        }
    };

    this.deleteItem = function(item_id){
        for(var i = 0; i < my_cart.length; i++){
            if(my_cart[i].id == item_id){
                total_price -= my_cart[i].total_price;
                my_cart.splice(i,1);
                break;
            }
        }
    };

    this.setLibraryItem = function(item){
        library_item = item;
    };

    this.getLibraryItem = function(){
        return library_item;
    };

    this.removeLibraryItem = function(){
        my_cart.splice((my_cart.length-1), 1);
    };

    this.setTotalPrice = function(price){
        total_price += price;
    };

    this.getTotalPrice = function(){
        return total_price;
    };

    this.getMyCart = function(){
        return my_cart;
    };

}]);

app.service('order_details', function(){

    var order_type = '';
    var payment_method = '';
    var order_time = '';

    this.setOrderType = function(type){
        order_type = type;
    };

    this.setPaymentMethod = function(method){
        payment_method = method;
    };

    this.setOrderTime = function(time){
        order_time = time;
    };

    this.getPaymentMethod = function(){
        return payment_method;
    };

    this.getOrderType = function(){
        return order_type;
    };

    this.getOrderTime = function(){
        return order_time;
    };

});

app.service('date', function(){

    var curr_date;
    var day, month, year;
    var hour, minutes, seconds;

    this.getDay = function(){
        curr_date = new Date();
        return curr_date.getDate();
    };

    this.getMonth = function(){
        curr_date = new Date();
        return (curr_date.getMonth() + 1);
    };

    this.getYear = function(){
        curr_date = new Date();
        return curr_date.getFullYear()
    };

    this.getHour = function(){
        curr_date = new Date();
        return curr_date.getHours();
    };

    this.getMinutes = function(){
        curr_date = new Date();
        return  curr_date.getMinutes();
    };

    this.getSeconds = function(){
        curr_date = new Date();
        return curr_date.getSeconds();
    };

    this.getFullDate = function(){
        curr_date = new Date();
        return curr_date.getDate()+'.'+(curr_date.getMonth()+1)+'.'+curr_date.getFullYear();
    };

    this.getDefaultTime = function(){
        curr_date = new Date();
        return curr_date.getHours()+':'+add_zero_before(curr_date.getMinutes());
    };

    function add_zero_before(i) {
        if (i < 10) {i = "0" + i}  // add zero in front of numbers < 10
        return i;
    }

});

app.service('time_widget', ['date', function(date){

    var first_hour_mins = [], last_hour_mins = [], rest_hours_mins = [], hours = [];
    var work_hours = {};
    var now_open = false;

    this.set_time_widget = function(working_time){
        work_hours = working_time;
        var curr_hour = date.getHour();
        var curr_mins = date.getMinutes();
        // if we are out of the working time range
        if(curr_hour > working_time.close_hour || curr_hour < working_time.open_hour
            || (curr_hour == working_time.open_hour && curr_mins < working_time.open_minutes)
            || (curr_hour == working_time.close_hour && curr_mins > working_time.close_minutes)){
            if(working_time.close_minutes == 0) hours = get_hours(working_time.open_hour, (working_time.close_hour-1));
            if(working_time.close_minutes != 0) hours = get_hours(working_time.open_hour, working_time.close_hour);
            first_hour_mins = get_mins(working_time.open_minutes, 55);
            rest_hours_mins = get_mins(0, 55);
            last_hour_mins = get_mins(0, working_time.close_minutes);
        }
        // if we are within the working time range
        if((curr_hour < working_time.close_hour && curr_hour > working_time.open_hour)
            || (curr_hour == working_time.open_hour && curr_mins >= working_time.open_minutes)
            || (curr_hour == working_time.close_hour && curr_mins <= working_time.close_minutes)){
            if(working_time.close_minutes == 0) hours = get_hours(curr_hour, (working_time.close_hour-1));
            if(working_time.close_minutes != 0) hours = get_hours(curr_hour, working_time.close_hour);
            first_hour_mins = get_mins(round5(curr_mins), 55);
            rest_hours_mins = get_mins(0, 55);
            last_hour_mins = get_mins(0, working_time.close_minutes);
            if(curr_hour == working_time.close_hour && curr_mins <= working_time.close_minutes){
                last_hour_mins = get_mins(round5(curr_mins), working_time.close_minutes);
            }
            if(curr_mins > 55){
                if(working_time.close_minutes == 0) hours = get_hours((curr_hour + 1), (working_time.close_hour-1));
                if(working_time.close_minutes != 0) hours = get_hours((curr_hour + 1), working_time.close_hour);
                first_hour_mins = get_mins(0, 55);
                rest_hours_mins = get_mins(0, 55);
                last_hour_mins = get_mins(0, working_time.close_minutes);
            }
            now_open = true;
        }
    };

    this.get_curr_hour_mins = function(){
        return get_mins(round5(date.getMinutes()), 55);
    };

    this.get_first_hour_mins = function(){
        return first_hour_mins;
    };

    this.get_rest_hours_mins = function(){
        return rest_hours_mins;
    };

    this.get_last_hour_mins = function(){
        return last_hour_mins;
    };

    this. get_hours = function(){
        return hours;
    };

    this.get_hours_length = function(){
        return hours.length;
    };

    this.get_work_hours = function(){
        return work_hours;
    };

    this.is_now_open = function(){
        return now_open;
    };

    function round5(x) {
        return Math.ceil(x/5)*5;
    }

    function add_zero_before(i) {
        if (i < 10) {i = "0" + i}  // add zero in front of numbers < 10
        return i;
    }

    function get_mins(starting_mins, ending_mins){
        var mins = [];
        for(var i = starting_mins; i <= ending_mins; i += 5){
            mins.push(add_zero_before(i));
        }
        return mins;
    }

    function get_hours(starting_hour, ending_hour){
        var hours = [];
        for(var i = starting_hour; i <= ending_hour; i++){
            hours.push(i);
        }
        return hours;
    }

}]);

app.service('application_settings', function(){

    this.get_working_time_msg = function(working_time){
        var msg = 'לקוח יקר, החנות סגורה כרגע, שעות הפתיחה של החנות הם בין ';
        if(working_time.open_hour < 10) msg += '0'+working_time.open_hour;
        else msg += working_time.open_hour;
        msg += ':';
        if(working_time.open_minutes < 10) msg += '0'+working_time.open_minutes;
        else msg += working_time.open_minutes;
        msg += ' - ';
        if(working_time.close_hour < 10) msg += '0'+working_time.close_hour;
        else msg += working_time.close_hour;
        msg += ':';
        if(working_time.close_minutes < 10) msg += '0'+working_time.close_minutes;
        else msg += working_time.close_minutes;
        return msg;
    };

    this.store_closed = function(working_time){
        var date = new Date();
        if(date.getHours() < working_time.open_hour) return true;
        if(date.getHours() == working_time.open_hour){
            if(date.getMinutes() < working_time.open_minutes) return true;
        }
        if(date.getHours() > working_time.close_hour) return true;
        if(date.getHours() == working_time.close_hour){
            if(date.getMinutes()  > working_time.close_minutes) return true;
        }
        return false;
    };

});

app.service('swiper', function(){

    var direction = 'left';
    var position = 1;
    var arrived_from_cart = false;
    var menu_type_name = ''; // for use when swiping right from menu_additions to menu_items
    this.set_direction = function(state){
        direction = state;
    };

    this.get_direction = function(){
        return direction;
    };

    this.set_position = function(pos){
        position = pos;
    };

    this.get_position = function(){
        return position;
    };

    this.set_arrived_from_cart = function(state){
        arrived_from_cart = state;
    };

    this.get_arrived_from_cart = function(){
        return arrived_from_cart;
    };

    this.set_menu_type_name = function(name){
        menu_type_name = name;
    };

    this.get_menu_type_name = function(){
        return menu_type_name;
    };

    this.set_background = function(pos){
        var id;
        if(pos == 1) id = 'main';
        if(pos == 2) id = 'menu';
        if(pos == 3) id = 'cart';
        if(pos == 4) id = 'status';
        $('li').removeClass('li_background_slide');
        $('#'+id).addClass('li_background_slide');
    };

});













