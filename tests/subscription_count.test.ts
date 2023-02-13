import { Server } from './../src/server';
import { Utils } from './utils';

describe('public channel test', () => {
    beforeEach(() => {
        jest.resetModules();

        return Utils.waitForPortsToFreeUp();
    });

    afterEach(() => {
        return Utils.flushServers();
    });

    test('recieves subscription count event', done => {
        Utils.newServer({}, (server: Server) => {
            let client = Utils.newClient();
            let backend = Utils.newBackend();
            let channelName = Utils.randomChannelName();

            client.connection.bind('connected', () => {
                let channel = client.subscribe(channelName);

                channel.bind('greeting', e => {
                    expect(e.message).toBe('hello');
                    expect(e.weirdVariable).toBe('abc/d');
                    client.disconnect();
                    done();
                });

                channel.bind('pusher_internal:subscription_succeeded', () => {
                    backend.trigger(channelName, 'greeting', { message: 'hello', weirdVariable: 'abc/d' })
                        .catch(error => {
                            throw new Error(error);
                        });
                });
            });
        });
    });

});
