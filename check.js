const fs = require('fs');

module.exports = () => {
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data')
    }

    if (!fs.existsSync('./data/auth.json')) {
        fs.writeFileSync('./data/auth.json', '{}')
    }

    if (!fs.existsSync('./data/hostnames.json')) {
        fs.writeFileSync('./data/hostnames.json', '[]')
    }

    if (!fs.existsSync('./data/zones.json')) {
        fs.writeFileSync('./data/zones.json', '[]')
    }

    if (!fs.existsSync('./myIP.json')) {
        fs.writeFileSync('./myIP.json', '{"ip": "127.0.0.1"}')
    }
}