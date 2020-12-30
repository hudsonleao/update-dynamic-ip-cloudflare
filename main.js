const fs = require('fs').promises;

module.exports = () => {
  let main = {}
  main.registerAuth = async (email, token) => {
    try {
      const write = await fs.writeFile('./data/auth.json', `{"email": "${email}", "token": "${token}"}`);
      if (write) return true;
      return false
    } catch (error) {
      console.error('registerAuth - ', error)
    }
  };

  main.listAuth = async () => {
    try {
      const read = JSON.parse(await fs.readFile('./data/auth.json', 'utf-8'));
      if (read) return read;
    } catch (error) {
      console.error('listAuth - ', error)
    }
  };

  main.registerZone = async (zone) => {
    try {
      let zones = await fs.readFile('./data/zones.json', 'utf-8');
      if (zones) zones = JSON.parse(zones)
      if (typeof (zones) !== 'object') zones = []

      for (const value of zones) {
        if (value.zone === zone) {
          console.log('Zone already registered');
          return false;
        }
      }

      zones.push({ zone });
      await fs.writeFile('./data/zones.json', JSON.stringify(zones));
      return true;

    } catch (error) {
      console.error('registerZone - ', error)
    }
  };

  main.removeZone = async (zone) => {
    try {
      let zones = await fs.readFile('./data/zones.json', 'utf-8');
      if (zones) zones = JSON.parse(zones)
      if (typeof (zones) !== 'object') zones = []

      let newArray = []

      if (zones.length > 0) {
        for (const value of zones) {
          if (value.zone !== zone) {
            newArray.push(value)
          }
        }
      }
      
      if(zones.length === newArray.length) {
        console.log('No record has been removed, check if it is registered.')
        return false;
      }

      await fs.writeFile('./data/zones.json', JSON.stringify(newArray));
      return true;

    } catch (error) {
      console.error('listZones -', error)
    }
  };

  main.listZones = async () => {
    try {
      let zones = await fs.readFile('./data/zones.json', 'utf-8');
      if (zones) zones = JSON.parse(zones)
      if (typeof (zones) !== 'object') zones = []

      if (zones) return zones;
    } catch (error) {
      console.error('listZones - ', error)
    }
  };

  main.registerHostname = async (hostname) => {
    try {
      let hostnames = await fs.readFile('./data/hostnames.json', 'utf-8');
      if (hostnames) hostnames = JSON.parse(hostnames)
      if (typeof (hostnames) !== 'object') hostnames = []

      for (const value of hostnames) {
        if (value.hostname === hostname) {
          console.log('Hostname already registered');
          return false;
        }
      }

      hostnames.push({ hostname });
      await fs.writeFile('./data/hostnames.json', JSON.stringify(hostnames));
      return true;

    } catch (error) {
      console.error('registerHostname - ', error)
    }
  };

  main.removeHostname = async (hostname) => {
    try {
      let hostnames = await fs.readFile('./data/hostnames.json', 'utf-8');
      if (hostnames) hostnames = JSON.parse(hostnames)
      if (typeof (hostnames) !== 'object') hostnames = []

      let newArray = []

      if (hostnames.length > 0) {
        for (const value of hostnames) {
          if (value.hostname !== hostname) {
            newArray.push(value)
          }
        }
      }
      
      if(hostnames.length === newArray.length) {
        console.log('No record has been removed, check if it is registered.')
        return false;
      }

      await fs.writeFile('./data/hostnames.json', JSON.stringify(newArray));
      return true;

    } catch (error) {
      console.error('removeHostname -', error)
    }
  };

  main.listHostnames = async () => {
    try {
      let hostnames = await fs.readFile('./data/hostnames.json', 'utf-8');
      if (hostnames) hostnames = JSON.parse(hostnames)
      if (typeof (hostnames) !== 'object') hostnames = []

      if (hostnames) return hostnames;
    } catch (error) {
      console.error('listHostnames - ', error)
    }
  };

  return main;
}
