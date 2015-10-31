var app = angular.module('myapp.header', [
    'myapp.services'
]);

app.controller('header', ['$scope', 'swiper', function($scope, swiper){

    $scope.title = 'ראשי';
    $scope.setTitle = function(title, pos){
        //if(pos < swiper.get_position()) swiper.set_direction('left');
        //else if(pos > swiper.get_position()) swiper.set_direction('right');
        //swiper.set_position(pos);
        //swiper.set_background(pos);
        $scope.title = title;
    };
    var $body = $('.body');
    var $mobile_menu_container = $('.mobile-menu-container');
    var $container = $('.hamburger .container');
    var transitionEnd = 'transitionend webkitTransitionEnd otransitionend MSTransitionEnd';
    var counter = 1;
    $scope.slideMenu = function(){
        if(counter % 2 == 1) {
            $('.blur').fadeIn();
            if($container.hasClass('rotate-left'))
                $container.removeClass('rotate-left');
            $container.toggleClass('rotate-right');
            counter = 0;
        }
        else {
            if(counter % 2 == 0) {
                if($container.hasClass('rotate-right'))
                    $container.removeClass('rotate-right');
                $container.toggleClass('rotate-left');
                counter = 1;
            }
        }
        $mobile_menu_container.toggleClass('right');
        $container.on(transitionEnd, function() {
            $container.off(transitionEnd);
        });
        $mobile_menu_container.on(transitionEnd, function(){
            $body.removeClass('right');
            $mobile_menu_container.off(transitionEnd);
        });
    };
    $('.blur').click(function(){
        if($container.hasClass('rotate-right'))
            $container.removeClass('rotate-right');
        $container.toggleClass('rotate-left');
        counter = 1;
        $mobile_menu_container.toggleClass('right');
        $('.blur').fadeOut();
    });

}]);