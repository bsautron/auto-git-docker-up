const { exec } = require('child_process');
const basePath = '/home/bruno'
const { chdir } = require('process');
const express = require('express')

const promiseExec = cmd => {
    console.log(`$ ${cmd}`)
    return new Promise((res, rej) => {
        exec(cmd, (err, stdout, stderr) => {
            console.log('err:', err) /* dump variable */
            console.log('stderr:', stderr) /* dump variable */
            console.log('stdout:', stdout) /* dump variable */
            console.log('')
            if (err) return rej(err)
            return res(stdout)
        })

    })
}

function cdToProject(projectName) {
    return new Promise((res, rej) => {
        try {
            chdir(`${basePath}/${projectName}`)
            res()
        } catch (err) {
            rej(err)
        }
    })
}

function execGitPull(remoteName, branchName) {
    return promiseExec(`git pull ${remoteName} ${branchName}`)
}
function execDCBuild() {
    return promiseExec(`docker-compose -f docker-compose.prod.yml up -d --build`)
}

const app = express()
    .use(express.json())
    .get('/alive', (req, res) => res.send("I'm alive"))
    .post('/deploy', (req, res) => {
        console.log('req.body:', req.body) /* dump variable */
        cdToProject(req.body.repository.name)
            .then(() => execGitPull('origin', 'main'))
            .then(execDCBuild)
            .then(() => res.send('Finish to deploy'))
            .catch((err) => {
                console.log('err:', err) /* dump variable */
                res.status(500).send('An error occurs')
            })
    })
app.listen(4040, () => console.log('http://localhost:4040'))

