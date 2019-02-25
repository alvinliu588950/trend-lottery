'use strict';
(function() {
  angular
    .module('TrenderlandLottery', [
      'ngAnimate',
      'ui.router'
    ]);

  angular.module('TrenderlandLottery')
    .config(routeConfig)
    .run(rootConfig)
    .constant('_', window._);

  /* @ngInject */
  function routeConfig(
    $stateProvider,
    $urlRouterProvider
  ) {
    $urlRouterProvider.otherwise('/enter');
    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'app/html/app.html',
        controller: 'AppController',
        controllerAs: 'vm',
        resolve: {
          images: imageResolver
        }
      })
      .state('app.enter', {
        url: '/enter',
        templateUrl: 'app/html/enter.html',
        controller: 'EnterController',
        controllerAs: 'vm'
      })
      .state('app.intro', {
        url: '/intro',
        templateUrl: 'app/html/intro.html',
        controller: 'IntroController',
        controllerAs: 'vm'
      })
      .state('app.lottery', {
        url: '/lottery',
        templateUrl: 'app/html/lottery.html',
        controller: 'LotteryController',
        controllerAs: 'vm'
      });
  }

  /* @ngInject */
  function imageResolver($q) {
    var imgs = [
      'images/bg0.jpg',
      'images/bg1.jpg',
      'images/title0.png',
      'images/title1.png',
      'images/title2.png',
      'images/title3.png',
      'images/money0.png',
      'images/money1.png',
      'images/money2.png',
      'images/money3.png',
      'images/money4.png'
    ];

    function loadImage(src) {
      var deferred = $q.defer();
      var $img = document.createElement('img');
      $img.onload = function() {
        console.debug('image loaded:', src);
        deferred.resolve();
      };
      $img.src = src;
      return deferred.promise;
    }
    return $q.all(imgs.map(loadImage));
  }

  /* @ngInject */
  function rootConfig($rootScope, _) {
    $rootScope._ = _;
  }
})();
