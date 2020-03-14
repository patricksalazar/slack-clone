// import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';

const Redis = require('ioredis');

const options = {
  host: process.env.REDIS_HOST || '192.168.99.100',
  port: process.env.REDIS_PORT || '6379',
  retryStrategy: times => {
    // reconnect after
    return Math.min(times * 50, 2000);
  }
};

export default new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});
