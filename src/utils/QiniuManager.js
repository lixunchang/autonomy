const qiniu = require('qiniu');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const resolve = require('resolve');

class QiniuManager {
  constructor(accessKey, secretKey, bucket) {
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.config = new qiniu.conf.Config();
    this.config.zone = qiniu.zone.Zone_z0;
    this.bucket = bucket;
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
  }

  uploadFile(key, localFilePath) {
    const optioins = {
      scope: this.bucket + ':' + key, // 强制覆盖
    };
    const putPolicy = new qiniu.rs.PutPolicy(optioins);
    const uploadToken = putPolicy.uploadToken(this.mac);
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.putFile(
        uploadToken,
        key,
        localFilePath,
        putExtra,
        this.handleCallback(resolve, reject)
      );
    });
  }

  downloadFile(key, downlaodPath) {
    return this.generateDownloadLink(key).then((link) => {
      const timeStamp = moment().valueOf();
      const url = `${link}?timestamp=${timeStamp}`;
      return axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
        .then((response) => {
          const writer = fs.createWriteStream(downlaodPath);
          response.data.pipe(writer);
          return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
        })
        .catch((err) => {
          return Promise.reject({ err: err.response });
        });
    });
  }

  generateDownloadLink(key) {
    const domainPromise = this.publicBucketDomain
      ? Promise.resolve(this.publicBucketDomain)
      : this.getBucketDomain();
    return domainPromise.then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const pattern = /^http?/;
        this.publicBucketDomain = pattern.test(data[0])
          ? data[0]
          : `http://${data[0]}`;
        return this.bucketManager.publicDownloadUrl(
          this.publicBucketDomain,
          key
        );
      } else {
        throw Error('域名未找到，请查看储层空间是否已经过期');
      }
    });
  }

  getBucketDomain() {
    const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`;
    const digest = qiniu.util.generateAccessToken(this.mac, reqURL); //签名
    return new Promise((resolve, reject) => {
      qiniu.rpc.postWithoutForm(
        reqURL,
        digest,
        this.handleCallback(resolve, reject)
      );
    });
  }

  deleteFile(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(
        this.bucket,
        key,
        this.handleCallback(resolve, reject)
      );
    });
  }

  // 博客：高阶函数写法
  handleCallback(resolve, reject) {
    return (respErr, respBody, respInfo) => {
      if (respErr) {
        throw respErr;
      }
      if (respInfo.statusCode === 200) {
        console.log(respBody);
        resolve(respBody);
      } else {
        console.log(respInfo.statusCode, respBody);
        reject({
          statusCode: respInfo.statusCode,
          body: respBody,
        });
      }
    };
  }

  // 获取文件信息---是否需要更新
  getStat(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.stat(
        this.bucket,
        key,
        this.handleCallback(resolve, reject)
      );
    });
  }
}

module.exports = QiniuManager;
