// @ts-nocheck
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Collection = require('../util/Collection');
const CachedManager = require('./CachedManager');
const { TypeError } = require('../errors');
const ThreadMember = require('../structures/ThreadMember');
/**
 * Manages API methods for GuildMembers and stores their cache.
 * @extends {CachedManager}
 */
class ThreadMemberManager extends CachedManager {
    constructor(thread, iterable) {
        super(thread.client, ThreadMember, iterable);
        /**
         * The thread this manager belongs to
         * @type {ThreadChannel}
         */
        this.thread = thread;
    }
    /**
     * The cache of this Manager
     * @type {Collection<Snowflake, ThreadMember>}
     * @name ThreadMemberManager#cache
     */
    _add(data, cache = true) {
        const existing = this.cache.get(data.user_id);
        if (cache)
            existing === null || existing === void 0 ? void 0 : existing._patch(data);
        if (existing)
            return existing;
        const member = new ThreadMember(this.thread, data);
        if (cache)
            this.cache.set(data.user_id, member);
        return member;
    }
    /**
     * Data that resolves to give a ThreadMember object. This can be:
     * * A ThreadMember object
     * * A User resolvable
     * @typedef {ThreadMember|UserResolvable} ThreadMemberResolvable
     */
    /**
     * Resolves a {@link ThreadMemberResolvable} to a {@link ThreadMember} object.
     * @param {ThreadMemberResolvable} member The user that is part of the thread
     * @returns {?GuildMember}
     */
    resolve(member) {
        const memberResolvable = super.resolve(member);
        if (memberResolvable)
            return memberResolvable;
        const userResolvable = this.client.users.resolveId(member);
        if (userResolvable)
            return super.resolve(userResolvable);
        return null;
    }
    /**
     * Resolves a {@link ThreadMemberResolvable} to a {@link ThreadMember} id string.
     * @param {ThreadMemberResolvable} member The user that is part of the guild
     * @returns {?Snowflake}
     */
    resolveId(member) {
        const memberResolvable = super.resolveId(member);
        if (memberResolvable)
            return memberResolvable;
        const userResolvable = this.client.users.resolveId(member);
        return this.cache.has(userResolvable) ? userResolvable : null;
    }
    /**
     * Adds a member to the thread.
     * @param {UserResolvable|'@me'} member The member to add
     * @param {string} [reason] The reason for adding this member
     * @returns {Promise<Snowflake>}
     */
    add(member, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = member === '@me' ? member : this.client.users.resolveId(member);
            if (!id)
                throw new TypeError('INVALID_TYPE', 'member', 'UserResolvable');
            yield this.client.api.channels(this.thread.id, 'thread-members', id).put({ reason });
            return id;
        });
    }
    /**
     * Remove a user from the thread.
     * @param {Snowflake|'@me'} id The id of the member to remove
     * @param {string} [reason] The reason for removing this member from the thread
     * @returns {Promise<Snowflake>}
     */
    remove(id, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.api.channels(this.thread.id, 'thread-members', id).delete({ reason });
            return id;
        });
    }
    /**
     * Fetches member(s) for the thread from Discord, requires access to the `GUILD_MEMBERS` gateway intent.
     * @param {boolean} [cache=true] Whether or not to cache the fetched members
     * @returns {Promise<Collection<Snowflake, ThreadMember>>}
     */
    fetch(cache = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const raw = yield this.client.api.channels(this.thread.id, 'thread-members').get();
            return raw.reduce((col, rawMember) => {
                const member = this._add(rawMember, cache);
                return col.set(member.id, member);
            }, new Collection());
        });
    }
}
module.exports = ThreadMemberManager;
