app.controller('MainController', function ($scope, $http, RestService,
                                           $cookieStore, $mdSidenav,
                                           $filter, $mdDialog, $mdColorPalette) {
    $scope.colors = Object.keys($mdColorPalette);
    $scope.data = {subjects: {}, triples: {}};
    $scope.search = {};

    $scope.reload = function () {
        RestService.getTriples(0, 15).then(function (response) {
            $scope.data = response.data;
            console.log($scope.data)
        });
    };

    $scope.toggle = function () {
        $mdSidenav('sidebar').toggle();
    };
    $scope.reload();
});
