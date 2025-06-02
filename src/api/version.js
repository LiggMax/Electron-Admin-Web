import axios from 'axios'

// 版本管理API
const versionApi = {
    // 设置默认的授权头
    setAuthHeader(key) {
        this.authKey = key
    },

    // 获取通用请求配置
    getConfig() {
        return {
            headers: {
                'Authorization': this.authKey || 'c18c6b5d-ad89-4e9e-9e45-211832' // 请替换为实际的授权key
            }
        }
    },

    // 判断是否需要分片上传 (超过10MB使用分片上传)
    shouldUseChunkUpload(fileSize) {
        return fileSize > 10 * 1024 * 1024 // 10MB
    },

    // 小文件上传 (≤10MB)
    uploadSmallFile(formData, onProgress) {
        return axios.post('/api/version/upload', formData, {
            ...this.getConfig(),
            headers: {
                ...this.getConfig().headers,
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: onProgress
        })
    },

    // 分片上传 (>10MB)
    uploadChunk(formData) {
        return axios.post('/api/version/chunk-upload', formData, {
            ...this.getConfig(),
            headers: {
                ...this.getConfig().headers,
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    // 查询上传进度
    getUploadProgress(identifier) {
        return axios.get(`/api/version/upload-progress/${identifier}`, this.getConfig())
    },

    // 取消上传
    cancelUpload(identifier) {
        return axios.delete(`/api/version/cancel-upload/${identifier}`, this.getConfig())
    },

    // 获取版本列表
    getVersionList(page = 1, size = 10) {
        return axios.get('/api/version/list', {
            ...this.getConfig(),
            params: {page, size}
        })
    }
}

export default versionApi 