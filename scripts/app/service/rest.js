app.service('RestService', ['$http', function ($http) {
    var baseURl = 'http://dmls.iust.ac.ir:8100';
    // var baseURl = 'http://localhost:8100';

    var self = this;
    this.ingoing = 0;

    self.init = function (rootAddress) {
        baseURl = rootAddress;
    };

    function onerror(response) {
        loading.hide();
        self.ingoing--;
        console.log('error : ', response);
        return response;
    }

    function onsuccess(response) {
        loading.hide();
        self.ingoing--;
        return response;
    }

    function get(url, params, headers) {
        params = params || {};
        params.random = new Date().getTime();

        var req = {
            method: 'GET',
            url: url,
            headers: headers,
            params: params
        };

        self.ingoing++;
        loading.show();
        return $http(req).then(onsuccess, onerror);
    }

    function post(url, data, headers) {
        var req = {
            method: 'POST',
            url: url,
            headers: headers,
            data: data
        };

        self.ingoing++;
        loading.show();

        return $http(req).then(onsuccess, onerror);
        //return $http.post(url, data, headers).then(onsuccess, onerror);
    }

    this.getTriples = function (page, pageSize, predicate, minOccurrence, approved) {

        var url = baseURl + '/rest/v1/raw/search';
        var params = {
            page: page,
            pageSize: pageSize
        };

        if (!OUC.isEmpty(predicate)) params.predicate = predicate;
        if (!OUC.isEmpty(minOccurrence)) params.minOccurrence = minOccurrence;
        if (!OUC.isEmpty(approved)) params.approved = approved;

        return get(url, params);
    };

    this.approve = function (id, approved) {
        var url = baseURl + '/rest/v1/raw/approve';
        var params = {
            id: id,
            approved: approved
        };
        return get(url, params);
    };
}]);

var loading = {
    show: function () {
        $('#loading').remove();
        $('body').append('<div id="loading" class="loading"><span>در حال تبادل اطلاعات ...</span></div>');
        $('#loading').fadeIn();
    },
    hide: function () {
        $('#loading').fadeOut();
    }
};
