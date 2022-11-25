import nodeGeoCoder from 'node-geocoder';
import config from '../../../config/defaults.mjs';

 const options = {
    provider :config.mapquestProvider,
    httpAdapter: 'https',
    apiKey:config.mapquestApikey,
    formatter: null
}

 const geoCoder = nodeGeoCoder(options)
 export default geoCoder;