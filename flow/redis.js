declare module redis {
  declare class RedisClient extends events$EventEmitter {
    constructor(options: Object, stream?: net$Socket):void;
    auth(password: string, callback: Function):void;
    quit():void;
    end(flush?: boolean):void;
    unref():void;
    hgetall(hash: string, callback?: Function):void;
    hmset(hash: string, obj: Object, callback?: Function):void;
    hmset(hash: string, key1: string, key2: string, callback?: Function):void;
    hmset(hash: string, ...rest: Array<string|Function>):void;
    multi(commands: Array<Array<any>>):this;
    batch(commands: Array<Array<any>>):this;
    exec(callback?: Function):void;
    exec_atomic(callback?: Function):void;
    duplicate(options?: Object, callback?: Function):RedisClient;
    send_command(command_name: string, args?: Object, callback?: Function):void;

    stream:net$Socket;
    server_info:Object;
    print:Function;
    connected:boolean;
    command_queue_length:number;
    offline_queue_length:number;

    // commands
    append(key: string, val: any, callback?: Function):this;
    APPEND(key: string, val: any, callback?: Function):this;

    asking(callback?: Function):this;
    ASKING(callback?: Function):this;

    auth(key: string, callback?: Function):this;
    AUTH(key: string, callback?: Function):this;

    bgrewriteaof(callback?: Function):this;
    BGREWRITEAOF(callback?: Function):this;

    bgsave(callback?: Function):this;
    BGSAVE(callback?: Function):this;

    bitcount(args: Array<any>, callback?: Function):this;
    BITCOUNT(args: Array<any>, callback?: Function):this;
    bitcount(key: string, args: Array<any>, callback?: Function):this;
    BITCOUNT(key: string, args: Array<any>, callback?: Function):this;

    bitfield(args: Array<any>, callback?: Function):this;
    BITFIELD(args: Array<any>, callback?: Function):this;
    bitfield(key: string, args: Array<any>, callback?: Function):this;
    BITFIELD(key: string, args: Array<any>, callback?: Function):this;

    bitop(args: Array<any>, callback?: Function):this;
    BITOP(args: Array<any>, callback?: Function):this;
    bitop(key: string, args: Array<any>, callback?: Function):this;
    BITOP(key: string, args: Array<any>, callback?: Function):this;

    bitpos(args: Array<any>, callback?: Function):this;
    BITPOS(args: Array<any>, callback?: Function):this;
    bitpos(key: string, args: Array<any>, callback?: Function):this;
    BITPOS(key: string, args: Array<any>, callback?: Function):this;

    blpop(args: Array<any>, callback?: Function):this;
    BLPOP(args: Array<any>, callback?: Function):this;
    blpop(key: string, args: Array<any>, callback?: Function):this;
    BLPOP(key: string, args: Array<any>, callback?: Function):this;

    brpop(args: Array<any>, callback?: Function):this;
    BRPOP(args: Array<any>, callback?: Function):this;
    brpop(key: string, args: Array<any>, callback?: Function):this;
    BRPOP(key: string, args: Array<any>, callback?: Function):this;

    brpoplpush(key: string, v1: any, v2: any, callback?: Function):this;
    BRPOPLPUSH(key: string, v1: any, v2: any, callback?: Function):this;

    client(args: Array<any>, callback?: Function):this;
    CLIENT(args: Array<any>, callback?: Function):this;
    client(key: string, args: Array<any>, callback?: Function):this;
    CLIENT(key: string, args: Array<any>, callback?: Function):this;

    cluster(args: Array<any>, callback?: Function):this;
    CLUSTER(args: Array<any>, callback?: Function):this;
    cluster(key: string, args: Array<any>, callback?: Function):this;
    CLUSTER(key: string, args: Array<any>, callback?: Function):this;

    command(callback?: Function):this;
    COMMAND(callback?: Function):this;

    config(args: Array<any>, callback?: Function):this;
    CONFIG(args: Array<any>, callback?: Function):this;
    config(key: string, args: Array<any>, callback?: Function):this;
    CONFIG(key: string, args: Array<any>, callback?: Function):this;

    dbsize(callback?: Function):this;
    DBSIZE(callback?: Function):this;

    debug(callback?: Function):this;
    DEBUG(callback?: Function):this;

    decr(key: string, callback?: Function):this;
    DECR(key: string, callback?: Function):this;

    decrby(key: string, val: any, callback?: Function):this;
    DECRBY(key: string, val: any, callback?: Function):this;

    del(args: Array<any>, callback?: Function):this;
    DEL(args: Array<any>, callback?: Function):this;
    del(key: string, args: Array<any>, callback?: Function):this;
    DEL(key: string, args: Array<any>, callback?: Function):this;

    discard(callback?: Function):this;
    DISCARD(callback?: Function):this;

    dump(key: string, callback?: Function):this;
    DUMP(key: string, callback?: Function):this;

    echo(key: string, callback?: Function):this;
    ECHO(key: string, callback?: Function):this;

    eval(args: Array<any>, callback?: Function):this;
    EVAL(args: Array<any>, callback?: Function):this;
    eval(key: string, args: Array<any>, callback?: Function):this;
    EVAL(key: string, args: Array<any>, callback?: Function):this;

    evalsha(args: Array<any>, callback?: Function):this;
    EVALSHA(args: Array<any>, callback?: Function):this;
    evalsha(key: string, args: Array<any>, callback?: Function):this;
    EVALSHA(key: string, args: Array<any>, callback?: Function):this;

    exec(callback?: Function):this;
    EXEC(callback?: Function):this;

    exists(args: Array<any>, callback?: Function):this;
    EXISTS(args: Array<any>, callback?: Function):this;
    exists(key: string, args: Array<any>, callback?: Function):this;
    EXISTS(key: string, args: Array<any>, callback?: Function):this;

    expire(key: string, val: any, callback?: Function):this;
    EXPIRE(key: string, val: any, callback?: Function):this;

    expireat(key: string, val: any, callback?: Function):this;
    EXPIREAT(key: string, val: any, callback?: Function):this;

    flushall(callback?: Function):this;
    FLUSHALL(callback?: Function):this;

    flushdb(callback?: Function):this;
    FLUSHDB(callback?: Function):this;

    geoadd(args: Array<any>, callback?: Function):this;
    GEOADD(args: Array<any>, callback?: Function):this;
    geoadd(key: string, args: Array<any>, callback?: Function):this;
    GEOADD(key: string, args: Array<any>, callback?: Function):this;

    geodist(args: Array<any>, callback?: Function):this;
    GEODIST(args: Array<any>, callback?: Function):this;
    geodist(key: string, args: Array<any>, callback?: Function):this;
    GEODIST(key: string, args: Array<any>, callback?: Function):this;

    geohash(args: Array<any>, callback?: Function):this;
    GEOHASH(args: Array<any>, callback?: Function):this;
    geohash(key: string, args: Array<any>, callback?: Function):this;
    GEOHASH(key: string, args: Array<any>, callback?: Function):this;

    geopos(args: Array<any>, callback?: Function):this;
    GEOPOS(args: Array<any>, callback?: Function):this;
    geopos(key: string, args: Array<any>, callback?: Function):this;
    GEOPOS(key: string, args: Array<any>, callback?: Function):this;

    georadius(args: Array<any>, callback?: Function):this;
    GEORADIUS(args: Array<any>, callback?: Function):this;
    georadius(key: string, args: Array<any>, callback?: Function):this;
    GEORADIUS(key: string, args: Array<any>, callback?: Function):this;

    georadiusbymember(args: Array<any>, callback?: Function):this;
    GEORADIUSBYMEMBER(args: Array<any>, callback?: Function):this;
    georadiusbymember(key: string, args: Array<any>, callback?: Function):this;
    GEORADIUSBYMEMBER(key: string, args: Array<any>, callback?: Function):this;

    get(key: string, callback?: Function):this;
    GET(key: string, callback?: Function):this;

    getbit(key: string, val: any, callback?: Function):this;
    GETBIT(key: string, val: any, callback?: Function):this;

    getrange(key: string, v1: any, v2: any, callback?: Function):this;
    GETRANGE(key: string, v1: any, v2: any, callback?: Function):this;

    getset(key: string, val: any, callback?: Function):this;
    GETSET(key: string, val: any, callback?: Function):this;

    hdel(args: Array<any>, callback?: Function):this;
    HDEL(args: Array<any>, callback?: Function):this;
    hdel(key: string, args: Array<any>, callback?: Function):this;
    HDEL(key: string, args: Array<any>, callback?: Function):this;

    hexists(key: string, val: any, callback?: Function):this;
    HEXISTS(key: string, val: any, callback?: Function):this;

    hget(key: string, val: any, callback?: Function):this;
    HGET(key: string, val: any, callback?: Function):this;

    hgetall(key: string, callback?: Function):this;
    HGETALL(key: string, callback?: Function):this;

    hincrby(key: string, v1: any, v2: any, callback?: Function):this;
    HINCRBY(key: string, v1: any, v2: any, callback?: Function):this;

    hincrbyfloat(key: string, v1: any, v2: any, callback?: Function):this;
    HINCRBYFLOAT(key: string, v1: any, v2: any, callback?: Function):this;

    hkeys(key: string, callback?: Function):this;
    HKEYS(key: string, callback?: Function):this;

    hlen(key: string, callback?: Function):this;
    HLEN(key: string, callback?: Function):this;

    hmget(args: Array<any>, callback?: Function):this;
    HMGET(args: Array<any>, callback?: Function):this;
    hmget(key: string, args: Array<any>, callback?: Function):this;
    HMGET(key: string, args: Array<any>, callback?: Function):this;

    hmset(args: Array<any>, callback?: Function):this;
    HMSET(args: Array<any>, callback?: Function):this;
    hmset(key: string, args: Array<any>, callback?: Function):this;
    HMSET(key: string, args: Array<any>, callback?: Function):this;

    host(callback?: Function):this;
    HOST(callback?: Function):this;

    hscan(args: Array<any>, callback?: Function):this;
    HSCAN(args: Array<any>, callback?: Function):this;
    hscan(key: string, args: Array<any>, callback?: Function):this;
    HSCAN(key: string, args: Array<any>, callback?: Function):this;

    hset(key: string, v1: any, v2: any, callback?: Function):this;
    HSET(key: string, v1: any, v2: any, callback?: Function):this;

    hsetnx(key: string, v1: any, v2: any, callback?: Function):this;
    HSETNX(key: string, v1: any, v2: any, callback?: Function):this;

    hstrlen(key: string, val: any, callback?: Function):this;
    HSTRLEN(key: string, val: any, callback?: Function):this;

    hvals(key: string, callback?: Function):this;
    HVALS(key: string, callback?: Function):this;

    incr(key: string, callback?: Function):this;
    INCR(key: string, callback?: Function):this;

    incrby(key: string, val: any, callback?: Function):this;
    INCRBY(key: string, val: any, callback?: Function):this;

    incrbyfloat(key: string, val: any, callback?: Function):this;
    INCRBYFLOAT(key: string, val: any, callback?: Function):this;

    info(callback?: Function):this;
    INFO(callback?: Function):this;

    keys(key: string, callback?: Function):this;
    KEYS(key: string, callback?: Function):this;

    lastsave(callback?: Function):this;
    LASTSAVE(callback?: Function):this;

    latency(args: Array<any>, callback?: Function):this;
    LATENCY(args: Array<any>, callback?: Function):this;
    latency(key: string, args: Array<any>, callback?: Function):this;
    LATENCY(key: string, args: Array<any>, callback?: Function):this;

    lindex(key: string, val: any, callback?: Function):this;
    LINDEX(key: string, val: any, callback?: Function):this;

    linsert(args: Array<any>, callback?: Function):this;
    LINSERT(args: Array<any>, callback?: Function):this;
    linsert(key: string, args: Array<any>, callback?: Function):this;
    LINSERT(key: string, args: Array<any>, callback?: Function):this;

    llen(key: string, callback?: Function):this;
    LLEN(key: string, callback?: Function):this;

    lpop(key: string, callback?: Function):this;
    LPOP(key: string, callback?: Function):this;

    lpush(args: Array<any>, callback?: Function):this;
    LPUSH(args: Array<any>, callback?: Function):this;
    lpush(key: string, args: Array<any>, callback?: Function):this;
    LPUSH(key: string, args: Array<any>, callback?: Function):this;

    lpushx(args: Array<any>, callback?: Function):this;
    LPUSHX(args: Array<any>, callback?: Function):this;
    lpushx(key: string, args: Array<any>, callback?: Function):this;
    LPUSHX(key: string, args: Array<any>, callback?: Function):this;

    lrange(key: string, v1: any, v2: any, callback?: Function):this;
    LRANGE(key: string, v1: any, v2: any, callback?: Function):this;

    lrem(key: string, v1: any, v2: any, callback?: Function):this;
    LREM(key: string, v1: any, v2: any, callback?: Function):this;

    lset(key: string, v1: any, v2: any, callback?: Function):this;
    LSET(key: string, v1: any, v2: any, callback?: Function):this;

    ltrim(key: string, v1: any, v2: any, callback?: Function):this;
    LTRIM(key: string, v1: any, v2: any, callback?: Function):this;

    memory(args: Array<any>, callback?: Function):this;
    MEMORY(args: Array<any>, callback?: Function):this;
    memory(key: string, args: Array<any>, callback?: Function):this;
    MEMORY(key: string, args: Array<any>, callback?: Function):this;

    mget(args: Array<any>, callback?: Function):this;
    MGET(args: Array<any>, callback?: Function):this;
    mget(key: string, args: Array<any>, callback?: Function):this;
    MGET(key: string, args: Array<any>, callback?: Function):this;

    migrate(args: Array<any>, callback?: Function):this;
    MIGRATE(args: Array<any>, callback?: Function):this;
    migrate(key: string, args: Array<any>, callback?: Function):this;
    MIGRATE(key: string, args: Array<any>, callback?: Function):this;

    module(args: Array<any>, callback?: Function):this;
    MODULE(args: Array<any>, callback?: Function):this;
    module(key: string, args: Array<any>, callback?: Function):this;
    MODULE(key: string, args: Array<any>, callback?: Function):this;

    monitor(callback?: Function):this;
    MONITOR(callback?: Function):this;

    move(key: string, val: any, callback?: Function):this;
    MOVE(key: string, val: any, callback?: Function):this;

    mset(args: Array<any>, callback?: Function):this;
    MSET(args: Array<any>, callback?: Function):this;
    mset(key: string, args: Array<any>, callback?: Function):this;
    MSET(key: string, args: Array<any>, callback?: Function):this;

    msetnx(args: Array<any>, callback?: Function):this;
    MSETNX(args: Array<any>, callback?: Function):this;
    msetnx(key: string, args: Array<any>, callback?: Function):this;
    MSETNX(key: string, args: Array<any>, callback?: Function):this;

    multi(callback?: Function):this;
    MULTI(callback?: Function):this;

    object(key: string, val: any, callback?: Function):this;
    OBJECT(key: string, val: any, callback?: Function):this;

    persist(key: string, callback?: Function):this;
    PERSIST(key: string, callback?: Function):this;

    pexpire(key: string, val: any, callback?: Function):this;
    PEXPIRE(key: string, val: any, callback?: Function):this;

    pexpireat(key: string, val: any, callback?: Function):this;
    PEXPIREAT(key: string, val: any, callback?: Function):this;

    pfadd(args: Array<any>, callback?: Function):this;
    PFADD(args: Array<any>, callback?: Function):this;
    pfadd(key: string, args: Array<any>, callback?: Function):this;
    PFADD(key: string, args: Array<any>, callback?: Function):this;

    pfcount(args: Array<any>, callback?: Function):this;
    PFCOUNT(args: Array<any>, callback?: Function):this;
    pfcount(key: string, args: Array<any>, callback?: Function):this;
    PFCOUNT(key: string, args: Array<any>, callback?: Function):this;

    pfdebug(args: Array<any>, callback?: Function):this;
    PFDEBUG(args: Array<any>, callback?: Function):this;
    pfdebug(key: string, args: Array<any>, callback?: Function):this;
    PFDEBUG(key: string, args: Array<any>, callback?: Function):this;

    pfmerge(args: Array<any>, callback?: Function):this;
    PFMERGE(args: Array<any>, callback?: Function):this;
    pfmerge(key: string, args: Array<any>, callback?: Function):this;
    PFMERGE(key: string, args: Array<any>, callback?: Function):this;

    pfselftest(callback?: Function):this;
    PFSELFTEST(callback?: Function):this;

    ping(callback?: Function):this;
    PING(callback?: Function):this;

    post(callback?: Function):this;
    POST(callback?: Function):this;

    psetex(key: string, v1: any, v2: any, callback?: Function):this;
    PSETEX(key: string, v1: any, v2: any, callback?: Function):this;

    psubscribe(args: Array<any>, callback?: Function):this;
    PSUBSCRIBE(args: Array<any>, callback?: Function):this;
    psubscribe(key: string, args: Array<any>, callback?: Function):this;
    PSUBSCRIBE(key: string, args: Array<any>, callback?: Function):this;

    psync(key: string, val: any, callback?: Function):this;
    PSYNC(key: string, val: any, callback?: Function):this;

    pttl(key: string, callback?: Function):this;
    PTTL(key: string, callback?: Function):this;

    publish(key: string, val: any, callback?: Function):this;
    PUBLISH(key: string, val: any, callback?: Function):this;

    pubsub(args: Array<any>, callback?: Function):this;
    PUBSUB(args: Array<any>, callback?: Function):this;
    pubsub(key: string, args: Array<any>, callback?: Function):this;
    PUBSUB(key: string, args: Array<any>, callback?: Function):this;

    punsubscribe(callback?: Function):this;
    PUNSUBSCRIBE(callback?: Function):this;

    quit(callback?: Function):this;
    QUIT(callback?: Function):this;

    randomkey(callback?: Function):this;
    RANDOMKEY(callback?: Function):this;

    readonly(callback?: Function):this;
    READONLY(callback?: Function):this;

    readwrite(callback?: Function):this;
    READWRITE(callback?: Function):this;

    rename(key: string, val: any, callback?: Function):this;
    RENAME(key: string, val: any, callback?: Function):this;

    renamenx(key: string, val: any, callback?: Function):this;
    RENAMENX(key: string, val: any, callback?: Function):this;

    replconf(callback?: Function):this;
    REPLCONF(callback?: Function):this;

    restore(args: Array<any>, callback?: Function):this;
    RESTORE(args: Array<any>, callback?: Function):this;
    restore(key: string, args: Array<any>, callback?: Function):this;
    RESTORE(key: string, args: Array<any>, callback?: Function):this;

    role(callback?: Function):this;
    ROLE(callback?: Function):this;

    rpop(key: string, callback?: Function):this;
    RPOP(key: string, callback?: Function):this;

    rpoplpush(key: string, val: any, callback?: Function):this;
    RPOPLPUSH(key: string, val: any, callback?: Function):this;

    rpush(args: Array<any>, callback?: Function):this;
    RPUSH(args: Array<any>, callback?: Function):this;
    rpush(key: string, args: Array<any>, callback?: Function):this;
    RPUSH(key: string, args: Array<any>, callback?: Function):this;

    rpushx(args: Array<any>, callback?: Function):this;
    RPUSHX(args: Array<any>, callback?: Function):this;
    rpushx(key: string, args: Array<any>, callback?: Function):this;
    RPUSHX(key: string, args: Array<any>, callback?: Function):this;

    sadd(args: Array<any>, callback?: Function):this;
    SADD(args: Array<any>, callback?: Function):this;
    sadd(key: string, args: Array<any>, callback?: Function):this;
    SADD(key: string, args: Array<any>, callback?: Function):this;

    save(callback?: Function):this;
    SAVE(callback?: Function):this;

    scan(args: Array<any>, callback?: Function):this;
    SCAN(args: Array<any>, callback?: Function):this;
    scan(key: string, args: Array<any>, callback?: Function):this;
    SCAN(key: string, args: Array<any>, callback?: Function):this;

    scard(key: string, callback?: Function):this;
    SCARD(key: string, callback?: Function):this;

    script(args: Array<any>, callback?: Function):this;
    SCRIPT(args: Array<any>, callback?: Function):this;
    script(key: string, args: Array<any>, callback?: Function):this;
    SCRIPT(key: string, args: Array<any>, callback?: Function):this;

    sdiff(args: Array<any>, callback?: Function):this;
    SDIFF(args: Array<any>, callback?: Function):this;
    sdiff(key: string, args: Array<any>, callback?: Function):this;
    SDIFF(key: string, args: Array<any>, callback?: Function):this;

    sdiffstore(args: Array<any>, callback?: Function):this;
    SDIFFSTORE(args: Array<any>, callback?: Function):this;
    sdiffstore(key: string, args: Array<any>, callback?: Function):this;
    SDIFFSTORE(key: string, args: Array<any>, callback?: Function):this;

    select(key: string, callback?: Function):this;
    SELECT(key: string, callback?: Function):this;

    set(args: Array<any>, callback?: Function):this;
    SET(args: Array<any>, callback?: Function):this;
    set(key: string, args: Array<any>, callback?: Function):this;
    SET(key: string, args: Array<any>, callback?: Function):this;

    setbit(key: string, v1: any, v2: any, callback?: Function):this;
    SETBIT(key: string, v1: any, v2: any, callback?: Function):this;

    setex(key: string, v1: any, v2: any, callback?: Function):this;
    SETEX(key: string, v1: any, v2: any, callback?: Function):this;

    setnx(key: string, val: any, callback?: Function):this;
    SETNX(key: string, val: any, callback?: Function):this;

    setrange(key: string, v1: any, v2: any, callback?: Function):this;
    SETRANGE(key: string, v1: any, v2: any, callback?: Function):this;

    shutdown(callback?: Function):this;
    SHUTDOWN(callback?: Function):this;

    sinter(args: Array<any>, callback?: Function):this;
    SINTER(args: Array<any>, callback?: Function):this;
    sinter(key: string, args: Array<any>, callback?: Function):this;
    SINTER(key: string, args: Array<any>, callback?: Function):this;

    sinterstore(args: Array<any>, callback?: Function):this;
    SINTERSTORE(args: Array<any>, callback?: Function):this;
    sinterstore(key: string, args: Array<any>, callback?: Function):this;
    SINTERSTORE(key: string, args: Array<any>, callback?: Function):this;

    sismember(key: string, val: any, callback?: Function):this;
    SISMEMBER(key: string, val: any, callback?: Function):this;

    slaveof(key: string, val: any, callback?: Function):this;
    SLAVEOF(key: string, val: any, callback?: Function):this;

    slowlog(args: Array<any>, callback?: Function):this;
    SLOWLOG(args: Array<any>, callback?: Function):this;
    slowlog(key: string, args: Array<any>, callback?: Function):this;
    SLOWLOG(key: string, args: Array<any>, callback?: Function):this;

    smembers(key: string, callback?: Function):this;
    SMEMBERS(key: string, callback?: Function):this;

    smove(key: string, v1: any, v2: any, callback?: Function):this;
    SMOVE(key: string, v1: any, v2: any, callback?: Function):this;

    sort(args: Array<any>, callback?: Function):this;
    SORT(args: Array<any>, callback?: Function):this;
    sort(key: string, args: Array<any>, callback?: Function):this;
    SORT(key: string, args: Array<any>, callback?: Function):this;

    spop(args: Array<any>, callback?: Function):this;
    SPOP(args: Array<any>, callback?: Function):this;
    spop(key: string, args: Array<any>, callback?: Function):this;
    SPOP(key: string, args: Array<any>, callback?: Function):this;

    srandmember(args: Array<any>, callback?: Function):this;
    SRANDMEMBER(args: Array<any>, callback?: Function):this;
    srandmember(key: string, args: Array<any>, callback?: Function):this;
    SRANDMEMBER(key: string, args: Array<any>, callback?: Function):this;

    srem(args: Array<any>, callback?: Function):this;
    SREM(args: Array<any>, callback?: Function):this;
    srem(key: string, args: Array<any>, callback?: Function):this;
    SREM(key: string, args: Array<any>, callback?: Function):this;

    sscan(args: Array<any>, callback?: Function):this;
    SSCAN(args: Array<any>, callback?: Function):this;
    sscan(key: string, args: Array<any>, callback?: Function):this;
    SSCAN(key: string, args: Array<any>, callback?: Function):this;

    strlen(key: string, callback?: Function):this;
    STRLEN(key: string, callback?: Function):this;

    subscribe(args: Array<any>, callback?: Function):this;
    SUBSCRIBE(args: Array<any>, callback?: Function):this;
    subscribe(key: string, args: Array<any>, callback?: Function):this;
    SUBSCRIBE(key: string, args: Array<any>, callback?: Function):this;

    substr(key: string, v1: any, v2: any, callback?: Function):this;
    SUBSTR(key: string, v1: any, v2: any, callback?: Function):this;

    sunion(args: Array<any>, callback?: Function):this;
    SUNION(args: Array<any>, callback?: Function):this;
    sunion(key: string, args: Array<any>, callback?: Function):this;
    SUNION(key: string, args: Array<any>, callback?: Function):this;

    sunionstore(args: Array<any>, callback?: Function):this;
    SUNIONSTORE(args: Array<any>, callback?: Function):this;
    sunionstore(key: string, args: Array<any>, callback?: Function):this;
    SUNIONSTORE(key: string, args: Array<any>, callback?: Function):this;

    swapdb(key: string, val: any, callback?: Function):this;
    SWAPDB(key: string, val: any, callback?: Function):this;

    sync(callback?: Function):this;
    SYNC(callback?: Function):this;

    time(callback?: Function):this;
    TIME(callback?: Function):this;

    touch(args: Array<any>, callback?: Function):this;
    TOUCH(args: Array<any>, callback?: Function):this;
    touch(key: string, args: Array<any>, callback?: Function):this;
    TOUCH(key: string, args: Array<any>, callback?: Function):this;

    ttl(key: string, callback?: Function):this;
    TTL(key: string, callback?: Function):this;

    type(key: string, callback?: Function):this;
    TYPE(key: string, callback?: Function):this;

    unlink(args: Array<any>, callback?: Function):this;
    UNLINK(args: Array<any>, callback?: Function):this;
    unlink(key: string, args: Array<any>, callback?: Function):this;
    UNLINK(key: string, args: Array<any>, callback?: Function):this;

    unsubscribe(callback?: Function):this;
    UNSUBSCRIBE(callback?: Function):this;

    unwatch(callback?: Function):this;
    UNWATCH(callback?: Function):this;

    wait(key: string, val: any, callback?: Function):this;
    WAIT(key: string, val: any, callback?: Function):this;

    watch(args: Array<any>, callback?: Function):this;
    WATCH(args: Array<any>, callback?: Function):this;
    watch(key: string, args: Array<any>, callback?: Function):this;
    WATCH(key: string, args: Array<any>, callback?: Function):this;

    zadd(args: Array<any>, callback?: Function):this;
    ZADD(args: Array<any>, callback?: Function):this;
    zadd(key: string, args: Array<any>, callback?: Function):this;
    ZADD(key: string, args: Array<any>, callback?: Function):this;

    zcard(key: string, callback?: Function):this;
    ZCARD(key: string, callback?: Function):this;

    zcount(key: string, v1: any, v2: any, callback?: Function):this;
    ZCOUNT(key: string, v1: any, v2: any, callback?: Function):this;

    zincrby(key: string, v1: any, v2: any, callback?: Function):this;
    ZINCRBY(key: string, v1: any, v2: any, callback?: Function):this;

    zinterstore(args: Array<any>, callback?: Function):this;
    ZINTERSTORE(args: Array<any>, callback?: Function):this;
    zinterstore(key: string, args: Array<any>, callback?: Function):this;
    ZINTERSTORE(key: string, args: Array<any>, callback?: Function):this;

    zlexcount(key: string, v1: any, v2: any, callback?: Function):this;
    ZLEXCOUNT(key: string, v1: any, v2: any, callback?: Function):this;

    zrange(args: Array<any>, callback?: Function):this;
    ZRANGE(args: Array<any>, callback?: Function):this;
    zrange(key: string, args: Array<any>, callback?: Function):this;
    ZRANGE(key: string, args: Array<any>, callback?: Function):this;

    zrangebylex(args: Array<any>, callback?: Function):this;
    ZRANGEBYLEX(args: Array<any>, callback?: Function):this;
    zrangebylex(key: string, args: Array<any>, callback?: Function):this;
    ZRANGEBYLEX(key: string, args: Array<any>, callback?: Function):this;

    zrangebyscore(args: Array<any>, callback?: Function):this;
    ZRANGEBYSCORE(args: Array<any>, callback?: Function):this;
    zrangebyscore(key: string, args: Array<any>, callback?: Function):this;
    ZRANGEBYSCORE(key: string, args: Array<any>, callback?: Function):this;

    zrank(key: string, val: any, callback?: Function):this;
    ZRANK(key: string, val: any, callback?: Function):this;

    zrem(args: Array<any>, callback?: Function):this;
    ZREM(args: Array<any>, callback?: Function):this;
    zrem(key: string, args: Array<any>, callback?: Function):this;
    ZREM(key: string, args: Array<any>, callback?: Function):this;

    zremrangebylex(key: string, v1: any, v2: any, callback?: Function):this;
    ZREMRANGEBYLEX(key: string, v1: any, v2: any, callback?: Function):this;

    zremrangebyrank(key: string, v1: any, v2: any, callback?: Function):this;
    ZREMRANGEBYRANK(key: string, v1: any, v2: any, callback?: Function):this;

    zremrangebyscore(key: string, v1: any, v2: any, callback?: Function):this;
    ZREMRANGEBYSCORE(key: string, v1: any, v2: any, callback?: Function):this;

    zrevrange(args: Array<any>, callback?: Function):this;
    ZREVRANGE(args: Array<any>, callback?: Function):this;
    zrevrange(key: string, args: Array<any>, callback?: Function):this;
    ZREVRANGE(key: string, args: Array<any>, callback?: Function):this;

    zrevrangebylex(args: Array<any>, callback?: Function):this;
    ZREVRANGEBYLEX(args: Array<any>, callback?: Function):this;
    zrevrangebylex(key: string, args: Array<any>, callback?: Function):this;
    ZREVRANGEBYLEX(key: string, args: Array<any>, callback?: Function):this;

    zrevrangebyscore(args: Array<any>, callback?: Function):this;
    ZREVRANGEBYSCORE(args: Array<any>, callback?: Function):this;
    zrevrangebyscore(key: string, args: Array<any>, callback?: Function):this;
    ZREVRANGEBYSCORE(key: string, args: Array<any>, callback?: Function):this;

    zrevrank(key: string, val: any, callback?: Function):this;
    ZREVRANK(key: string, val: any, callback?: Function):this;

    zscan(args: Array<any>, callback?: Function):this;
    ZSCAN(args: Array<any>, callback?: Function):this;
    zscan(key: string, args: Array<any>, callback?: Function):this;
    ZSCAN(key: string, args: Array<any>, callback?: Function):this;

    zscore(key: string, val: any, callback?: Function):this;
    ZSCORE(key: string, val: any, callback?: Function):this;

    zunionstore(args: Array<any>, callback?: Function):this;
    ZUNIONSTORE(args: Array<any>, callback?: Function):this;
    zunionstore(key: string, args: Array<any>, callback?: Function):this;
    ZUNIONSTORE(key: string, args: Array<any>, callback?: Function):this;

  }

  declare var createClient: ((options?: Object) => RedisClient)
    & ((port: number, options?: Object) => RedisClient)
    & ((path: string, options?: Object) => RedisClient);
  declare var print: any;
  declare var Multi: any;
  declare var AbortError: any;
  declare var ReplyError: any;
  declare var AggregateError: any;
}
