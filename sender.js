const amqp = require('amqplib/callback_api')
const QUEUE = 'matchQueue'

module.exports = {
    send: function (id) {
        return new Promise(resolve => {
            amqp.connect('amqp://localhost', (connError, connection) => {
                if(connError) throw connError;
                connection.createChannel((channelError, channel) => {
                    if(channelError) throw channelError;
                    channel.assertQueue(QUEUE, {
                        durable: false
                    })
                    channel.sendToQueue(QUEUE, Buffer.from(id))
                });
                setTimeout(function (){
                    connection.close();
                }, 500);
            });
        })
    }
}
