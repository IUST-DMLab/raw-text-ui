app.controller('MainController', function ($scope, $http, RestService,
                                           $cookieStore, $mdSidenav, $timeout,
                                           $filter, $mdDialog, $mdColorPalette) {
    console.log(Object.keys($mdColorPalette))
    $scope.colors = {
        null: 'indigo',
        true: 'green',
        false: 'red'
    };

    $scope.params = {
        predicate: null,
        minOccurrence: null,
        approved: null
    };

    $scope.toggle = function () {
        $mdSidenav('sidebar').toggle();
    };

    $scope.go = function (page) {
        $scope.page = page - 1;
        $timeout(function () {
            RestService.getTriples(page - 1, 20, $scope.params.predicate,
                $scope.params.minOccurrence, $scope.params.approved, $scope.params.assignee)
                .then(function (response) {
                    $scope.data = response.data;
                    $scope.data.pageNo = $scope.data.number + 1;
                    for (var i = 0; i < $scope.data.content.length; i++)
                        $scope.data.content[i].toShow =
                            $scope.data.content[i].generalizedSentence
                                .replace('$SUBJ', '<b>' + $scope.data.content[i].subject + ' (SUBJ)</b>')
                                .replace('$OBJ', '<b>' + $scope.data.content[i].object + ' (OBJ)</b>');
                    console.log($scope.data)
                });
        }, 200);
    };

    $scope.getUsers = function () {
        RestService.listUsers()
            .then(function (response) {
                $scope.users = response.data;
                console.log($scope.data)
            });
    };

    $scope.assign = function (switchSearch, assignee, predicate, count) {
        RestService.assign(assignee, predicate, count)
            .then(function (response) {
                if (switchSearch) {
                    $scope.params.predicate = predicate;
                    $scope.params.assignee = assignee;
                    $scope.go(1);
                }
            });
    };

    $scope.switch = function (tab) {
        $scope.tab = tab;
        if (tab === 'triples') {
            $scope.getUsers();
            $scope.go(1);
        }
        else $scope.getRules();
    };

    $scope.vote = function (x, approved) {
        RestService.approve(x.id, approved)
            .then(function (response) {
                $scope.go($scope.page)
            });
    };

    $scope.rulesOptions = {
        selected: null,
        text: 'هادی ساعی در شهر ری متولد شد.'
    };

    $scope.getRules = function () {
        RestService.rules()
            .then(function (response) {
                $scope.rules = response.data.content
            });
    };

    $scope.newRule = function () {
        $scope.rulesOptions.selected = {
            id: null,
            rule: '',
            approved: false
        }
    };

    $scope.editRule = function () {
        if (!OUC.isEmpty($scope.rulesOptions.selected))
            RestService.editRule($scope.rulesOptions.selected)
                .then(function (response) {
                    if ($scope.rulesOptions.selected.id === null)
                        $scope.getRules();
                    $scope.rulesOptions.selected.id = response.data.id;
                });
    };

    $scope.removeRule = function () {
        if (!OUC.isEmpty($scope.rulesOptions.selected))
            RestService.removeRule($scope.rulesOptions.selected.id)
                .then(function (response) {
                    $scope.getRules();
                });
    };

    $scope.ruleTest = function () {
        var data = {
            "predicates": [],
            "rules": [],
            "text": $scope.rulesOptions.text
        };
        for (var i = 0; i < $scope.rules.length; i++)
            if ($scope.rules[i].approved) data.rules.push({
                rule: $scope.rules[i].rule,
                predicate: $scope.rules[i].predicate
            });
        RestService.ruleTest(data)
            .then(function (response) {
                $scope.resultRules = JSON.stringify(response.data, null, 2);
            });
    };

    $scope.switch('triples');
    // $scope.switch('rules');
});
