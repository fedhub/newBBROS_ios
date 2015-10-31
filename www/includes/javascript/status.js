var app = angular.module('myapp.status', [
    'myapp.services'
]);

//var myNewChart = null;
var myNewChart;
app.controller('status', ['$scope', '$location', 'authentication', 'message', 'customer', 'swiper', function($scope, $location, authentication, message, customer, swiper){

    myNewChart = null;
    $('.spinner').css('display', 'none');
    $('#header-title p').html('סטטוס הזמנה');
    //swiper.set_position(4);
    //swiper.set_background(4);
    //if(swiper.get_direction() == 'right') $('.status-wrapper').addClass('slide-right');
    //if(swiper.get_direction() == 'left') $('.status-wrapper').addClass('slide-left');
    //$('.status-wrapper').bind('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
    //    if(!authentication.isConnected()) $scope.form_request('log-in');
    //    else {
    //        socket_connect();
    //        apply_status(customer.getPhoneNumber(), $scope);
    //    }
    //});
    //$scope.swipeLeft = function(page){
    //    swiper.set_direction('left');
    //    $location.url(page);
    //};
    socket_connect();
    apply_status(customer.getPhoneNumber(), $scope);
    var connected = false;
    $scope.$on('got-connected', function(event) {
        connected = true;
    });
    $scope.$on('msg-done', function(event) {
        if(connected){
            socket_connect();
            apply_status(customer.getPhoneNumber(), $scope);
        }
    });
    function socket_connect(){
        var socket = io.connect(base_url,{
            'reconnect': true,
            'reconnection delay': 2000,
            'max reconnection attempts': 10
        });
        socket.on('update-status', function(data){
            if(data.phone_number == customer.getPhoneNumber()){
                set_status_data(data.new_status);
            }
        });
    }

}]);

function set_status_data(status_level){
    for(var i = 0; i < 4; i++){
        if(i < status_level){
            $('#'+(i+1)+' p').css('color', '#FFF');
            myNewChart.segments[i].fillColor = '#002E02';
            myNewChart.update();
        }
    }
}

function apply_status(phone_number, $scope){
    $('.spinner').css('display', 'block');
    var url = base_url + '/get-status&phone_number='+phone_number;
    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status){
            $('.spinner').css('display', 'none');
            alert(res.msg);
        }
        else{
            $('.spinner').css('display', 'none');
            var options = get_options();
            var data = get_data(res.status, $scope);
            var ctx = $("#myChart").get(0).getContext("2d");
            myNewChart = new Chart(ctx).Pie(data, options);
            if(res.status != -1){
                $scope.status_1 = res.status_text[0];
                $scope.status_2 = res.status_text[1];
                $scope.status_3 = res.status_text[2];
                $scope.status_4 = res.status_text[3];
                $scope.$apply();
            }
        }
    });
}

function get_options(){
    return {
        //Boolean - Show a backdrop to the scale label
        scaleShowLabelBackdrop: true,
        //String - The colour of the label backdrop
        scaleBackdropColor: "rgba(255,255,255,0.75)",
        // Boolean - Whether the scale should begin at zero
        scaleBeginAtZero: true,
        //Number - The backdrop padding above & below the label in pixels
        scaleBackdropPaddingY: 2,
        //Number - The backdrop padding to the side of the label in pixels
        scaleBackdropPaddingX: 2,
        //Boolean - Show line for each value in the scale
        scaleShowLine: true,
        //Boolean - Stroke a line around each segment in the chart
        segmentShowStroke: true,
        //String - The colour of the stroke on each segement.
        segmentStrokeColor: "#fff",
        //Number - The width of the stroke value in pixels
        segmentStrokeWidth: 2,
        //Number - Amount of animation steps
        animationSteps: 100,
        //String - Animation easing effect.
        animationEasing: "",
        //Boolean - Whether to animate the rotation of the chart
        animateRotate: false,
        //Boolean - Whether to animate scaling the chart from the centre
        animateScale: false,
        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
    };
}

function get_data(status_level, $scope){
    var data = [];
    var color = '';
    for(var i = 0; i < 4; i++){
        if(i < status_level){
            color = '#002E02';
            $('#'+(i+1)+' p').css('color', '#FFF');
        }
        else color = '#D8DDCD';
        data.push({value: 25, color: color});
    }
    return data;
}