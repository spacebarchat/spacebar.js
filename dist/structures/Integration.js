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
const Base = require('./Base');
const IntegrationApplication = require('./IntegrationApplication');
/**
 * The information account for an integration
 * @typedef {Object} IntegrationAccount
 * @property {string} id The id of the account
 * @property {string} name The name of the account
 */
/**
 *  Represents a guild integration.
 */
class Integration extends Base {
    constructor(client, data, guild) {
        super(client);
        /**
         * The guild this integration belongs to
         * @type {Guild}
         */
        this.guild = guild;
        /**
         * The integration id
         * @type {Snowflake}
         */
        this.id = data.id;
        /**
         * The integration name
         * @type {string}
         */
        this.name = data.name;
        /**
         * The integration type (twitch, youtube, etc)
         * @type {string}
         */
        this.type = data.type;
        /**
         * Whether this integration is enabled
         * @type {boolean}
         */
        this.enabled = data.enabled;
        /**
         * Whether this integration is syncing
         * @type {boolean}
         */
        this.syncing = data.syncing;
        /**
         * The role that this integration uses for subscribers
         * @type {Role}
         */
        this.role = this.guild.roles.cache.get(data.role_id);
        if (data.user) {
            /**
             * The user for this integration
             * @type {?User}
             */
            this.user = this.client.users._add(data.user);
        }
        else {
            this.user = null;
        }
        /**
         * The account integration information
         * @type {IntegrationAccount}
         */
        this.account = data.account;
        /**
         * The last time this integration was last synced
         * @type {number}
         */
        this.syncedAt = data.synced_at;
        this._patch(data);
    }
    /**
     * All roles that are managed by this integration
     * @type {Collection<Snowflake, Role>}
     * @readonly
     */
    get roles() {
        const roles = this.guild.roles.cache;
        return roles.filter(role => { var _a; return ((_a = role.tags) === null || _a === void 0 ? void 0 : _a.integrationId) === this.id; });
    }
    _patch(data) {
        /**
         * The behavior of expiring subscribers
         * @type {number}
         */
        this.expireBehavior = data.expire_behavior;
        /**
         * The grace period before expiring subscribers
         * @type {number}
         */
        this.expireGracePeriod = data.expire_grace_period;
        if ('application' in data) {
            if (this.application) {
                this.application._patch(data.application);
            }
            else {
                /**
                 * The application for this integration
                 * @type {?IntegrationApplication}
                 */
                this.application = new IntegrationApplication(this.client, data.application);
            }
        }
        else if (!this.application) {
            this.application = null;
        }
    }
    /**
     * Deletes this integration.
     * @returns {Promise<Integration>}
     * @param {string} [reason] Reason for deleting this integration
     */
    delete(reason) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.api.guilds(this.guild.id).integrations(this.id).delete({ reason });
            return this;
        });
    }
    toJSON() {
        return super.toJSON({
            role: 'roleId',
            guild: 'guildId',
            user: 'userId',
        });
    }
}
module.exports = Integration;
