var app = angular.module('myapp.forms', [
    'myapp.services',
    'myapp.menu'
]);

app.directive('forms', ['authentication', 'message', 'customer', 'cart', 'user_session', function(authentication, message, customer, cart, user_session){

    // GLOBALS
    var $lightbox = $('#lightbox'), $customer_type = $('#customer-type'), $first_name='', $last_name='', $phone_number='', $email='',
        $street='', $house_number='', $floor='', $enter='', $password='', $password_authentication='', $company_code='', $budget='', phone_number_updated = false;

    return {
        controller: function($scope) {
            $scope.signed_up = 'לא מחובר';
            $scope.update_comments = function(){
                cart.set_comments($('.comments-lightbox textarea').val());
                $('.comments-lightbox textarea').val('');
                $('.comments-lightbox').fadeOut(function(){
                    cart.set_comments_flag(true);
                });
            };
            $scope.form_request = function(form_type){
                authentication.set_form_type(form_type);
                if(form_type == 'log-out'){
                    if(authentication.isConnected()){
                        message.greetings('לא מחובר');
                        message.showMessage('ההתנתקות הושלמה');
                        setTimeout(function(){
                            localStorage.clear();
                            user_session.setConnected(0);
                            user_session.setSessionCounter(0);
                            location.reload(); window.location = "#/home";
                        }, (message.getDelay()+1000));
                    }
                    else message.showMessage('אינך מחובר');
                }
                else if(authentication.isConnected()){
                    var msg = '';
                    if(form_type == 'sign-up' || form_type == 'log-in'){
                        if(form_type == 'sign-up') msg = 'עליך להתנתק מהערכת לפני ביצוע הרשמה';
                        if(form_type == 'log-in') msg = 'הינך מחובר למערכת, אם ברצונך להתחבר כמשתמש אחר עליך להתנתק ראשית';
                        message.showMessage(msg);
                    }
                    if(form_type == 'update-details') form_req($scope, form_type);
                }
                else{
                    if(form_type == 'log-in') $customer_type.fadeIn();
                    else if(form_type == 'update-details'){
                        msg = 'עלייך להתחבר למערכת על מנת לערוך פרטים אישיים';
                        message.showMessage(msg);
                    }
                    else{
                        form_req($scope, form_type);
                        //$scope.form_approved = function(){
                        //    form_approved(form_type);
                        //};
                    }
                }
                //$scope.customer_type = function(cust_type){
                //    console.log('here');
                //    authentication.setCustomerType(cust_type);
                //    user_session.setCustomerType(cust_type);
                //    //if(cust_type == 'private') authentication.setCustomerType('private');
                //    //if(cust_type == 'business') authentication.setCustomerType('business');
                //    $('#customer-type').fadeOut();
                //    form_req($scope, 'log-in');
                //};
                //$scope.form_approved = function(){
                //    form_approved(form_type);
                //};
            };
            $scope.customer_type = function(cust_type){
                authentication.setCustomerType(cust_type);
                user_session.setCustomerType(cust_type);
                //if(cust_type == 'private') authentication.setCustomerType('private');
                //if(cust_type == 'business') authentication.setCustomerType('business');
                $('#customer-type').fadeOut();
                form_req($scope, 'log-in');
            };
            $scope.form_approved = function(){
                form_approved(authentication.get_form_type());
            };
        }
    };

    function form_req($scope, form_type){
        $('.indirect').css('display','none');
        $lightbox.fadeIn();
        if(form_type == 'sign-up') $scope.title = 'הרשמה';
        if(form_type == 'log-in') $scope.title = 'התחברות';
        if(form_type == 'log-out') $scope.title = 'התנתקות';
        if(form_type == 'update-details' && authentication.getCustomerType() == 'business'){
            $scope.title = 'עדכון פרטים אישיים';
            $('.approve').css('margin-top', '5px');
            $('.approve').css('height', '35px');
        }
        $scope.form_items = form_items(form_type);
        if(form_type == 'log-in' && authentication.getCustomerType() == 'private'){
            $('.indirect').toggle();
        }
    }

    function form_approved(form_type){
        $('.spinner').css('display', 'block');
        var error = '';
        var compare_error = '';
        set_globals(form_type);
        if(form_type == 'update-details'){
            error = update_details_err_msg();
            compare_error = compare_msg();
        }
        else error = error_msg(form_type);
        if(error.length > 0){
            $('.spinner').css('display', 'none');
            message.showMessage(error);
        }
        else if(compare_error.length > 0){
            $('.spinner').css('display', 'none');
            message.showMessage(compare_error);
        }
        else ajax_handler(form_type);
    }

    function ajax_handler(form_type){
        var customer_details = get_customer_details(form_type);
        var url = base_url;
        if(form_type == 'sign-up') url += '/sign-up';
        if(form_type == 'log-in') url += '/log-in&customer_type='+authentication.getCustomerType();
        if(form_type == 'update-details') url += '/update-customer-details&customer_type='+authentication.getCustomerType()+'&phone_number_updated='+phone_number_updated;
        $.ajax({
            type: 'POST',
            url: url,
            data : {data : JSON.stringify(customer_details)}
        }).done(function(res){
            ajax_response(res, form_type);
            $('.spinner').css('display', 'none');
        });
    }

    function ajax_response(res, form_type){
        var globals;
        if(form_type == 'sign-up') {
            if (res) {
                globals = get_globals(form_type);
                user_session.setDetails(globals, 'private');
                user_session.setCustomerType('private');
                authentication.setCustomerType('private');
                customer.setDetails(globals);
                user_session.setConnected(1);
                user_session.setSessionCounter(1);
                authentication.setConnected(true);
                message.msgCloseLightbox('ההרשמה בוצעה בהצלחה');
                message.greetings('שלום ' + $first_name);
            }
            else{
                $('.spinner').css('display', 'none');
                message.showMessage('מספר הטלפון שהוזן כבר רשום במערכת');
            }
        }
        if(form_type == 'update-details'){
            if(res.status){
                globals = get_globals(form_type);
                user_session.setDetails(globals);
                customer.setDetails(globals);
                message.msgCloseLightbox('עדכון הפרטים האישיים הושלם בהצלחה');
                if(authentication.getCustomerType() == 'private') message.greetings('שלום ' + $first_name);
                if(authentication.getCustomerType() == 'business') {
                    var msg = 'שלום ';
                    msg += $first_name + ', ';
                    msg += 'יתרה: ';
                    msg += customer.getBudget() + ' &#8362;';
                    message.greetings(msg);
                }
            }
            else {
                $('.spinner').css('display', 'none');
                message.showMessage(res.msg);
            }
        }
        if(form_type == 'log-in'){
            if(res == 'phone-not-exist'){
                $('.spinner').css('display', 'none');
                message.showMessage('מספר הטלפון שהוזן אינו רשום במערכת');
            }
            else if(res == 'name-not-match'){
                $('.spinner').css('display', 'none');
                message.showMessage('ייתכן והשם הפרטי שהוזן לא הוזן כראוי מאחר ולא נמצאה התאמה למספר הטלפון, אנא נסה שוב');
            }
            else if(res == 'password-not-match'){
                $('.spinner').css('display', 'none');
                message.showMessage('סיסמה שגויה, אנא נסה שוב');
            }
            else{
                user_session.setDetails(res, authentication.getCustomerType());
                customer.setDetails(res);
                user_session.setConnected(1);
                user_session.setSessionCounter(1);
                authentication.setConnected(true);
                message.msgCloseLightbox('ההתחברות הושלמה');
                if(authentication.getCustomerType() == 'private') message.greetings('שלום ' + $first_name);
                if(authentication.getCustomerType() == 'business'){
                    var greeting_msg = 'שלום ';
                    greeting_msg += res.first_name + ', ';
                    greeting_msg += 'יתרה: ';
                    greeting_msg += res.budget + ' &#8362;';
                    message.greetings(greeting_msg);
                }
            }
        }
    }

    function get_globals(form_type){
        var json;
        if(form_type == 'sign-up' || form_type == 'update-details'){
            json = {
                first_name: $first_name,
                last_name: $last_name,
                phone_number: $phone_number,
                email: $email,
                street: $street,
                house_number: $house_number,
                floor: $floor,
                enter: $enter
            };
        }
        if(authentication.getCustomerType() == 'business'){
            var business_former_details = customer.getDetails();
            json.password = $password;
            json.company_code = business_former_details.company_code;
            json.company_name = business_former_details.company_name;
            json.budget = business_former_details.budget;
        }
        return json;
    }

    function set_globals(form_type){
        if(form_type == 'sign-up' || form_type == 'log-in') {
            if(form_type == 'sign-up' || (form_type == 'log-in' && authentication.getCustomerType() == 'private')){
                $first_name   = $('#first-name input').val();
                $phone_number = $('#phone-number input').val();
            }
            if(form_type == 'log-in' && authentication.getCustomerType() == 'business'){
                $phone_number = $('#phone-number input').val();
                $password     = $('#password input').val();
            }
        }
        if(form_type == 'sign-up' || form_type == 'update-details'){
            $last_name    = $('#last-name input').val();
            $email        = $('#email input').val();
            $street       = $('#street input').val();
            $house_number = $('#house-number input').val();
            $floor        = $('#floor input').val();
            $enter        = $('#enter input').val();
        }
        if(form_type == 'update-details'){
            $first_name   = $('#first-name input').val();
            $phone_number = $('#phone-number input').val();
            if(authentication.getCustomerType() == 'business'){
                $password     = $('#password input').val();
                $password_authentication = $('#password-authentication input').val();
            }
        }
    }

    function error_msg(form_type){
        var error = '';
        if(form_type == 'sign-up' || (form_type == 'log-in' && authentication.getCustomerType() == 'private')){
            if($first_name.length == 0) error += 'הזן שם פרטי. ';
            if($('#first-name .validation p').hasClass('flaticon-cancel4')) error += 'שם פרטי לא תקין. ';
            if($phone_number.length == 0) error += 'הזן מספר טלפון. ';
            if($phone_number.length > 0 && $phone_number.length < 10) error += 'הזן מספר טלפון בן 10 ספרות. ';
            if($('#phone-number .validation p').hasClass('flaticon-cancel4')) error += 'מספר טלפון לא תקין. ';
        }
        if(form_type == 'log-in' && authentication.getCustomerType() == 'business'){
            if($phone_number.length == 0) error += 'הזן מספר טלפון. ';
            if($phone_number.length > 0 && $phone_number.length < 10) error += 'הזן מספר טלפון בן 10 ספרות. ';
            if($('#phone-number .validation p').hasClass('flaticon-cancel4')) error += 'מספר טלפון לא תקין. ';
            if($password.length == 0) error += 'הזן סיסמה. ';
            if($('#password .validation p').hasClass('flaticon-cancel4')) error += 'הסיסמה כוללת תווים לא חוקיים. ';
        }
        if(form_type == 'sign-up'){
            if($last_name.length == 0) error += 'הזן שם משפחה. ';
            if($('#last-name .validation p').hasClass('flaticon-cancel4')) error += 'שם משפחה לא תקין. ';
            if($email.length > 0 && $('#email .validation p').hasClass('flaticon-cancel4')) error += 'כתובת דוא"ל לא תקינה. ';
            if($street.length == 0) error += 'הזן רחוב. ';
            if($('#street .validation p').hasClass('flaticon-cancel4')) error += 'שם הרחוב לא תקין. ';
            if($house_number.length == 0) error += 'הזן מספר בית. ';
            if($('#house-number .validation p').hasClass('flaticon-cancel4')) error += 'מספר בית לא תקין. ';
            if($floor.length == 0) error += 'הזן קומה. ';
            if($floor.length > 0 && $('#floor .validation p').hasClass('flaticon-cancel4')) error += 'קומה לא תקינה. ';
            if($enter.length > 0 && $('#enter .validation p').hasClass('flaticon-cancel4')) error += 'כניסה לא תקינה. ';
        }
        return error;
    }

    function update_details_err_msg(){
        var error = '';
        if($first_name.length == 0) error += 'הזן שם פרטי. ';
        if($('#first-name .validation p').hasClass('flaticon-cancel4')) error += 'שם פרטי לא תקין. ';
        if($last_name.length == 0) error += 'הזן שם משפחה. ';
        if($('#last-name .validation p').hasClass('flaticon-cancel4')) error += 'שם משפחה לא תקין. ';
        if($phone_number.length == 0) error += 'הזן מספר טלפון. ';
        if($phone_number.length > 0 && $phone_number.length < 10) error += 'הזן מספר טלפון בן 10 ספרות. ';
        if($('#phone-number .validation p').hasClass('flaticon-cancel4')) error += 'מספר טלפון לא תקין. ';
        if($email.length > 0 && $('#email .validation p').hasClass('flaticon-cancel4')) error += 'כתובת דוא"ל לא תקינה. ';
        if($street.length == 0) error += 'הזן רחוב. ';
        if($('#street .validation p').hasClass('flaticon-cancel4')) error += 'שם הרחוב לא תקין. ';
        if($house_number.length == 0) error += 'הזן מספר בית. ';
        if($('#house-number .validation p').hasClass('flaticon-cancel4')) error += 'מספר בית לא תקין. ';
        if($floor.length == 0) error += 'הזן קומה. ';
        if($floor.length > 0 && $('#floor .validation p').hasClass('flaticon-cancel4')) error += 'קומה לא תקינה. ';
        if($enter.length > 0 && $('#enter .validation p').hasClass('flaticon-cancel4')) error += 'כניסה לא תקינה. ';
        if(authentication.getCustomerType() == 'bussiness'){
            if($password.length == 0) error += 'הזן סיסמה. ';
            if($('#password .validation p').hasClass('flaticon-cancel4')) error += 'הסיסמה כוללת תווים לא חוקיים. ';
        }
        return error;
    }

    function compare_msg(){
        var prev_dets = customer.getDetails();
        var error = '';
        var is_changed = false;
        if($first_name != prev_dets.first_name) is_changed = true;
        if($last_name != prev_dets.last_name) is_changed = true;
        if($phone_number != prev_dets.phone_number){
            phone_number_updated = true;
            is_changed = true;
        }
        if($email != prev_dets.email) is_changed = true;
        if($street != prev_dets.street) is_changed = true;
        if($house_number != prev_dets.house_number) is_changed = true;
        if($floor != prev_dets.floor) is_changed = true;
        if($enter != prev_dets.enter) is_changed = true;
        if(authentication.getCustomerType() == 'business' && $password != prev_dets.password){
            is_changed = true;
            if($password_authentication.length == 0) error += 'אנא אמת סיסמה חדשה. ';
            if($('#password-authentication .validation p').hasClass('flaticon-cancel4')) error += 'אימות סיסמה לא תקינה. ';
            if($password != $password_authentication) error += 'אימות הסיסמה נכשל, אנא נסה שוב. ';
        }
        if(error.length > 0) return error;
        else if(!is_changed) error = 'לא בוצעו שינויים. ';
        return error;
    }

    function form_items(form_type){
        var form_items = [];
        if(form_type == 'sign-up') {
            form_items = [
                {required: '*', type: 'text', label: 'שם פרטי:', max_length: 20, id: 'first-name', value: ''},
                {required: '*', type: 'text', label: 'שם משפחה:', max_length: 20, id: 'last-name', value: ''},
                {required: '*', type: 'text', label: 'טלפון:', max_length: 10, id: 'phone-number', value: ''},
                {required: '', type: 'text', label: 'דוא"ל:', max_length: 50, id: 'email', value: ''},
                {required: '*', type: 'text', label: 'רחוב:', max_length: 20, id: 'street', value: ''},
                {required: '*', type: 'text', label: 'מספר בית:', max_length: 3, id: 'house-number', value: ''},
                {required: '*', type: 'text', label: 'קומה:', max_length: 2, id: 'floor', value: ''},
                {required: '', type: 'text', label: 'כניסה:', max_length: 1, id: 'enter', value: ''}
            ];
        }
        if(form_type == 'log-in') {
            if(authentication.getCustomerType() == 'private'){
                form_items = [
                    {required: '*', type: 'text', label: 'שם פרטי:', max_length: 20, id: 'first-name', value: ''},
                    {required: '*', type: 'text', label: 'טלפון:', max_length: 10, id: 'phone-number', value: ''}
                ];
            }
            if(authentication.getCustomerType() == 'business'){
                form_items = [
                    {required: '*', type: 'text', label: 'טלפון:', max_length: 10, id: 'phone-number', value: ''},
                    {required: '*', type: 'password', label: 'סיסמה:', max_length: 15, id: 'password', value: ''}
                ];
            }
        }
        if(form_type == 'update-details') {
            var dets = customer.getDetails();
            form_items = [
                {required: '', type: 'text', label: 'שם פרטי:', max_length: 20, id: 'first-name', value: dets.first_name},
                {required: '', type: 'text', label: 'שם משפחה:', max_length: 20, id: 'last-name', value: dets.last_name},
                {required: '', type: 'text', label: 'טלפון:', max_length: 10, id: 'phone-number', value: dets.phone_number},
                {required: '', type: 'text', label: 'דוא"ל:', max_length: 50, id: 'email', value: dets.email},
                {required: '', type: 'text', label: 'רחוב:', max_length: 20, id: 'street', value: dets.street},
                {required: '', type: 'text', label: 'מספר בית:', max_length: 3, id: 'house-number', value: dets.house_number},
                {required: '', type: 'text', label: 'קומה:', max_length: 2, id: 'floor', value: dets.floor},
                {required: '', type: 'text', label: 'כניסה:', max_length: 1, id: 'enter', value: dets.enter}
            ];
            if(authentication.getCustomerType() == 'business'){
                form_items.push({required: '', type: 'password', label: 'סיסמה:', max_length: 15, id: 'password', value: dets.password});
                form_items.push({required: '', type: 'password', label: 'אמת סיסמה:', max_length: 15, id: 'password-authentication', value: ''});
            }
        }
        return form_items;
    }

    function get_customer_details(form_type){
        var customer_details = {};
        if(form_type == 'sign-up' || form_type == 'update-details'){
           customer_details = {
                first_name:     $first_name,
                last_name:      $last_name,
                phone_number:   $phone_number,
                old_phone_number: customer.getPhoneNumber(),
                email:          $email,
                street:         $street,
                house_number:   $house_number,
                floor:          $floor,
                enter:          $enter
            };
            if(authentication.getCustomerType() == 'business') customer_details.password = $password;
        }
        if(form_type == 'log-in'){
            if(authentication.getCustomerType() == 'private'){
                customer_details = {
                    first_name:     $first_name,
                    phone_number:   $phone_number
                }
            }
            if(authentication.getCustomerType() == 'business'){
                customer_details = {
                    phone_number:     $phone_number,
                    password:   $password
                }
            }
        }

        return customer_details;
    }

}]);