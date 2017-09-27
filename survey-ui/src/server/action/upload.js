const express = require('express');
const multiparty = require('multiparty');
const fs = require('fs');
const router = express.Router();
const oss = require('ali-oss');
const {aliyunOssOptions} = require('../common')
const client = oss.Wrapper(aliyunOssOptions);

router.post('/',(req,res)=> {
    //生成multiparty对象，并配置上传目标路径
    let form = new multiparty.Form({
        maxFilesSize: 2 * 1024 * 1024
    });

    //上传完成后处理
    form.parse(req, callback);

    function callback(err, data, multipart) {
        if(err){
            res.send({error: err});
            return;
        }
        let result;
        let fileName = `survey/${data.name[0]}`;
        let filePath = multipart.file[0].path;

        function upload(){
            return client.put(fileName,filePath);
        }

        function setACL(resp) {
            result = resp;
            return client.putACL(fileName,'public-read');
        }

        function deleteTempAndSend() {
            fs.unlink(filePath);
            res.json({url:result.url});
        }

        upload().then(setACL).then(deleteTempAndSend);

    }
});

module.exports = router;
