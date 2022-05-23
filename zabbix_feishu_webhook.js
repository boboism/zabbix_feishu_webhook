var Feishu = {
    params: {},
    proxy: null,
    setParams: function (params) {
        if (typeof params !== 'object') {
            return;
        }
        Feishu.params = params;
    },
    request: function () {
        var data = {
            msg_type: "post",
            content: {
                post: {
                    zh_cn: {
                        title: Feishu.params.Subject,
                        content: [
                            [{
                                tag: "text",
                                text: "## 报警通知:\n" + Feishu.params.Message
                            }
                            ]
                        ]
                    }
                }
            }
        },
            response,
            url = Feishu.params.URL,
            request = new HttpRequest();

        request.addHeader('Content-Type: application/json');
        if (typeof Feishu.HTTPProxy !== 'undefined' && Feishu.HTTPProxy !== '') {
            request.setProxy(Feishu.HTTPProxy);
        }

        if (typeof data !== 'undefined') {
            data = JSON.stringify(data);
        }
        Zabbix.Log(4, "[Feishu Webhook] message is: " + data);
        response = request.post(url, data);

        Zabbix.log(4, '[ Feishu Webhook ] Received response with status code ' +
            request.getStatus() + '\n' + response);

        if (response !== null) {
            try {
                response = JSON.parse(response);
            }
            catch (error) {
                Zabbix.log(4, '[ Feishu Webhook ] Failed to parse response received from Feishu');
                response = null;
            }
        }

        if (request.getStatus() !== 200 || response.StatusCode !== 0) {
            var message = 'Request failed with status code ' + request.getStatus();

            if (response !== null && typeof response.errmsg !== 'undefined') {
                message += ': ' + JSON.stringify(response.errmsg);
            }

            throw message + '. Check debug log for more information.';
        }

        return response;
    },
};


try {
    var params = JSON.parse(value);

    if (typeof params.URL !== 'undefined'
        && typeof params.Message !== 'undefined') {
        Zabbix.log(4, '[ Feishu Webhook ] webhookURL "' + params.URL +
            '" sendto "' + params.To) + '"';
    }
    else {
        throw 'Missing parameter. URL, message, to parameter is required'
    }
    if (params.HTTPProxy) {
        Feishu.proxy = params.HTTPProxy;
    }
    Feishu.setParams(params);
    Feishu.request();
    return 'OK';
} catch (error) {
    Zabbix.log(3, '[ Feishu Webhook ] ERROR: ' + error);
    throw 'Sending failed: ' + error;
}
