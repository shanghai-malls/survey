const path = require('path');
module.exports = {
    applyWebpack:function(webpack){
        webpack.externals = Object.assign({},webpack.externals,{"baidu-map": "BMap"});

    },
    applyDevServer : function (devServer) {
        console.log(devServer);
        // devServer.proxy = {
        //     api: {
        //         target: "http://localhost:50000/",
        //         pathRewrite: {
        //             "^/api": "/api"
        //         }
        //     }
        // }
    }
}
