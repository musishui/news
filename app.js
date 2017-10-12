const Koa = require('koa')
const app = new Koa()
const gitHelper = require('./libs/gitHelper')

app.use(async (ctx) => {
    ctx.body = 'hello koa2'
})

app.listen(3000)
console.log('[demo] start-quick is starting at port 3000')

gitHelper.init().then(repo=>{
    gitHelper.status(repo).then(status=>{
        console.log(status)
    })
}).catch(err=>{
    console.log(err)
})