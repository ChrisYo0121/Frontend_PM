import http from './http'

export function fetchCourses() {
    return http.get('/courses')
}

export function getCourse(id) {
    return http.get(`/courses/${id}`)
}

export function createCourse(data) {
    return http.post('/courses', data)
}

export function updateCourse(id, data) {
    return http.put(`/courses/${id}`, data)
}

export function deleteCourse(id) {
    return http.delete(`/courses/${id}`)
}

export function fetchEnrollmentsByCourse(courseId) {
    return http.get(`/courses/${courseId}/enrollments`)

// export function updateCourseDescription(id, courseDescription) {
//     return http.patch(`/courses/${id}/description`, { courseDescription })
//     }
}
