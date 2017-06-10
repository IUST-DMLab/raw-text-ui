app.controller('MainController', function ($scope, $http, RestService,
                                           $cookieStore, $mdSidenav, $timeout,
                                           $filter, $mdDialog, $mdToast, $mdColorPalette) {
    $scope.colors = {
        null: 'indigo',
        true: 'green',
        false: 'red'
    };

    $scope.params = {
        predicate: null,
        minOccurrence: null,
        approved: null,
        selectedTab: 0
    };

    $scope.cardSearch = {
        page: 1
    };

    $scope.predicateSearch = {
        page: 1,
        predicate: null
    };

    $scope.patternSearch = {
        page: 1
    };

    $scope.toggle = function () {
        $mdSidenav('sidebar').toggle();
    };

    $scope.go = function (page) {
        $scope.cardSearch.page = page - 1;
        $timeout(function () {
            RestService.getTriples(page - 1, 20, $scope.params.predicate, !$scope.params.exact,
                $scope.params.minOccurrence, $scope.params.approved, $scope.params.assignee)
                .then(function (response) {
                    $scope.data = response.data.page;
                    $scope.numberOfApproved = response.data.numberOfApproved;
                    $scope.numberOfRejected = response.data.numberOfRejected;
                    $scope.data.pageNo = $scope.data.number + 1;
                    for (var i = 0; i < $scope.data.content.length; i++)
                        $scope.data.content[i].toShow =
                            $scope.data.content[i].generalizedSentence
                                .replace('$SUBJ', '<span class="subject">' + $scope.data.content[i].subject + ' :S</span>')
                                .replace('$OBJ', '<span class="object">' + $scope.data.content[i].object + ' :O</span>');
                    console.log($scope.data)
                });
        }, 200);
    };

    $scope.goPredicates = function (page) {
        $scope.predicateSearch.page = page - 1;
        RestService.goPredicates(page - 1, 50, $scope.predicateSearch.predicate)
            .then(function (response) {
                $scope.predicates = response.data;
                $scope.predicates.pageNo = $scope.predicates.number + 1;
            });
    };

    $scope.assigneeCount = function (index) {
        RestService.assigneeCount($scope.predicates.content[index].predicate)
            .then(function (response) {
                $scope.predicates.content[index].assignees = response.data;
            });
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
                var message = "";
                if (response.data > 0) {
                    $scope.go($scope.cardSearch.page + 1);
                    message = "تعداد " + response.data + " کارت جدید به کاربر اختصاص پیدا کرد.";

                    if (switchSearch) {
                        $scope.params.st = 0;
                        $scope.params.predicate = predicate;
                        $scope.params.assignee = assignee;
                        $scope.params.exact = true;
                        $scope.go(1);
                    }
                } else {
                    message = "هیچ کارتی به کاربر اختصاص پیدا نکرد.";
                }
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(message)
                        .position("top")
                        .hideDelay(3000)
                );
            });
    };

    $scope.switch = function (tab) {
        $scope.tab = tab;
        if (tab === 'triples') {
            $scope.getUsers();
            $scope.go(1);
        }
        else if (tab === 'triples') $scope.getRules();
        else $scope.goPatterns(1)
    };

    $scope.vote = function (x, approved) {
        RestService.approve(x.id, approved)
            .then(function (response) {
                $scope.go($scope.cardSearch.page + 1);
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

    $scope.goPatterns = function (page, callback) {
        $scope.patternSearch.page = page - 1;
        RestService.goPatterns(page - 1, 20)
            .then(function (response) {
                $scope.patterns = response.data;
                $scope.patterns.pageNo = $scope.patterns.number + 1;
                if (callback !== undefined) callback();
            });
    };

    $scope.editPattern = function (index, data) {
        $scope.currentPattern = {
            index: index,
            data: data
        };
        $scope.params.st = 1;
        RestService.dependencyParse(data.samples[0])
            .then(function (response) {
                $scope.currentPattern.dependencyTree = response.data;
                var conll = "";
                var s = "";
                var sentence = response.data;
                for (var j = 0; j < sentence.length; j++) {
                    var word = sentence[j];
                    var pos = tagDict[word.pos];
                    if (pos === undefined) pos = word.pos;
                    conll += (word.position + "\t" + word.word + "\t" + word.lemma + "\t" + word.cPOS
                    + "\t" + word.pos + "\t" + word.features + "\t" + (word.head == -1 ? '0' : word.head)
                    + "\t" + word.relation + "\t-\t-\n");
                    s += (word.word + " ");
                }
                $scope.currentPattern.dependencyTreeConll = conll;
                var svg = document.getElementById('sample-dep-tree');
                window.drawTree(svg, conll);
            });
    };

    $scope.nextPattern = function () {
        if ($scope.currentPattern.index === 19) {
            if ($scope.patterns.pageNo < $scope.patterns.totalPages) {
                $scope.goPatterns($scope.patterns.pageNo + 1, function () {
                    $scope.editPattern(0, $scope.patterns.content[0]);
                });
            }
        } else $scope.editPattern($scope.currentPattern.index + 1,
            $scope.patterns.content[$scope.currentPattern.index + 1]);
    };

    $scope.previousPattern = function () {
        if ($scope.currentPattern.index === 0) {
            if ($scope.patterns.pageNo > 1) {
                $scope.goPatterns($scope.patterns.pageNo - 1, function () {
                    $scope.editPattern(19, $scope.patterns.content[19]);
                });
            }
        } else $scope.editPattern($scope.currentPattern.index - 1,
            $scope.patterns.content[$scope.currentPattern.index - 1]);
    };

    $scope.savePattern = function () {

    };

    $scope.switch('patterns');
    // $scope.switch('triples');
    // $scope.switch('rules');
});
