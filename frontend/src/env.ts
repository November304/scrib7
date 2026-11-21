export const API_URL = `http${location.protocol === 'https:' ? 's' : ''}://${location.host}`
export const WS_URL = API_URL.replace(/^http/, 'ws') + "/ws"