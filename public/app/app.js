(function(){
  //http://webframeworks.kr/tutorials/angularjs/angularjs_router/ 라우터 관련 설명.
  var edams = angular.module('edams', ['controllers','ui.router']);

  edams.config(function($stateProvider, $urlRouterProvider){
    //라우팅 - https://github.com/angular-ui/ui-router 참고.

    //정의되지 않은 url : 우선 이 페이지로 이동.
    $urlRouterProvider.otherwise("/login");

    $stateProvider.state('login', {
      url: "/login",
      views : {
        "body" : {
          templateUrl: "user/login",
          controller: "userCtrl"
        }
      }
    });

    $stateProvider.state('signin', {
      url: "/signin",
      views : {
        "body" : {
          templateUrl: "user/signin",
          controller: "userCtrl"
        }
      }
    });

  });

})();
