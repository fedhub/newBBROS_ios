var app = angular.module('myapp.library', [
    'myapp.services'
]);

app.controller('library', ['$scope', '$location', 'swiper', '$routeParams', 'library', 'cart', 'message', 'date', 'customer', function($scope, $location, swiper, $routeParams, library, cart, message, date, customer){

    //swiper.set_direction('right');
    //$scope.swipeRight = function(page){
    //    swiper.set_direction('right');
    //    $location.url(page);
    //};
    //$scope.swipeLeft = function(page){
    //    swiper.set_direction('left');
    //    $location.url(page);
    //};
    $('.spinner').css('display', 'none');
    var $info_lightbox = $('#cart-item-info');
    var $delete_lightbox = $('#delete-item');
    library.setIsLibrary(false);
    var lib = library.getLibrary();
    library_items_ajax($scope, message, lib, $location, swiper);
    $scope.add_to_library = function(){
        library.setIsLibrary(true);
        window.location = '#/menu-types';
    };
    $scope.info = function(item){
        $info_lightbox.fadeIn();
        $scope.comments = item.comments;
        $scope.item = item;
    };
    $scope.close_info = function(){
        $info_lightbox.fadeOut();
    };
    $scope.add_item_to_cart = function(item){
        cart.add(item);
        cart.updateTotalPrice(item.total_price);
        window.location = '#/cart';
    };
    $scope.delete_item = function(item_id){
        $delete_lightbox.fadeIn();
        $scope.item_id = item_id;
    };
    $scope.deletion_approved = function(item_id){
        var lib = library.getLibrary();
        var lib_id = lib.id;
        var phone_number = customer.getPhoneNumber();
        delete_item_ajax($scope, item_id, lib_id, phone_number, message);
        $delete_lightbox.fadeOut();
    };
    $scope.close_delete_window = function(){
        $delete_lightbox.fadeOut();
    };

}]);

function library_items_ajax($scope, message, lib, $location, swiper){
    $('.library-wrapper').css('display', 'none');
    $('.spinner').css('display', 'block');
    var url = base_url + '/library-items&library_id='+lib.id;
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(res == false){
            $('.spinner').css('display', 'none');
            message.showMessage('הייתה בעיה בהבאת הפריטים של הספרייה, אנא נסה שוב מאוחר יותר');
        }
        else{
            $scope.name = lib.lib_name;
            $scope.description = lib.lib_description;
            $scope.date = lib.creation_date;
            $scope.time = lib.creation_time;
            // API -- response from library_items (mobile_order_functions.js)
            //var library_item_info = {
            //    library_id: library.getLibraryID(),
            //    creation_date: date.getFullDate(),
            //    creation_time: date.getDefaultTime(),
            //    phone_number: customer.getPhoneNumber(),
            //    item_json: JSON.stringify(cart.getMyCart()) // 1 sized array
            //};
            if(res != 'empty'){
                var lib_items = [];
                for(var i = 0; i < res.length; i++){
                    res[i].item_json = JSON.parse(res[i].item_json);
                    lib_items.push(res[i]);
                }
                $scope.library = lib_items;
            }
            $scope.$apply();
        }
        $('.spinner').css('display', 'none');
        //if(swiper.get_direction() == 'right') $('.library-wrapper').addClass('slide-right');
        //if(swiper.get_direction() == 'left') $('.library-wrapper').addClass('slide-left');
        //$('.library-wrapper').bind('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {$('.library-wrapper').css('position','static'); swiper.set_direction('left')});
        //$('.library-wrapper').css('display', 'block');
    });
}

function delete_item_ajax($scope, item_id, lib_id, phone_number, message){
    var url = base_url + '/delete-from-library';
    var info = {
        id: item_id,
        library_id: lib_id,
        phone_number: phone_number
    };
    $.ajax({
        url: url,
        type: 'POST',
        data: {data: JSON.stringify(info)}
    }).done(function(res){
        if(res == false) message.showMessage('הייתה בעיה במחיקת הפריט מהספרייה, אנא נסה שוב מאוחר יותר');
        else{
            if(res != 'empty'){
                var lib_items = [];
                for(var i = 0; i < res.length; i++){
                    res[i].item_json = JSON.parse(res[i].item_json);
                    lib_items.push(res[i]);
                }
                $scope.library = lib_items;
                $scope.$apply();
            }
            else {
                $scope.library = [];
                $scope.$apply();
            }

        }
    });
}





//function print(my_cart){
//    console.log('My-cart: ');
//    for(var i = 0; i < my_cart.length; i++){
//        console.log('    id             : ' + my_cart[i].id);
//        console.log('    name           : ' + my_cart[i].name);
//        console.log('    description    : ' + my_cart[i].description);
//        console.log('    price          : ' + my_cart[i].price);
//        console.log('    total_price    : ' + my_cart[i].total_price);
//        console.log('    addition_types : ');
//        for(var j = 0; j < my_cart[i].addition_types.length; j++){
//            console.log('          id                : ' + my_cart[i].addition_types[j].id);
//            console.log('          name              : ' + my_cart[i].addition_types[j].name);
//            console.log('          description       : ' + my_cart[i].addition_types[j].description);
//            console.log('          selection_type    : ' + my_cart[i].addition_types[j].selection_type);
//            console.log('          selections_amount : ' + my_cart[i].addition_types[j].selections_amount);
//            console.log('          addition_items    : ');
//            for(var k = 0; k < my_cart[i].addition_types[j].addition_items.length; k++){
//                console.log('                id          : ' + my_cart[i].addition_types[j].addition_items[k].id);
//                console.log('                name        : ' + my_cart[i].addition_types[j].addition_items[k].name);
//                console.log('                description : ' + my_cart[i].addition_types[j].addition_items[k].description);
//                console.log('                image       : ' + my_cart[i].addition_types[j].addition_items[k].image);
//                console.log('                price       : ' + my_cart[i].addition_types[j].addition_items[k].price);
//            }
//        }
//    }
//}