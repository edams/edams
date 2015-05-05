(function(){
  //http://webframeworks.kr/tutorials/angularjs/angularjs_router/ 라우터 관련 설명.
  var edams = angular.module('edams', ['controllers','ui.router']);

  edams.config(function($stateProvider, $urlRouterProvider){
    //라우팅 - https://github.com/angular-ui/ui-router 참고.
    $stateProvider.state('login', {
      url: "/login",
      views : {
        "user" : { templateUrl: "user/login" }
      }
    });

    $stateProvider.state('signin', {
      url: "/signin",
      views : {
        "user" : { templateUrl: "user/signin" }
      }
    });

    $stateProvider.state('main', {
      url: "/main",
      views : {
        "content" : { templateUrl: "body/main" },
        "nav" : { templateUrl: "nav/navbar" }
      }
    });

    $stateProvider.state('dashboard', {
      url: "/dashboard",
      views : {
        "content" : { templateUrl: "body/dashboard" },
        "nav" : {
          templateUrl: "nav/navbar",
          data : { menu_selected : "dashboard" }
        }
      }
    });


    //정의되지 않은 url : 우선 이 페이지로 이동.
    $urlRouterProvider.otherwise("/login");
  });

})();
