import request from '@/utils/request'

export function getCategories() {
  return request.get('/api/categories')
}

export function getRelics(params = {}) {
  return request.get('/api/relics', { params })
}

export function getRelicsPage(params) {
  return request.get('/api/relics/page', { params })
}

export function searchRelics(params) {
  return request.get('/api/relics/search', { params })
}

export function imageSearchRelics(file, limit = 10) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/api/relics/image-search', formData, {
    params: { limit }
  })
}

export function getRelicDetail(id) {
  return request.get(`/api/relics/${id}`)
}

export function createRelic(data) {
  return request.post('/api/relics', data)
}

export function updateRelic(id, data) {
  return request.put(`/api/relics/${id}`, data)
}

export function deleteRelic(id) {
  return request.delete(`/api/relics/${id}`)
}

export function batchDeleteRelics(ids) {
  return request.delete('/api/relics/batch', { data: ids })
}

export function adminLogin(data) {
  return request.post('/api/admin/login', data)
}


/**
 * ??????
 * @param {File} file - ??????
 * @returns {Promise<{success: boolean, data: string, message: string}>}
 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/api/upload', formData)
}

