var app = angular.module('myapp.home', [
    'myapp.services'
]);

app.controller('home', ['$scope', '$location', 'authentication', 'user_session', 'customer', 'swiper', function($scope, $location, authentication, user_session, customer, swiper){

    //swiper.set_position(1);
    //swiper.set_background(1);
    //if(swiper.get_direction() == 'right') $('.options-cont').addClass('slide-right');
    //if(swiper.get_direction() == 'left') $('.options-cont').addClass('slide-left');
    //$scope.swipeRight = function(page){
    //    swiper.set_direction('right');
    //    $location.url(page);
    //};
    $('#header-title p').html('ראשי');
    $('.spinner').css('display', 'none');
    if(user_session.isConnected() && user_session.getSessionCounter() == 0) user_session.setUser();

    $scope.last_orders = function(){
        //swiper.set_direction('right');
        if(!authentication.isConnected()) $scope.form_request('log-in');
        else window.location = '#/last-orders';
    };

    $scope.make_new_order = function(){
        //swiper.set_direction('right');
        window.location = '#/menu-types'
    };

    $scope.orders_library = function(){
        if(!authentication.isConnected()) $scope.form_request('log-in');
        else window.location = '#/orders-library';
    };

}]);