const { program } = require('commander');
require('./check')();
const Main = require('./main')();

program.version('V1')

program
    .option('-e, --email [value]', 'Register email')
    .option('-t, --token [value]', 'Register token')
    .option('-la, --list_auth', 'List auth, email and token registered')
    .option('-z, --zone [value]', 'Register zone')
    .option('-rz, --remove_zone [value]', 'Remove zone')
    .option('-lz, --list_zones', 'List zones registered')
    .option('-H, --hostname [value]', 'Register hostname')
    .option('-rh, --remove_hostname [value]', 'Remove hostname')
    .option('-lh, --list_hostnames', 'List hostnames registered')
    .action(async ({ email, token, list_auth, zone, remove_zone, list_zones, hostname, remove_hostname, list_hostnames}) => {
        try {
            if (email || token) {
                const { error } = await Main.registerAuth(email, token)
                if (!error) console.log("Registered auth successfully!")
            }
            if (list_auth) {
                const list = await Main.listAuth()
                console.log(list)
            }
            if (zone) {
                if (!zone) throw new Error('zone cannot be empty');
                const registered = await Main.registerZone(zone)
                if (registered) console.log("Registered zone successfully!")
            }
            if (remove_zone) {
                if (!remove_zone) throw new Error('remove_zone cannot be empty');
                const removed = await Main.removeZone(remove_zone);
                if (removed)
                    console.log("Remove zone successfully!")
            }
            if (list_zones) {
                const list = await Main.listZones()
                console.log(list)
            }
            if (hostname) {
                if (!hostname) throw new Error('hostname cannot be empty');
                const registered = await Main.registerHostname(hostname)
                if (registered) console.log("Registered hostname successfully!")
            }
            if (remove_hostname) {
                if (!remove_hostname) throw new Error('remove_hostname cannot be empty');
                const removed = await Main.removeHostname(remove_hostname);
                if (removed)
                    console.log("Remove hostname successfully!")
            }
            if (list_hostnames) {
                const list = await Main.listHostnames()
                console.log(list)
            }
        } catch (error) {
            console.error(error)
        }

    })
    .parse(process.argv);