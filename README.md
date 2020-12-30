# UPDATE DYNAMIC IP CLOUDFLARE

## Get help or list commands:

`node cli -h`


## Register cloudflare email and token:

`node cli -e emailexample@email.com -t tokenexample`

OR

`node cli --email emailexample@email.com --token tokenexample`


## List email and token registered:

`node cli -la`

OR

`node cli --list_auth`

### Response example: 

`{ email: 'emailexample@email.com', token: 'tokenexample' }`


## Register zone:

`node cli -z zoneexample.com`

OR 

`node cli --zone zoneexample.com`


## Remove zone:

`node cli -rz zoneexample.com`

OR

`node cli --remove_zone zoneexample.com`

## List zones:

`node cli -lz`

OR

`node cli --list_zones`

### Response example:

`[ { zone: 'zoneexample.com' } ]`


## Register hostname:

`node cli -H hostnameexample.zoneexample.com`

OR

`node cli --hostname hostnameexample.zoneexample.com`

## Remove hostname:

`node cli -rh hostnameexample.zoneexample.com`

OR

`node cli --remove_hostname hostnameexample.zoneexample.com`

## List hostnames:

`node cli -lh`

OR

`node cli --list_hostnames`

### Response example:

`[ { hostname: 'hostnameexample.zoneexample.com' } ]`