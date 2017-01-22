var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var Q = require('q');
var csv = require('express-csv');
var multer = require('multer');
var fs = require('fs');
var json2csv = require('json2csv');

router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/', multer({ dest: 'uploads/' }).single('q'), function (req, res, next) {
    getProfiles(req.file)
        .then(filterResults)
        .then(saveToCSV(req.headers.host, res))
        .catch(function () {
            console.log(arguments);
            //next();
        });
});

module.exports = router;

var getProfiles = function(file) {
    var deferred = Q.defer();
    fs.readFile(file.path, function(err, data) {
        if (err) {
            deferred.reject(err);
        } else {
            var lines = data.toString().split("\n");
            deferred.resolve(
                Q.allSettled(lines.map(function (username) {
                    return rp('https://www.instagram.com/'+username+'/?__a=1');
                }))
            );
        }
    });
    return deferred.promise;
};

var filterResults = function(results) {
    var fulfilled = results.filter(function (result) {
        return result.state == "fulfilled";
    }).map(function (result) {
        return JSON.parse(result.value);
    });

    // var errors = results.filter(function (result) {
    //     return result.state !== "fulfilled";
    // });

    return Q.resolve(fulfilled);
};

var saveToCSV = function(hostname, res) {
    return function(data) {
        var csv = json2csv({ data: data.map(function(r) {
            return {
                username: r.user.username,
                followers: r.user.followed_by.count,
                is_private: r.user.is_private
            }
        }), fields: ['username', 'followers', 'is_private'] });
        var filename = 'public/results/response_'+new Date().toISOString()+'.csv';
        var url = 'http://' + hostname + filename.substr(6);
        fs.writeFile(filename, csv, function(err) {
            if (err) {
                return Q.reject(err);
            } else {
                res.redirect(url);
            }
        });
    };
};