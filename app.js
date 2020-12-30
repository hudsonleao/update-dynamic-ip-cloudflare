const fetch = require('node-fetch');
const CronJob = require('cron').CronJob;
const publicIp = require('public-ip');
const fs = require('fs').promises;
require('./check')();

const getZoneId = async (zone, header) => {
    try {
        let response = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${encodeURI(zone)}`, {
            method: 'GET',
            headers: header
        });

        response = await response.json();

        if (response.result.lenght <= 0) throw new Error('Zone not found');

        return response.result[0].id;

    } catch (error) {
        console.error(`getZoneId - Error: ${error}`);
    }
};

const getDnsRecord = async (hostname, header, zoneId) => {
    try {
        let response = await fetch(`https://api.cloudflare.com/client/v4/zones/${encodeURI(zoneId)}/dns_records?name=${encodeURI(hostname)}`, {
            method: 'GET',
            headers: header
        });

        response = await response.json();

        if (response.result.lenght <= 0) throw new Error('DNS record not found');

        return response.result;

    } catch (error) {
        console.error(`getDnsRecord - Error: ${error}`);
    }
};

const updateDnsRecord = async (header, zoneId, resultDnsRecord, content) => {
    try {

        const data = {
            type: resultDnsRecord.type,
            name: resultDnsRecord.name,
            proxied: true,
            content: content
        }

        let response = await fetch(`https://api.cloudflare.com/client/v4/zones/${encodeURI(zoneId)}/dns_records/${encodeURI(resultDnsRecord.id)}`, {
            method: 'PUT',
            headers: header,
            body: JSON.stringify(data)
        });

        response = await response.json();

        if (response.result.lenght <= 0) throw new Error('Error updating DNS Record');

        return response.result;

    } catch (error) {
        console.error(`updateDnsRecord - Error: ${error}`);
    }
};

const getAllAndUpdate = async (zone, hostname, header, myIpv4) => {
    const zoneId = await getZoneId(zone, header);

    const resultsDnsRecord = await getDnsRecord(hostname, header, zoneId);

    let content;

    for (const resultDnsRecord of resultsDnsRecord) {

        switch (resultDnsRecord.type) {
            case 'A':
                content = await publicIp.v4()
                break;
            case 'AAAA':
                content = await publicIp.v6()
                break;
            default:
                console.error(`DNS Record Type unsupported: ${resultDnsRecord.type}`)
                break;
        }
        Promise.all([
            updateDnsRecord(header, zoneId, resultDnsRecord, content),
            fs.writeFile('./myIP.json', `{"ip": "${myIpv4}"}`)
        ]).catch(error => {
            throw new Error(error)
        });

    };
}

(async function main() {
    try {
        const zones = JSON.parse(await fs.readFile('./data/zones.json'));
        if(zones.length === 0) throw new Error('Zones cannot be empty');

        const hostnames = JSON.parse(await fs.readFile('./data/hostnames.json'));
        if(hostnames.length === 0) throw new Error('Hostname cannot be empty');

        const auth = JSON.parse(await fs.readFile('./data/auth.json'));
        if(!auth) throw new Error('Auth cannot be empty');
        const { email, token } = auth
        if(!email) throw new Error('Email cannot be empty');
        if(!token) throw new Error('Token cannot be empty');

        for (const {zone} of zones) {
            for (const {hostname} of hostnames) {
                if (hostname.indexOf(zone) !== -1) {
                    const header = {
                        'X-Auth-Email': email,
                        'X-Auth-Key': token
                    };
                    const myIpv4 = await publicIp.v4();

                    const zoneId = await getZoneId(zone, header);

                    const resultsDnsRecord = await getDnsRecord(hostname, header, zoneId);

                    for (const resultDnsRecord of resultsDnsRecord) {
                        if (resultDnsRecord.type === 'A' && resultDnsRecord.content !== myIpv4) {
                            console.log("Updating IP...")
                            await getAllAndUpdate(zone, hostname, header, myIpv4)
                        }
                    }

                    const job = new CronJob('*/60 * * * * *', async function () {

                        let ipJson = await fs.readFile('./myIP.json');
                        ipJson = JSON.parse(ipJson)

                        const myIpv4 = await publicIp.v4();

                        if (ipJson.ip !== myIpv4) {

                            console.log("Updating IP...")

                            await getAllAndUpdate(zone, hostname, header, myIpv4)

                        }

                    }, null, true, 'America/Sao_Paulo');
                    job.start();
                }
            }
        }
    } catch (error) {
        console.error(`main - ${error}`);
    }
})();