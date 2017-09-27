package com.jikezhiji.survey.rest.oss;

import com.aliyun.oss.OSSClient;
import com.aliyun.oss.model.CannedAccessControlList;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.PutObjectResult;
import com.jikezhiji.survey.rest.security.AbstractPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.util.Collections;
import java.util.Date;
import java.util.Map;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;

/**
 * Created by liusizuo on 2017/7/12.
 */
@RestController
@RequestMapping("/api")
public class UploadResource {
    private final AliyunOssProperties properties;

    @Autowired
    public UploadResource(final AliyunOssProperties properties) {
        this.properties = properties;
    }


    @PostMapping(value = "/upload", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> upload(@RequestPart("file") MultipartFile file, @RequestParam("name") String fileName, AbstractPrincipal principal) throws IOException {


        OSSClient ossClient = null;
        try{
            ossClient = new OSSClient(properties.getEndpoint(), properties.getAccessKeyId(), properties.getAccessKeySecret());

            InputStream inputStream = file.getInputStream();
            String fileKey = properties.getApplication() + "/" + fileName;

            ObjectMetadata meta = new ObjectMetadata();
            meta.setCacheControl("no-cache");
            meta.setHeader("Pragma", "no-cache");
            meta.setContentDisposition("inline;filename=" + fileName);
            meta.setContentType(getContentType(file.getOriginalFilename()));

            ossClient.putObject(properties.getBucket(), fileKey, inputStream, meta);
            ossClient.setObjectAcl(properties.getBucket(), fileKey, CannedAccessControlList.PublicRead);

            String url = ossClient.generatePresignedUrl(properties.getBucket(),fileKey,new Date()).toString();

            return Collections.singletonMap("url", url.substring(0,url.indexOf('?')));
        } finally {
            if(ossClient != null){
                ossClient.shutdown();
            }
        }

    }

    private static String getContentType(String fileName) {
        if(fileName.contains(".")){
            String ext = fileName.substring(fileName.lastIndexOf(".") + 1);
            if (ext.equalsIgnoreCase("bmp")) {
                return "image/bmp";
            }
            if (ext.equalsIgnoreCase("gif")) {
                return "image/gif";
            }
            if (ext.equalsIgnoreCase("jpeg") ||
                    ext.equalsIgnoreCase("jpg") ||
                    ext.equalsIgnoreCase("png")) {
                return "image/jpeg";
            }
            if (ext.equalsIgnoreCase("html")) {
                return "text/html";
            }
            if (ext.equalsIgnoreCase("txt")) {
                return "text/plain";
            }
            if (ext.equalsIgnoreCase("vsd")) {
                return "application/vnd.visio";
            }
            if (ext.equalsIgnoreCase("pptx") ||
                    ext.equalsIgnoreCase("ppt")) {
                return "application/vnd.ms-powerpoint";
            }
            if (ext.equalsIgnoreCase("docx") ||
                    ext.equalsIgnoreCase("doc")) {
                return "application/msword";
            }
            if (ext.equalsIgnoreCase("xml")) {
                return "text/xml";
            }
        }
        return "*/*";
    }

}
