var nodegit = require('nodegit')
var promisify = require('promisify-node')
var fse = promisify(require('fs-extra'))
var path = require('path')
var config = require('../config')

const signature = nodegit.Signature.create(config.username, config.email, 123456789, 60)

function init() {
    return fse.pathExists(config.localtion).then(exists => {
        if (exists) {
            return nodegit.Repository.open(config.localtion)
        } else {
            return fse.ensureDir(config.localtion).then(() => {
                return nodegit.Clone(
                    config.git,
                    config.localtion, {
                        fetchOpts: {
                            callbacks: {
                                certificateCheck: function () {
                                    // github will fail cert check on some OSX machines
                                    // this overrides that check
                                    return 1;
                                }
                            }
                        }
                    }
                )
            })
        }
    })
}

function status(repo){
    return repo.getStatus().then(statuses => {
        function statusToObj(file){
            return {
                path:file.path(),
                isNew: !!file.isNew(),
                isModified: !!file.isModified(),
                isTypeChange: !!file.isTypechange(),
                isRenamed: !!file.isRenamed(),
                isIgnored: !!file.isIgnored()
            }
        }
        return statuses.map(statusToObj)
    })
}

function add(repo, files){
    return repo.refreshIndex().then(index=>{
        let handles = files.map( file=>{
            return index.addByPath(file)
        });
        return Promise.all(handles).then(()=>{
            return index.write()
        }).then(()=>{
            return index.writeTree()
        })
    })
}

function commit(repo, oid, msg){
    
    return repo.createCommit('HEAD', signature, signature, msg, oid, [])
}

module.exports = {
    init: init,
    status: status
}