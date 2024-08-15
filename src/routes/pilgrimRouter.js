const { Router } = require('express')
const { createPilgrim, getPilgrims } = require('../controller/pilgrim')
const { auth } = require('../middleware/auth')

const pilgrimRouter = Router()
pilgrimRouter.post('/',auth,createPilgrim)
pilgrimRouter.get('/',getPilgrims)

module.exports = pilgrimRouter