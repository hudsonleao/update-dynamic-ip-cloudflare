const fetch = require('node-fetch');
const CronJob = require('cron').CronJob;
const publicIp = require('public-ip');
const fs = require('fs').promises;

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

        let data = {
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
    let zoneId = await getZoneId(zone, header);

    let resultsDnsRecord = await getDnsRecord(hostname, header, zoneId);

    let content;

    for await (const resultDnsRecord of resultsDnsRecord) {

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

            await updateDnsRecord(header, zoneId, resultDnsRecord, content);
            await fs.writeFile('./myIP.json', `{"ip": "${myIpv4}"}`);
    };
}

(async function main() {
    try {
        //Change variables in pm2.yml
        let zone = process.env.ZONE || "test.com";
        let hostname = process.env.HOSTNAME || "subdomain.test.com";
        let email = process.env.EMAIL || "admin@test.com";
        let token = process.env.TOKEN || "213fw3dsf4terqsdg4sdfsd";
        const header = {
            'X-Auth-Email': email,
            'X-Auth-Key': token
        };
        let myIpv4 = await publicIp.v4();
        //let myIpv6 = await publicIp.v6();

        let zoneId = await getZoneId(zone, header);

        let resultsDnsRecord = await getDnsRecord(hostname, header, zoneId);

        for await (const resultDnsRecord of resultsDnsRecord) {
            if(resultDnsRecord.type === 'A' && resultDnsRecord.content !== myIpv4){
                console.log("Updating IP...")
                await getAllAndUpdate(zone, hostname, header, myIpv4)
            }
        }

        let job = new CronJob('*/60 * * * * *', async function () {

            let ipJson = await fs.readFile('./myIP.json');
            ipJson = JSON.parse(ipJson)

            myIpv4 = await publicIp.v4();

            if (ipJson.ip !== myIpv4) {

                console.log("Updating IP...")

                await getAllAndUpdate(zone, hostname, header, myIpv4)

            }

        }, null, true, 'America/Sao_Paulo');
        job.start();
    } catch (error) {
        console.error(`main - Error: ${error}`);
    }
})();