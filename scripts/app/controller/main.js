app.controller('MainController', function ($scope, $http, RestService,
                                           $cookieStore, $mdSidenav, $timeout,
                                           $filter, $mdDialog, $mdColorPalette) {
    console.log(Object.keys($mdColorPalette))
    $scope.colors = {
        null: 'indigo',
        true: 'green',
        false: 'red'
    };

    $scope.data = {subjects: {}, triples: {}};
    $scope.params = {
        predicate: null,
        minOccurrence: 1,
        approved: null
    };

    $scope.toggle = function () {
        $mdSidenav('sidebar').toggle();
    };

    $scope.go = function (page) {
        $scope.page = page;
        $timeout(function () {
            RestService.getTriples(page, 20, $scope.params.predicate,
                $scope.params.minOccurrence, $scope.params.approved)
                .then(function (response) {
                    $scope.data = response.data;
                    for (var i = 0; i < $scope.data.content.length; i++)
                        $scope.data.content[i].toShow =
                            $scope.data.content[i].generalizedSentence
                                .replace('$SUBJ', '<b>' + $scope.data.content[i].subject + ' (SUBJ)</b>')
                                .replace('$OBJ', '<b>' + $scope.data.content[i].object + ' (OBJ)</b>');
                    console.log($scope.data)
                });
        }, 200);
    };

    $scope.switch = function (tab) {
        $scope.tab = tab;
    };

    $scope.vote = function (x, approved) {
        RestService.approve(x.id, approved)
            .then(function (response) {
                $scope.go($scope.page)
            });
    };

    $scope.switch('triples');
    $scope.go(0);
});
