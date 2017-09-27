const path = require('path');
module.exports = {
    applyWebpack:function(webpack){
        webpack.externals = Object.assign({},webpack.externals,{"baidu-map": "BMap"});
        webpack.entry = path.resolve(process.cwd(), "src/ui/index.js");
    },
    applyDevServer : function (devServer) {
        let setup = devServer.setup;
        devServer.setup = function (app) {
            let applyServer = require(path.resolve(process.cwd(), "src/server/index.js"));
            setup(app);
            applyServer(app);
        }
    }
}