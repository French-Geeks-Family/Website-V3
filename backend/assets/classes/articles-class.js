const dbFunctions = require("../../models/articles");
const db = require('../../models/db')
const xss = require('xss')
const errors = require('../articles-errors');
let Articles = class Articles {

    static getAllByMemberId(id) {
        return new Promise((next, reject) => {
            if (!id) return reject(errors.missing.userId)
            dbFunctions.getAllByMemberId(id)
                .then((result) => {
                    if (result) next(result)
                    else return reject(errors.noArticleFound)
                })
                .catch(error => { return reject(new Error(error)) })
        })
    }
    static getLastsArticles(limit) {
        return new Promise((next, reject) => {
            if (!limit) return reject(errors.missing.limit)
            dbFunctions.getLastsArticles(limit)
                .then((result) => {
                    if (result) next(result)
                    else return reject(errors.noArticleFound)
                })
                .catch(error => { return reject(new Error(error)) })
        })
    }
    static getRandom(userId) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM members WHERE (member_youtube != "" OR member_twitch != "") AND member_media_title != "" AND member_media_desc != "" AND member_media_image != "" ORDER BY RAND() LIMIT 1', (err, result) => {
                if (err) return reject(new Error(err))
                else {
                    if (result.length) {
                        const authorId = result[0].member_id
                        const title = result[0].member_media_title
                        const categorie = 7
                        const intro = `Cette semaine, nous avons décider de vous parler des réseaux sociaux de ${result[0].member_pseudo}. Chaque semaine un créateur est tirée au sort pour etre mis en avant dans un article du site.`
                        const content = result[0].member_media_desc
                        const miniature = result[0].member_media_image
                        const statut = 0
                        const time = Date.now()
                        db.query("INSERT INTO articles (`author_id`, `title`, `categorie`, `intro`, `content`, `lien_miniature`, `status`, `date_insert`) VALUES (?,?,?,?,?,?,?,?)", [authorId, title, categorie, intro, content, miniature, statut, time], (err, result) => {
                            if (err) return reject(new Error(err))
                            else resolve(true)
                        })
                    } else return reject(new Error('no result found'))
                }
            })
        })
    }
    static getArticles(page) {
        return new Promise((next, reject) => {
            if (!page) return reject(errors.missing.page)
            const pageNumber = parseInt(page)
            if (typeof pageNumber !== 'number') return reject(errors.missing)
            const skip = (pageNumber * 6) - 6;
            if (skip === 'NaN') return reject(errors.badTypeof.pageNumber)
            db.query('SELECT * FROM articles WHERE status = 1 ORDER BY date_insert DESC LIMIT 6 OFFSET ?', [skip], (err, result) => {
                if (err) return reject(new Error(err.message))
                else next(result)
            })

        })

    }

    static getArticle(articleId) {
        return new Promise((next, reject) => {
            if (!articleId) return reject(errors.missing.articleId)
            dbFunctions.getArticle(articleId)
                .then((result) => {
                    if (result) next(result)
                    else return reject(errors.noArticleFound)
                })
                .catch(error => { return reject(new Error(error)) })
        })
    }

    static getAll(page) {
        return new Promise((resolve, reject) => {
            if (!page) return reject(errors.missing.page)
            const skip = (page * 5) - 5
            dbFunctions.getAllArticles(skip)
                .then((result) => resolve(result))
                .catch((err) => { return reject(new Error(err)) })
        })
    }
    static searchArticles(search) {
        return new Promise((resolve, reject) => {
            if (!search) return reject(errors.missing.search)
            dbFunctions.searchArticles(search)
                .then((result) => resolve(result))
                .catch((err) => { return reject(new Error(err)) })
        })
    }

    static add(categorie, title, miniature, intro, content, authorId) {
        return new Promise(async (next, reject) => {
            if (!categorie || categorie && categorie.trim() == '') return reject(errors.missing.categorie)
            if (!title || title && title.trim() == '') return reject(errors.missing.title)
            if (!miniature || miniature && miniature.trim() == '') return reject(errors.missing.miniature)
            if (!content || content && content.trim() == '') return reject(errors.missing.content)
            if (!intro || intro && intro.trim() == '') return reject(errors.missing.intro)
            if (!authorId) return reject(errors.missing.author)

            if (categorie && categorie.length > 250) return reject(errors.size.tooLong.categorie)
            if (title && title.length > 150) return reject(errors.size.tooLong.title)
            if (miniature && miniature.length > 250) return reject(errors.size.tooLong.miniature)
            if (content && content.length > 60000) return reject(errors.size.tooLong.content)
            if (intro && intro.length > 250) return reject(errors.size.tooLong.intro)
            if (authorId && authorId.length > 250) return reject(errors.size.tooLong.authorId)
            content = xss(content, {
                onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
                    if (name + '=' + value === "id=img-article") {
                        return name.substring(0) + '="' + xss.escapeAttrValue(value) + '"';
                    }
                }
            })
            dbFunctions.isUniqueTitle(title)
                .then(result => {
                    if (!result) return reject(errors.titleAlreadyTaken)
                    const article = {
                        categorie: categorie,
                        title: title,
                        miniature: miniature,
                        intro: intro,
                        content: content,
                        authorId: authorId,
                        status: 0,
                        timestamp: Date.now()
                    }
                    dbFunctions.addArticle(article)
                        .then(result => next(article))
                        .catch(error => { return reject(new Error(error)) })
                })
                .catch(error => { return reject(new Error(error)) })
        })
    }

    static put(userId, articleId, categorie, title, miniature, intro, content, status) {
        return new Promise(async (next, reject) => {
            if (!articleId) return reject(errors.missing.articleId)
            if (!userId) return reject(errors.missing.userId)
            if (!categorie || categorie && categorie.trim() == '') return reject(errors.missing.categorie)
            if (!title || title && title.trim() == '') return reject(errors.missing.title)
            if (!content || content && content.trim() == '') return reject(errors.missing.content)
            if (!intro || intro && intro.trim() == '') return reject(errors.missing.intro)

            if (categorie && categorie.length > 50) return reject(errors.size.tooLong.categorie)
            if (title && title.length > 150) return reject(errors.size.tooLong.title)
            if (content && content.length > 60000) return reject(errors.size.tooLong.content)
            if (intro && intro.length > 250) return reject(errors.size.tooLong.intro)
            if (miniature && miniature.length > 250) return reject(errors.size.tooLong.miniature)
            if (status && status.length > 2) return reject(errors.size.tooLong.statut)

            content = xss(content, {
                onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
                    if (name + '=' + value === "id=img-article") {
                        return name.substring(0) + '="' + xss.escapeAttrValue(value) + '"';
                    }
                }
            })
            dbFunctions.getArticle(articleId).then(async article => {
                if (article) {
                    if (!miniature) miniature = article.lien_miniature
                    const newArticle = {
                        categorie: categorie,
                        title: title,
                        miniature: miniature,
                        intro: intro,
                        content: content,
                        status: status
                    }
                    dbFunctions.updateArticle(article.id, newArticle)
                        .then(() => next(newArticle))
                        .catch(error => { return reject(new Error(error)) })
                } else return reject(errors.missing.articleId);
            })
        })
    }

    static delete(id) {
        return new Promise((next, reject) => {
            if (!id) return reject(errors.missing.articleId);
            dbFunctions.deleteArticle(id)
                .then(() => next(true))
                .catch((err) => { return reject(new Error(err)) })
        })
    }
}


module.exports = Articles
