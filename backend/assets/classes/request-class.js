const db = require("../../models/db");
const errors = require('../requests-errors')

let Request = class Request {

    static getMemberRequests(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) return reject(errors.missing.userId)
            db.query("SELECT * FROM staff WHERE user_id = ?", [userId], (err, resultStaff) => {
                if (err) return reject(new Error(err.message))
                else {
                    db.query("SELECT * FROM partenaires WHERE user_id = ?", [userId], (err, resultPartner) => {
                        if (err) return reject(new Error(err.message))
                        else resolve({ jobs: resultStaff, partners: resultPartner })
                    })
                }
            })
        })
    }
    static getGenerals(page) {
        return new Promise((resolve, reject) => {
            if (!page) return reject(errors.missing.page)
            const skip = (page * 10) - 10;
            db.query("SELECT * FROM demandes LIMIT 10 OFFSET ?", [skip], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }
    static getJobs(page) {
        return new Promise((resolve, reject) => {
            if (!page) return reject(errors.missing.page)
            const skip = (page * 10) - 10;
            db.query("SELECT * FROM staff LIMIT 10 OFFSET ?", [skip], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }
    static getPartners(page) {
        return new Promise((resolve, reject) => {
            if (!page) return reject(errors.missing.page)
            const skip = (page * 10) - 10;
            db.query("SELECT * FROM partenaires LEFT JOIN members ON partenaires.user_id = members.member_id LIMIT 10 OFFSET ?", [skip], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }
    static getGeneral(requestId) {
        return new Promise((resolve, reject) => {
            if (!requestId) return reject(errors.missing.authorId)
            db.query("SELECT * FROM demandes WHERE id = ?", [requestId], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }
    static getJob(requestId) {
        return new Promise((resolve, reject) => {
            if (!requestId) return reject(errors.missing.requestId)
            db.query("SELECT * FROM staff WHERE id = ?", [requestId], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }
    static getPartner(requestId) {
        return new Promise((resolve, reject) => {
            if (!requestId) return reject(errors.missing.requestId)
            db.query("SELECT * FROM partenaires WHERE id = ?", [requestId], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }

    static postGeneral(name, email, message) {
        return new Promise((resolve, reject) => {
            if (!name) return reject(errors.missing.pseudo)
            if (!email) return reject(errors.missing.email)
            if (!message) return reject(errors.missing.q1)
            const time = Date.now()
            db.query("INSERT INTO demandes (`pseudo`, `mail`, `demande`, `statut`, `date_insert`) VALUES (?,?,?,?,?)", [name, email, message, 0, time], (err, result) => {
                if (err) return reject(err.message)
                else resolve(true)
            })
        })
    }
    static postPartner(pseudo, email, age, q1, q2, q3, q4, q5, q6, authorId) {
        return new Promise((resolve, reject) => {
            if (!pseudo) return reject(errors.missing.pseudo)
            if (!email) return reject(errors.missing.email)
            if (!age) return reject(errors.missing.age)
            if (!q1) return reject(errors.missing.q1)
            if (!q2) return reject(errors.missing.q2)
            if (!q3) return reject(errors.missing.q3)
            if (!q4) return reject(errors.missing.q4)
            if (!q5) return reject(errors.missing.q5)
            if (!q6) return reject(errors.missing.q6)
            if (!authorId) return reject(errors.missing.authorId)
            const time = Date.now()
            db.query("INSERT INTO `partenaires`(`user_id`,`pseudo`, `mail`, `majeur`, `q1`, `q2`, `q3`, `q4`, `q5`, `q6`, `statut`, `date_insert`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [authorId, pseudo, email, age, q1, q2, q3, q4, q5, q6, 0, time], (err, result) => {
                if (err) return reject(err.message)
                else resolve(true)
            })
        })
    }
    static postJob(q1, q2, q3, q4, q5, q6, authorId) {
        return new Promise((resolve, reject) => {
            if (!q1) return reject(errors.missing.q1)
            if (!q2) return reject(errors.missing.q2)
            if (!q3) return reject(errors.missing.q3)
            if (!q4) return reject(errors.missing.q4)
            if (!q5) return reject(errors.missing.q5)
            if (!q6) return reject(errors.missing.q6)
            if (!authorId) return reject(errors.missing.authorId)
            const time = Date.now()
            db.query("INSERT INTO `staff`(`user_id`, `q1`, `q2`, `q3`, `q4`, `q5`, `q6`, `statut`, `date_insert`) VALUES (?,?,?,?,?,?,?,?,?)", [authorId, q1, q2, q3, q4, q5, q6, 0, time], (err, result) => {
                if (err) return reject(err.message)
                else resolve(true)
            })
        })

    }
    static updateGeneral(requestId, statut) {
        return new Promise((resolve, reject) => {
            if (!requestId) return reject(errors.missing.authorId)
            db.query("UPDATE demandes SET statut = ? WHERE id = ?", [statut, requestId], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }
    static updateJob(requestId, statut) {
        return new Promise((resolve, reject) => {
            if (!requestId) return reject(errors.missing.authorId)
            db.query("UPDATE staff SET statut = ? WHERE id = ?", [statut, requestId], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }
    static updatePartner(requestId, statut) {
        return new Promise((resolve, reject) => {
            if (!requestId) return reject(errors.missing.authorId)
            db.query("UPDATE partenaires SET statut = ? WHERE id = ?", [statut, requestId], (err, result) => {
                if (err) return reject(new Error(err.message))
                else resolve(result)
            })
        })
    }

}


module.exports = Request
