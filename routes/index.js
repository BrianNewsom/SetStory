var api_v1 = require('./api/v1')
var api_v2 = require('./api/v2')

module.exports = function (app) {

    // All requests to http://setstory.io go here

    app.use('/', function(req, res, next) {
        res.render('index', { title: 'Express' });
    });

    // All request to /api routes get passed to respective api version

    app.use('/api/v1',      api_v1 );
    app.use('/api/v2',      api_v2 );

    // For backwards compatibility with Setstory Angular app

    app.use('/api',         api_v1 );


}