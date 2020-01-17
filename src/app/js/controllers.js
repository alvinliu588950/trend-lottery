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
    vm.awards = [7, 2, 1];
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
    var STATES = 0;
    var vm = this;
    vm.state = 0;
    vm.results = [{
      0: { psid: 0, balls: 1, award: null},
      1: { psid: 1, balls: 1, award: null},
      2: { psid: 2, balls: 1, award: null},
      3: { psid: 3, balls: 1, award: null},
      4: { psid: 4, balls: 1, award: null},
    }, {
      5: { psid: 5, balls: 1, award: null},
      6: { psid: 6, balls: 1, award: null},
      7: { psid: 7, balls: 1, award: null},
      8: { psid: 8, balls: 1, award: null},
      9: { psid: 9, balls: 1, award: null},
    }];
    vm.psids = _.range(10).map(function(i) {
      return {
        id: i,
        remain: 1
      };
    });

    // vm.awards = [
    //   { money: 2288, remain: 7 },
    //   { money: 2688, remain: 2 },
    //   { money: 3088, remain: 1 },
    // ];
  
    vm.awards = {
      1: {
        img: 2,
        money: 2288,
        remain: 7
      },
      2: {
        img: 3,
        money: 2688,
        remain: 2
      },
      3: {
        img: 4,
        money: 3088,
        remain: 1
      },
    };
    vm.current = {
      money: null,
      award: null,
      ball: false,
    };
    vm.characters = [false, false, false];
    vm.flipIndex = -1;
    vm.init = init;
    vm.getRid = getRid;
    vm.onAwardClick = onAwardClick;
    vm.onPsidClick = onPsidClick;
    vm.onResult = onResult;
    vm.onBack = onBack;
    vm.onAddBall = onAddBall;
    vm.onRemoveBall = onRemoveBall;
    vm.onUndoResult = onUndoResult;

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

    function onAwardClick(awardKey) {
      if (vm.current.psid && vm.current.award) { return; }
      vm.current.award = awardKey;
      vm.characters[0] = true;
      if (vm.current.psid && vm.current.award) {
        vm.onResult();
        // $timeout(vm.onResult, 2000);
      }
    }

    function onAddBall(psid) {
      var rid = vm.getRid(psid);
      vm.results[rid][psid].balls += 1;
      vm.current.psid = vm.psids[psid];
      vm.current.ball = true;
      vm.characters[1] = true;
      vm.characters[2] = true;

      $timeout(function() {
        vm.current.psid = null;
        vm.current.ball = false;
        vm.characters[1] = false;
        vm.characters[2] = false;
      }, 2000);
      return;
    }

    function onRemoveBall(psid) {
      var rid = vm.getRid(psid);
      if (vm.results[rid][psid].balls > 1) {
        vm.results[rid][psid].balls -= 1;
      }
      return;
    }

    function getRid(psid) {
      return psid > 4 ? 1 : 0;
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
      var rid = getRid(vm.current.psid.id);
      vm.results[rid][vm.current.psid.id].award = vm.current.award;

      $timeout(function() {
        vm.current.psid.remain -= 1;
        vm.awards[vm.current.award].remain -= 1;
        vm.current.psid = null;
        vm.current.award = null;
        vm.characters[0] = false;
        vm.characters[1] = false;
        if (vm.awards[2].remain <= 0 && vm.awards[3].remain <= 0) {
          vm.results.forEach(function(result) {
            Object.keys(result).forEach(function(key) {
              if (result[key].award === null) {
                result[key].award = 1;
                vm.awards[1].remain -= 1;
                vm.psids[key].remain -= 1;
              }
            });
          });
        }
      }, 2000);
    }

    function onUndoResult(psid) {
      var rid = getRid(psid);
      vm.awards[vm.results[rid][psid].award].remain += 1;
      vm.psids[psid].remain += 1;
      vm.results[rid][psid].award = null;
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
