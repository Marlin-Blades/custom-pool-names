export class PoolSettings {
  static async createPoolNameFlags(actor) {
    if (!actor) return;
    
    // Initialize default pool names if they don't exist
    if (!actor.getFlag('custom-pool-names', 'mightName')) {
      await actor.setFlag('custom-pool-names', 'mightName', 'Might');
    }
    if (!actor.getFlag('custom-pool-names', 'speedName')) {
      await actor.setFlag('custom-pool-names', 'speedName', 'Speed');
    }
    if (!actor.getFlag('custom-pool-names', 'intellectName')) {
      await actor.setFlag('custom-pool-names', 'intellectName', 'Intellect');
    }
  }

  static getPoolNames(actor) {
    return {
      might: actor.getFlag('custom-pool-names', 'mightName') || 'Might',
      speed: actor.getFlag('custom-pool-names', 'speedName') || 'Speed',
      intellect: actor.getFlag('custom-pool-names', 'intellectName') || 'Intellect'
    };
  }

  static async updatePoolName(actor, poolType, newName) {
    if (!actor) return;
    await actor.setFlag('custom-pool-names', `${poolType}Name`, newName);
  }
}