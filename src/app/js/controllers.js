'use strict';

(function() {
  angular
    .module('TrenderlandLottery')
    .controller('AppController', AppController)
    .controller('EnterController', EnterController)
    .controller('IntroController', IntroController)
    .controller('LotteryController', LotteryController);

  /* @ngInject */
  function AppController(
    $scope,
    _
  ) {
    var isFullScreen = false;
    var fullScreen = document.body.requestFullscreen ||
      document.body.msRequestFullscreen ||
      document.body.mozRequestFullScreen ||
      document.body.webkitRequestFullscreen ||
      _.noop;
    var exitfullScreen = document.exitFullscreen ||
      document.msExitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      _.noop;
    fullScreen = fullScreen.bind(document.body);
    exitfullScreen = exitfullScreen.bind(document);
    var vm = this;
    vm.bgClass = ['bg0', 'bg1'];
    vm.bg = 0;
    vm.viewStyle = {};
    vm.init = init;
    vm.resize = resize;

    vm.init();

    function init() {
      vm.resize();
      $scope.$on('bg', function(e, data) {
        vm.bg = data;
      });
      window.addEventListener('resize', function() {
        vm.resize();
        $scope.$apply();
      });
      window.addEventListener('keyup', function(e) {
        console.debug('keyup:', e.which);
        switch (e.which) {
          case 8:
            $scope.$broadcast('back');
            break;

          case 37: // left arr
            $scope.$broadcast('prev');
            break;

          case 32: // white space
          case 39: // right arr
            $scope.$broadcast('next');
            break;

          case 70: // f
            toggleFullScreen();
            break;

          default:
            break;
        }
        $scope.$apply();
      });
    }

    function resize() {
      var ws = window.innerWidth / 1024;
      var hs = window.innerHeight / 768;
      var scale = Math.min(ws, hs);
      vm.viewStyle.transform = 'scale(' + scale + ')';
    }

    function toggleFullScreen() {
      if (isFullScreen) {
        exitfullScreen();
      } else {
        fullScreen();
      }
      isFullScreen = !isFullScreen;
    }
  }

  /* @ngInject */
  function EnterController(
    $scope,
    $state
  ) {
    var NEXT_STATE = 'app.intro';
    var STATES = 1;
    var vm = this;
    vm.state = 0;
    vm.init = init;

    vm.init();

    function init() {
      $scope.$emit('bg', 0);
      $scope.$on('prev', function() {
        vm.state = Math.max(vm.state - 1, 0);
      });
      $scope.$on('next', function() {
        vm.state += 1;
        if (vm.state > STATES) { $state.go(NEXT_STATE); }
      });
    }
  }

  /* @ngInject */
  function IntroController(
    $scope,
    $state
  ) {
    var PREV_STATE = 'app.enter';
    var NEXT_STATE = 'app.lottery';
    var STATES = 1;
    var vm = this;
    vm.state = 0;
    vm.awards = [4, 2, 1, 2, 1];
    vm.init = init;

    vm.init();

    function init() {
      $scope.$emit('bg', 1);
      $scope.$on('prev', function() {
        vm.state = vm.state - 1;
        if (vm.state < 0) { $state.go(PREV_STATE); }
      });
      $scope.$on('next', function() {
        vm.state += 1;
        if (vm.state > STATES) { $state.go(NEXT_STATE); }
      });
    }
  }

  /* @ngInject */
  function LotteryController(
    $scope,
    $state,
    $timeout,
    _
  ) {
    var PREV_STATE = 'app.intro';
    var STATES = 2;
    var vm = this;
    vm.state = 0;
    vm.results = [[], []];
    vm.psids = _.range(10).map(function(i) {
      return {
        id: i,
        remain: 1
      };
    });
    vm.awards = [
      { money: 1888, remain: 4 },
      { money: 2088, remain: 2 },
      { money: 2288, remain: 1 },
      { money: 2688, remain: 2 },
      { money: 3088, remain: 1 },
    ];
    vm.awardMap = {
      1888: 0,
      2088: 1,
      2288: 2,
      2688: 3,
      3088: 4,
    };
    vm.current = {
      money: null,
      award: null,
    };
    vm.characters = [false, false];
    vm.flipIndex = -1;
    vm.init = init;
    vm.onAwardClick = onAwardClick;
    vm.onPsidClick = onPsidClick;
    vm.onResult = onResult;
    vm.onBack = onBack;

    vm.init();

    function init() {
      $scope.$emit('bg', 1);
      $scope.$on('prev', function() {
        vm.state = vm.state - 1;
        if (vm.state < 0) { $state.go(PREV_STATE); }
      });
      $scope.$on('next', function() {
        vm.state = Math.min(vm.state + 1, STATES);
      });
      $scope.$on('back', vm.onBack);
    }

    function onAwardClick(award) {
      if (vm.current.psid && vm.current.award) { return; }
      vm.current.award = award;
      vm.characters[0] = true;
      if (vm.current.psid && vm.current.award) {
        vm.onResult();
        // $timeout(vm.onResult, 2000);
      }
    }

    function onPsidClick(psid) {
      if (vm.current.psid && vm.current.award) { return; }
      vm.current.psid = psid;
      vm.characters[1] = true;
      if (vm.current.psid && vm.current.award) {
        vm.onResult();
        // $timeout(vm.onResult, 2000);
      }
    }

    function onResult() {
      var rid = vm.results[0].length >= 5 ? 1 : 0;
      vm.results[rid].push({
        id: vm.current.psid.id,
        money: vm.current.award.money,
      });

      $timeout(function() {
        vm.current.psid.remain -= 1;
        vm.current.award.remain -= 1;
        vm.current.psid = null;
        vm.current.award = null;
        vm.characters[0] = false;
        vm.characters[1] = false;

        if (vm.results[0].length === 5 && vm.results[1].length === 5) {
          var sorted = _.sortBy(vm.results[0].concat(vm.results[1]), 'id');
          sorted.forEach(function(result, i) {
            $timeout(function() {
              vm.results[i >= 5 ? 1 : 0][i % 5] = result;
              vm.flipIndex = i;
            }, 400 * i);
          });
        }
      }, 2000);
    }

    function onBack() {
      if (!vm.results[0].length && !vm.results[1].length) { return; }
      var rid = vm.results[1].length > 0 ? 1 : 0;
      var row = vm.results[rid].pop();
      _.find(vm.psids, { id: row.id }).remain += 1;
      _.find(vm.awards, { money: row.money }).remain += 1;
      console.log('onBack', row);
    }
  }
})();
