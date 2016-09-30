angular.module('app.controller.default', ['as.sortable', 'angular-sortable-view', 'ngMaterial'])
    .config(['$mdIconProvider', function($mdIconProvider) {
        $mdIconProvider.
        defaultFontSet('material-icons')
        ;
    }])
    .controller('DefaultCtrl', ['$scope', '$http', '$mdDialog', '$mdToast', function ($scope, $http, $mdModal, $mdToast) {
        $scope.assets = [];
        $scope.content = [];
        $scope.resource = '';
        $scope.pageCache = {};
        $scope.querying = false;

        $scope.dragAssetsOptions = {
            clone: true
        };

        $scope.dragContentOptions = {
            allowDuplicates: true,
            longTouch: true
        };

        this.getResource = function() {
            if ($scope.resource.length > 0 && !$scope.pageCache[$scope.resource]) {
                jsonld = getJSONLD.bind(this, $scope.resource);
                if (!$scope.pageCache[$scope.resource]) {
                    $scope.pageCache[$scope.resource] = true;
                    $scope.querying = true;
                    jsonld();
                }
                /* This is for later, may need the original HTML
                $http.get($scope.resource).then(function(response) {
                    $scope.pageCache[$scope.resource] = response.data;
                    jsonld();
                }, function() {
                    $mdToast.showSimple('Failed to load the resource.');
                    jsonld();
                });

                */
            }
        };

        var getJSONLD = function(url) {
            $http.get('http://service.oerschema.org/?q=' + url).then(success.bind(this, url), fail);
        };

        var processCache = function(url, data) {
            var cache = {};

            var processData = function(d) {
                var item = {};

                // Get the item's type
                if (!d['@type']) {
                    var rel = cache[d['@id']];
                    if (!rel || !rel['@type']) {
                        return false;
                    }

                    d['@type'] = cache[d['@id']]['@type'];
                }

                item.type = d['@type'] && d['@type'][0].replace(/^https?:\/\/(oer)?schema\.org\//, '');

                for (n in d) {

                    if (n == '@type') {
                        item.type = d[n][0].replace(/^https?:\/\/(oer)?schema\.org\//, '');
                    }

                    if (/^@/.test(n)) {
                        continue;
                    }

                    if (/^https?:\/\/(oer)?schema\.org\//.test(n)) {
                        var prop = n.replace(/^https?:\/\/(oer)?schema\.org\//, '');

                        if (['name', 'title', 'headline'].indexOf(prop) > -1 && !item.title && !!d[n][0]['@value']) {
                            item.title = d[n][0]['@value'].trim();
                        } else if (['text', 'description'].indexOf(prop) > -1 && !!d[n][0]['@value']) {
                            if (!item.content) {
                                item.content = [];
                            }
                            item.content.push(d[n][0]['@value'].replace(/\s\B/g, '').trim());
                        } else {
                            for (var j = 0; j < d[n].length; j++) {
                                if (d[n][j]['@value']) {
                                    if (!item[prop]) {
                                        item[prop] = [];
                                    }
                                    item[prop].push(d[n][j]['@value']);
                                }
                                processData(d[n][j]);
                            }
                        }
                    }
                }

                if (!!d['@value']) {
                    item.value = d['@value'];
                } else if (item.type == 'ImageObject') {
                    if (!item.title) { item.title = d['@id'].match(/[^\/]+$/)[0]; }
                    if (!item.image) { item.image = item.contentUrl && item.contentUrl[0] || d['@id'] };
                }
                /* For later use, once I get around CORS issues
                else if (/#.*$/.test(d['@id']) && !!$scope.pageCache[url]) {
                    var res = d['@id'].replace(/^[^#]+/, '');
                    var subdoc = document.createElement("div");
                    subdoc.innerHTML = $scope.pageCache[url];
                    item.value = subdoc.querySelector('[resource="' + res + '"]').innerHTML;
                }
                */

                if (!!item.content || !!item.image) {
                    item.weight = Object.keys($scope.assets).length;
                    $scope.assets.push(item);
                }
            };

            for (var i = 0; i < data.length; i++) {
                if (!data[i]['@id']) {
                    continue;
                }

                cache[data[i]['@id']] = data[i];
            }

            for (var n in cache) {
                processData(cache[n]);
            }
        };

        var success = function (url, response) {
            var data = response.data;
            processCache(url, data);

            $scope.querying = false;
            $scope.resource = '';
        };

        var fail = function(response) {
            $mdToast.showSimple(response.data.error || response.statusText);
        };
    }])
;