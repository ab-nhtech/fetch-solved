import fetch from "../util/fetch-fill";
import URI from "urijs";

// records endpoint
window.path = "http://localhost:3000/records";

function retrieve(options = {}) {
    return new Promise(function (resolve, reject) {
        if (!options.page) options.page = 1;
        var page = options.page;
        if (!options.colors) options.colors = [];

        options.limit = 11;
        options.offset = (options.page - 1) * (options.limit - 1);
        if (!options["color[]"]) options["color[]"] = [];
        options.colors.forEach(function (color) {
            options["color[]"].push(color);
        });
        delete options.colors;
        delete options.page;
        var uri = URI(window.path).search(options);
        let query = window.path + "?" + uri.query();
        var data = {};
        data.path = query;
        getData(data).then(function (response) {
            resolve(transformPayload(response, page));
        }).catch(function (error) {
            reject(error);
        });
    });
}

function getData(data) {
    return fetch(data.path, {
        method: 'GET',
        headers: data.headers || {},
        queryParams: data.queryParams || {},
    })
        .then(function (response) {
            return response.json().then(function (json) {
                return response.ok ? json : Promise.reject(json);
            });
        })
        .catch(function (err) {
            return new Error(err);
        });
}

function transformPayload(payload, page) {
    try {
        var data = {
            ids: [],
            open: [],
            closedPrimaryCount: 0
        };
        if (payload.length === 0 && page === 1) {
            data.previousPage = null;
            data.nextPage = null;
        } else {
            data.previousPage = (page === 1) ? null : page - 1;
            if (payload.length > 10) {
                data.nextPage = page + 1;
                payload.pop();
            } else {
                data.nextPage = null;
            }
        }
        var primaryColors = ['red', 'blue', 'yellow'];
        payload.forEach(function (datum) {
            data.ids.push(datum.id);
            var primary = primaryColors.includes(datum.color);
            if (datum.disposition === 'open') {
                datum.isPrimary = primary;
                data.open.push(datum);
            } else if (datum.disposition === 'closed' && primary) {
                data.closedPrimaryCount++;
            }
        });
        return data;
    } catch (err) {
        console.log('Invalid API endpoint', err);
    }
}
export default retrieve;