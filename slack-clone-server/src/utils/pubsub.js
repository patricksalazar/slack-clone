// import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';

const Redis = require('ioredis');

const REDIS_DOMAIN_NAME = '192.168.99.100';
const REDIS_PORT_NUMBER = '32775';

const options = {
  host: REDIS_DOMAIN_NAME,
  port: REDIS_PORT_NUMBER,
  retryStrategy: times => {
    // reconnect after
    return Math.min(times * 50, 2000);
  }
};

export default new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});
