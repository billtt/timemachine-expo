/**
 * Utility functions
 */
var sprintf = require("sprintf-js").sprintf;
import config from './config';
import * as Clipboard from 'expo-clipboard'

export default class Utils {
    static simpleDateTime(date) {
        return  sprintf('%02d/%02d/%04d %02d:%02d', date.getMonth()+1, date.getDate(), date.getFullYear(),
            date.getHours(), date.getMinutes());
    }

    static toDateTimeLocalString(date) {
        const pad = (n) => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // getMonth() is 0-based
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        // Build "YYYY-MM-DDThh:mm" string
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    static async fetchJson(api, token, params) {
        const url = config.serverAddress;
        if (token) {
            params.token = token;
        }
        let json = null;
        try {
            const response = await fetch(url + api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            json = await response.json();
            return json;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static copyToClipboard(text) {
        Clipboard.setStringAsync(text);
    }
}
